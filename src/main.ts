import { setFailed, setOutput } from "@actions/core";

import { instantiateError } from "./utils";
import { getCheckedActionInput, getPullRequestBranchName } from "./github";
import { extractIssueIdFromBranchName, instantiateLinearClient, postCommentInLinearIssue } from "./linear";

export const run = async (): Promise<void> => {
  try {
    const inSelfTestMode = getCheckedActionInput("performTestRun", false) === "true";

    // Mandatory fixed inputs
    const linearApiKey = getCheckedActionInput("linearApiKey", true);
    const linearCommentText = getCheckedActionInput("linearCommentText", true);

    // "Computed" parameters
    const prBranchName = inSelfTestMode ? getPullRequestBranchName() : getCheckedActionInput("githubPullRequestBranchName", true);
    if (!prBranchName) {
      throw instantiateError("cannot get Pull Request branch name.");
    }

    const linearIssueId = extractIssueIdFromBranchName(prBranchName);
    if (!linearIssueId) {
      console.log(`DEBUG: prBranchName=${prBranchName}`);
      throw instantiateError("could not extract Linear Issue ID from Pull Request branch name.");
    }

    // "Empty run" mode: log, set empty outputs and exit.
    // This is used to perform a self-referencing, live testing of this action, from its own repository.
    // !IF MODIFIED, no secret information must be leaked here (like linearApiKey)! In fact, just don't print input parameters.
    if (inSelfTestMode) {
      console.log("=== TEST RUN ===");
      console.log(`=> PR_BRANCH_NAME=${prBranchName}`); // no problem printing this, source branch name of the PR triggering the parent workflow
      console.log(`=> LINEAR_ISSUE_ID=${linearIssueId}`); // just the first letters of the above, so same
      // ensure we respect our Action "contract" still, for downstream Actions for instance
      setOutput("postedLinearCommentId", "");
      setOutput("postedOnLinearIssueId", "");
      return;
    }

    // Linear API usage
    const linearClient = instantiateLinearClient(linearApiKey);
    const { postedCommentId, postedOnIssueId } = await postCommentInLinearIssue(linearClient, linearIssueId, linearCommentText);

    // Action outputs
    setOutput("postedLinearCommentId", postedCommentId);
    setOutput("postedOnLinearIssueId", postedOnIssueId);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    setFailed(message);
  }
};

run();
