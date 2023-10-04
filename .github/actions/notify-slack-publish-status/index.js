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
  const message = core.getInput('message');

  if (!message) {
    throw new Error('No message input found');
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
