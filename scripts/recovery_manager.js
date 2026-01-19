module.exports = async ({ github, context }) => {
  const issues = await github.rest.issues.listForRepo({
    owner: context.repo.owner,
    repo: context.repo.repo,
    labels: '⏳ rate-limited',
    state: 'open'
  });

  if (issues.data.length === 0) {
    console.log("⏸️ No work to do. Exiting.");
    return; 
  }

  const rateLimit = await github.rest.rateLimit.get();
  const remaining = rateLimit.data.resources.core.remaining;
  
  if (remaining < 50) { 
    console.log("⏳ Still cooling down... will try next hour.");
    return;
  }

  for (const issue of issues.data) {
    console.log(`🚀 Conditions met. Restarting Issue #${issue.number}`);
    
    await github.rest.actions.createWorkflowDispatch({
      owner: context.repo.owner,
      repo: context.repo.repo,
      workflow_id: 'issue_gatekeeper.yml',
      ref: 'main',
      inputs: { issue_number: issue.number.toString() }
    });

    await github.rest.issues.removeLabel({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue.number,
      name: '⏳ rate-limited'
    });
  }
};