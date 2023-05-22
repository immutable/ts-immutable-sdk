import { html } from 'lit-html';

const meta = {
  title: 'Crafting/widget',
  args: {
    gameId: 'pokemon',
    userId: 'pokemon_master',
    walletAddress: '0x',
  },
};
export default meta;

const Template = (args: any) => {
  return html`
    <crafting-widget game-id="${args.gameId}" user-id="${args.userId}" wallet-address="${args.walletAddress}"></crafting-widget>
  `;
};

export const Widget: any = Template.bind({});
Widget.args = {};
