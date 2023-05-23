import { html } from 'lit-html';

const meta = {
  title: 'Crafting/imtbl-crafting-widget',
  args: {
    gameId: 'pokemon',
    owner: 'pokemon_master',
    // owner: '0x862e',
    recipeId: 'c1da5d0e-f506-4ae4-9d9d-00958be06d58'
  },
};
export default meta;

const Template = (args: any) => {
  return html`
    <imtbl-crafting-widget game-id="${args.gameId}" owner="${args.owner}" recipe-id=${args.recipeId}></imtbl-crafting-widget>
  `;
};

export const Widget: any = Template.bind({});
Widget.args = {};
