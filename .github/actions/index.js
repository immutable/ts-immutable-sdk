const core = require('@actions/core');
const { WebClient } = require('@slack/web-api');
const web = process.env.SLACK_TOKEN && new WebClient(process.env.SLACK_TOKEN);
const channel = `C051FKT784S` // #team-sdk channel

const run = async () => {
  if (web) {
    try {
      await postSlackNotification();
    } catch (e) {
      console.log(e);
      throw new Error(`failed because : ${e}`)
    }
  } else {
    throw new Error('No SLACK_TOKEN environment variable found');
  }
}

const postSlackNotification = async () => {
  const status = core.getInput('status');
  const version = core.getInput('version');
  const docsUrl = core.getInput('docs_pr_url');
  let message = '';

  if (version === '0.0.0') return;

  if (status === 'success') {
    message = `✅ Version ${version} of the SDK has been deployed to NPM 🎉`;

    if (docsUrl) {
      message += `\n\nYou can view the SDK reference docs PR here: ${docsUrl}`
    }
  } else {
    message = `❌ Version ${version} of the SDK failed to deploy to NPM`;
  }

  await web.chat.postMessage({
    channel,
    username: 'Github workflow alert bot',
    blocks: [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: message,
      },
    }]
  })
}

run();
