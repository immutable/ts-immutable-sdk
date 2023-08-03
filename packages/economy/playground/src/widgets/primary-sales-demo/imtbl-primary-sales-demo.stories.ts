import { html } from 'lit-html';

const meta = {
  title: 'Primary Sales/imtbl-primary-sales-demo',

};
export default meta;

const Template = (args: any) => {
  return html`
    <imtbl-primary-sales-demo></imtbl-primary-sales-demo>
  `;
};

export const Widget: any = Template.bind({});
Widget.args = {};
