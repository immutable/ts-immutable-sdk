import { html } from 'lit-html';

const meta = {
  title: 'Archive/imtbl-craft-button',
};
export default meta;

const Template = () => html`
  <imtbl-craft-button>
    <button class="btn">Craft Now</button>
  </imtbl-craft-button>
`;

export const Widget: any = Template.bind({});
Widget.args = {};
