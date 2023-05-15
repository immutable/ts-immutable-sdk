import { html } from 'lit-html';

const meta = {
  title: 'Archive/imtbl-craft-checkout-connect',
};
export default meta;

const Template = () => html`
  <imtbl-craft-checkout-connect>
    <button class="btn" slot="connect-button">Craft Checkout Connect</button>
    <imtbl-connect
      slot="connect-widget"
      id="imtbl-connect"
      providerPreference="metamask"
      theme="dark"
    ></imtbl-connect>
  </imtbl-craft-checkout-connect>
`;

export const Widget: any = Template.bind({});
Widget.args = {};
