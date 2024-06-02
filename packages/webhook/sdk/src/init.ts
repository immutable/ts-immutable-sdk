import MessageValidator from 'sns-validator';
import { Environment } from '@imtbl/config';

const validator = new MessageValidator();

const allowedTopicArnPrefix = {
  [Environment.PRODUCTION]: 'arn:aws:sns:us-east-2:362750628221:',
  [Environment.SANDBOX]: 'arn:aws:sns:us-east-2:783421985614:'
};

/**
 * handle will validate webhook message origin and verify signature of the message and calls corresponding handlers passed in.
 * @param body The request body to a webhook endpoint in json string or js object form.
 * @param env The Immutable environment the webhook is set up for.
 * @param handlers The optional handlers object for different events. The `all` handler will be triggered for all event types.
 * @returns The event object from the webhook message after validation and verification.
 */
export const handle = async (
  body: string | Record<string, unknown>,
  env: Environment,
  handlers?: {
    zkevmMintRequestUpdated?: (event: any) => Promise<void>;
    all?: (event: any) => Promise<void>;
  }
) => {
  const msg: any = await new Promise((resolve, reject) => {
    validator.validate(body, (err, message: any) => {
      if (err) {
        return reject(err);
      }

      // check for topic arn prefix
      if (!message.TopicArn.startsWith(allowedTopicArnPrefix[env])) {
        throw new Error('Invalid topic arn');
      }

      if (message?.Type === 'SubscriptionConfirmation') {
        fetch(message.SubscribeURL).then(() => {
          resolve(message);
        }).catch((e) => {
          reject(e);
        });
      }
      return resolve(message);
    });
  });

  const event = JSON.parse(msg.Message);
  if (msg.Type === 'Notification') {
    switch (event.event_name) {
      case 'imtbl_zkevm_mint_request_updated':
        if (handlers?.zkevmMintRequestUpdated) {
          await handlers?.zkevmMintRequestUpdated(event);
        }
        break;
      default:
        break;
    }
    if (handlers?.all) {
      await handlers?.all(event);
    }
  }

  return event;
};
