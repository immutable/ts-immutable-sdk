import { html } from 'lit-html';

const meta = {
  title: 'Crafting/crafting-widget',
};
export default meta;

const Template = () => html`
  <crafting-widget game-id="minecraft" user-id="jimmy-test" wallet-address="0x"></crafting-widget>
`;

export const Widget: any = Template.bind({});
Widget.args = {};
