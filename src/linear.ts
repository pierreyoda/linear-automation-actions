import { LinearClient } from "@linear/sdk";

import { instantiateError } from "./utils";

const LINEAR_BRANCH_NAME_PREFIX = "feature/";

/**
 * Get the Linear Issue ID from the Pull Request branch name.
 *
 * It is assumed that the usual Linear approach of using the automatically generated branch name
 * is used, since these branch names always start with the issue ID.
 *
 * This function should not throw an exception, but return `null` in all error paths.
 *
 * ## Supported format
 *
 * If you use a custom branch naming convention, this method **WILL NOT** work without modification.
 *
 * For various (including security) reasons, providing an optional custom REGEX as input would not be
 * an acceptable approach without appropriate (and too heavy for the scope of this plugin) sanitation/handling.
 *
 * Another solution, providing only the prefix (like feature/), may not even be enough for every case and, more of a blocker,
 * it may not even cover all different teams in a single company if slightly different conventions are used.
 *
 * In short, due to the customization offered by Linear, the issue ID (always present) cannot be that easily identified,
 * at least not in a more or less brittle way. This function is thus adapted to a "vanilla" Linear branches handling configuration,
 * but may be extended to other "common" formats with little effort once more use cases appear.
 *
 * The currently supported format is as following: "feature/[$PREFIX-$INTEGER]..."
 *
 * @see https://linear.app/docs/github#link-prs
 * @see https://newsletter.linear.app/issues/linear-changelog-git-branch-naming-and-estimation-settings-238773
 */
export const extractIssueIdFromBranchName = (prBranchName: string): string | null => {
  if (!prBranchName.startsWith(LINEAR_BRANCH_NAME_PREFIX)) {
    return null;
  }
  const rest = prBranchName.substring(LINEAR_BRANCH_NAME_PREFIX.length);
  const [teamPrefix, rawIssueNumber, ..._parts] = rest.split("-");
  const issueNumber = Number(rawIssueNumber);
  if (!Number.isInteger(issueNumber)) {
    return null;
  }

  return `${teamPrefix.toUpperCase()}-${issueNumber}`;
};

/**
 * Small abstraction just there to not clutter main program flow with the specific options used.
 */
export const instantiateLinearClient = (apiKey: string): LinearClient => new LinearClient({
  apiKey,
});

/**
 * Simple wrapper to avoid dealing with abstraction leakage from Linear SDK specifics.
 */
export const postCommentInLinearIssue = async (client: LinearClient, issueId: string, markdownText: string): Promise<{
  postedCommentId: string;
  /**
   * NB: same value as the input `issueId`.
   *
   * Using the value returned from the API value may be preferable in theory, but would require another `await`, with more possible error paths.
  */
  postedOnIssueId: string;
}> => {
  const result = await client.commentCreate({
    issueId,
    body: markdownText,
    id: undefined, // just in case the SDK default changes (unlikely); the ID will be auto-generated
  });
  if (!result.success) {
    throw instantiateError("failed to comment the automatically linked issue.");
  }
  if (!result.comment) {
    throw instantiateError("initial request for posting the comment returns success but no way to access the posted comment data, cannot provide outputs.");
  }
  const comment = await result.comment;
  if (!comment) {
    throw instantiateError("request returns success but not comment data present, cannot provide outputs.");
  }
  return {
    postedCommentId: comment.id,
    postedOnIssueId: issueId,
  };
};
