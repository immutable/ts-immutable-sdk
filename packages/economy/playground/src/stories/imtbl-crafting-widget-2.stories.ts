import { html } from 'lit-html';

const meta = {
  title: 'Crafting/Card Upgrade 2',
  component: 'imtbl-crafting-widget-2',
};
export default meta;

const Template = () => {
  document.querySelector('[src*="tailwind"]')?.remove();
  document.querySelector('[href*="daisyui"]')?.remove();

  return html`<imtbl-crafting-widget-2> </imtbl-crafting-widget-2> `;
};

export const imtblCraftingWidget2: any = Template.bind({});
imtblCraftingWidget2.args = {};
