const core = require('@actions/core');
const webhook = core.getInput('webhook-url');

const run = async () => {
  if (webhook) {
    try {
      await postSlackNotification();
    } catch (e) {
      console.log(e);
      throw new Error(`failed because : ${e}`)
    }
  } else {
    throw new Error('No SDK_PUBLISH_SLACK_WEBHOOK environment variable found');
  }
}

const postSlackNotification = async () => {
  const message = core.getInput('message');

  if (!message) {
    throw new Error('No message input found');
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: message,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          }
        }
      ]
    }),
  };

  const response = await fetch(webhook, options);
  
  if (response.status == 200) {
    console.log('Posted message to Slack successfully');
  } else {
    throw new Error(`Failed to post message to Slack. Status code: ${response.status}`);
  }
}

run();
