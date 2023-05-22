import { html } from 'lit-html';

const meta = {
  title: 'Crafting/crafting-widget',
};
export default meta;

const Template = () => html`
  <crafting-widget game-id="" user-id="" wallet-address=""></crafting-widget>
`;

export const Widget: any = Template.bind({});
Widget.args = {};
