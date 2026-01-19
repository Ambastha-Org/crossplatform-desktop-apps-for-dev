module.exports = async ({ github, context, prNumber }) => {
  if (!prNumber) return;

  await github.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    body: `🔗 **Registry Update Staged**: This tool has been added to the batch update in Pull Request #${prNumber}.`
  });
};