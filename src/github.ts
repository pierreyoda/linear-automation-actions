import { getInput } from "@actions/core";

import { instantiateError } from "./utils";

/**
 * Straightforward `getInput` (from the GitHub Actions toolkit) wrapper to ensure the requested input is present and defined.
 *
 * NB: as documented, `getInput` returns an empty string if not found.
 *
 * @throws If the input is required and not present, `getInput` will throw. See its documentation.
 */
export const getCheckedActionInput = <R extends boolean>(inputName: string, isRequired: R): R extends true ? string : string | null => {
  const input = getInput(inputName, {
    required: isRequired,
    trimWhitespace: true,
  });
  if (!input) {
    if (isRequired) {
      // unreachable if `isRequired` respects the `action.yml` value for the given input, but let's make sure nothing funny happens
      throw instantiateError(`missing required input "${inputName}"`);
    }
    // @ts-expect-error FIXME: unfortunately this still seems needed with Typescript 4.9.x, look into it; does not impact usage of the function
    return null;
  }
  return input;
};

/**
 * Safely get the branch name of the incoming Pull Request running the CI/CD Workflow using this Action.
 *
 * Corresponds to `GITHUB_REF_NAME` from `process.env` (guaranteed presence) to get the branch name of the incoming Pull Request.
 *
 * **IMPORTANT**: does not work when calling from an external workflow, use the `githubPullRequestName` input instead.
 *
 * **Keeping this function for test mode only.**
 *
 * @see https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
 */
export const getPullRequestBranchName = (): string | null => {
  const { GITHUB_HEAD_REF } = process.env;
  return GITHUB_HEAD_REF ? GITHUB_HEAD_REF : null; // not using ?? just in case the string is empty ''
};
