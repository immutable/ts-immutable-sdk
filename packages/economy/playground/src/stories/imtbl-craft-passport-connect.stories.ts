import { html } from 'lit-html';

const meta = {
  title: 'Archive/imtbl-craft-passport-connect',
};
export default meta;

const Template = () => html`
  <imtbl-craft-passport-connect
    env="dev"
    clientId="3Xt3vBGjrsuLnBKK3mtJsIU5j5WikfQC"
    redirectUri="http://localhost:4200/"
    logoutRedirectUri="http://localhost:4200/"
  >
    <button class="btn">Connect passport</button>
  </imtbl-craft-passport-connect>
`;

export const Widget: any = Template.bind({});
Widget.args = {};
