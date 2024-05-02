import MessageValidator from 'sns-validator';

const validator = new MessageValidator();

export const init = async (body: string | Record<string, unknown>) => new Promise((resolve, reject) => {
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

export const isNotification = (message: any) => message?.Type === 'Notification';
