import * as core from "@actions/core";

async function run(): Promise<void> {
  const webhook = core.getInput("webhook", { required: true });
  const message = core.getInput("message", { required: true });

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: message,
      blocks: [{ type: "section", text: { type: "mrkdwn", text: message } }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to post message to Slack. Status: ${response.status}`);
  }

  core.info("Posted message to Slack successfully");
}

run().catch((err: unknown) => {
  core.setFailed(err instanceof Error ? err.message : String(err));
});
