import MessageValidator from 'sns-validator';

const validator = new MessageValidator();
const defaultHandlers = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  zkevmMintRequestUpdated: async (event: any) => { }, // TODO: correct type
};

export const init = async (
  body: string | Record<string, unknown>,
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
