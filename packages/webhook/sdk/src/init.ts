import MessageValidator from 'sns-validator';
import { Environment } from '@imtbl/config';

const validator = new MessageValidator();
const defaultHandlers = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  zkevmMintRequestUpdated: async (event: any) => { }, // TODO: correct type
};

const allowedTopicArnPrefix = {
  [Environment.PRODUCTION]: 'arn:aws:sns:us-east-2:362750628221:',
  [Environment.SANDBOX]: 'arn:aws:sns:us-east-2:783421985614:'
};

export const init = async (
  body: string | Record<string, unknown>,
  env: Environment,
  handlers: typeof defaultHandlers = defaultHandlers
) => {
  const msg: any = await new Promise((resolve, reject) => {
    validator.validate(body, (err, message: any) => {
      if (err) {
        return reject(err);
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

  // check for topic arn prefix
  if (!msg.TopicArn.startsWith(allowedTopicArnPrefix[env])) {
    throw new Error('Invalid topic arn');
  }

  if (msg.Type === 'Notification') {
    const event = JSON.parse(msg.Message);
    console.log('event', event);
    switch (event.event_name) {
      case 'imtbl_zkevm_mint_request_updated':
        await handlers.zkevmMintRequestUpdated(event);
        break;
      default:
        console.log('event not handled', event.event_name);
        break;
    }
  }
};
