import { extractIssueIdFromBranchName } from "./linear";

describe("Linear utils", () => {
  it("should properly implement extractIssueIdFromBranchName", () => {
    expect(extractIssueIdFromBranchName("")).toBeNull();
    expect(extractIssueIdFromBranchName("feature/my-issue-branch-issue-id-1234")).toBeNull();
    // at least ensure our current internal teams' branch format works properly
    expect(extractIssueIdFromBranchName("feature/teamA-1038-my-issue-branch")).toEqual("TEAMA-1038");
    expect(extractIssueIdFromBranchName("feature/teamB-4827-another-issue-branch")).toEqual("TEAMB-4827");
    expect(extractIssueIdFromBranchName("feature/teamC-1928-yet-another-issue-branch")).toEqual("TEAMC-1928");
  });
});
