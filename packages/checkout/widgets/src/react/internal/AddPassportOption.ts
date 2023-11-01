import { Passport } from '@imtbl/passport';
import { CheckoutWidgetTagNames } from '../../definitions/types';

export function AddPassportOption(
  tagName: CheckoutWidgetTagNames,
  passport?: Passport,
) {
  if (!passport) {
    // eslint-disable-next-line no-console
    console.error('no passport provided');
    return;
  }
  if (window === undefined) {
    // eslint-disable-next-line no-console
    console.error('missing window object: please run Checkout client side');
    return;
  }

  let attempts = 0;
  const maxAttempts = 10;
  let timer: number;

  const attemptToAddPassport = () => {
    try {
      const elements = document.getElementsByTagName(tagName);
      const widget = elements[0] as unknown as ImmutableWebComponent;
      widget.addPassportOption(passport);
      window.clearInterval(timer);
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
        // eslint-disable-next-line no-console
        console.error('failed to set the provider', err);
      }
    }
  };

  timer = window.setInterval(attemptToAddPassport, 10);
  attemptToAddPassport();
}
