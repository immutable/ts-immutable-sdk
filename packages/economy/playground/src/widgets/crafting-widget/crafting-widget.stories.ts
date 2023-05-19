import { html } from 'lit-html';

const meta = {
  title: 'Crafting/crafting-widget',
};
export default meta;

const Template = () => html`
  <crafting-widget
    game-id="1"
    user-id="1"
    wallet-address="0x1234567890"
  ></crafting-widget>
`;

export const Widget: any = Template.bind({});
Widget.args = {};
