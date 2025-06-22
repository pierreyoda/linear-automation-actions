# linear-automation-actions

Custom GitHub Action dealing with Linear automation. Linear is an issues tracking software solution.

For now, only one workflow is supported.

Feel free to audit the code before using this Action, and please open an issue on this repository if something is not quite right.

## Posting a Linear comment in the branch-linked issue

To post a comment in the linked (by branch name) Linear issue, use this action like this:

```yaml
- name: Post comment in Linear issue
  uses: pierreyoda/linear-automation-actions@v0
  with:
    githubPullRequestBranchName: ${{ github.head_ref }}
    linearApiKey: ${{ secrets.LINEAR_API_KEY }}
    linearCommentText: My awesome comment in **Markdown**.
```

`linearCommentText` is in **Markdown**, but be careful which flavor or specific features you use, Linear may not handle them.

The corresponding outputs (see `action.yml`) are as following:

```yaml
postedLinearCommentId:
  description: The ID of the Linear comment that was posted on the linked issue.
postedOnLinearIssueId:
  description: The linked Linear issue ID on which the comment was posted.
```

This feature was used, with success, for automatically posting Storybook and full-blown preview environments links, both linked to a GitHub Pull Request number (which cannot be retrieved easily, but does work with some elbow grease in the calling GitHub Actions workflow). It was used from a private GitHub repository.

Just post an issue in this repository for assistance with using this feature.

## More automation flows and `v0`

Just wrapping the Linear SDK is simple. Using this GitHub Action in someone else's workflow requires having a specific use-case that is hard to anticipate. If you have one in mind, please do submit an issue so that this Action can be more useful to others.

This Action, despite being in a working state, will stay `v0` until enough different workflows can be supported. This means that its current inputs and outputs *will* change a bit for `v1`, but not for `v0`.

## Implementation Details

Uses the official [GitHub Actions Toolkit](https://github.com/actions/toolkit), with inspiration from the [official Typescript example](https://github.com/actions/typescript-action).

Also uses the official Linear SDK ([GitHub](https://github.com/linear/linear/tree/master/packages/sdk), [documentation](https://developers.linear.app/docs/sdk/getting-started)), as [recommended](https://developers.linear.app/docs/graphql/working-with-the-graphql-api#linear-sdk) over the public GraphQL API, which the SDK wraps. The latest stable version of this SDK should be used here (2.0 right now).

Do note that the `dist/` is not in `.gitignore` for usage in [Javascript GitHub Actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#introduction).

[husky](https://typicode.github.io/husky/#/) is used for a pre-commit hook to ensure the `dist` repository is always up-to-date *and* committed. Be aware that `dist` **will** be staged and thus committed automatically by default.
