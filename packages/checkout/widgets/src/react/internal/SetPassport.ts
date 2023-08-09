import { CheckoutWidgetTagNames } from '../../definitions/types';

export function SetPassport(
  tagName: CheckoutWidgetTagNames,
  passport: any,
) {
  if (!passport) {
    // eslint-disable-next-line no-console
    console.error('no passport');
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

  const attemptToSetPassport = () => {
    try {
      const elements = document.getElementsByTagName(tagName);
      const widget = elements[0] as unknown as ImmutableWebComponent;
      widget.setPassport(passport);
      window.clearInterval(timer);
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
        // eslint-disable-next-line no-console
        console.error('failed to set the passport');
      }
    }
  };

  timer = window.setInterval(attemptToSetPassport, 10);
  attemptToSetPassport();
}
