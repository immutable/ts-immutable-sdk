import{r as m,M as x}from"./index-0e014c14.js";import{u as c}from"./index-1c51b1f5.js";import"./iframe-6aa095a6.js";import"../sb-preview/runtime.js";import"./index-41fe3f86.js";import"./index-d37d4223.js";import"./index-6f63b3d8.js";import"./index-356e4a49.js";var p={exports:{}},o={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var g=m,f=Symbol.for("react.element"),j=Symbol.for("react.fragment"),u=Object.prototype.hasOwnProperty,b=g.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,k={key:!0,ref:!0,__self:!0,__source:!0};function h(t,r,a){var s,n={},i=null,l=null;a!==void 0&&(i=""+a),r.key!==void 0&&(i=""+r.key),r.ref!==void 0&&(l=r.ref);for(s in r)u.call(r,s)&&!k.hasOwnProperty(s)&&(n[s]=r[s]);if(t&&t.defaultProps)for(s in r=t.defaultProps,r)n[s]===void 0&&(n[s]=r[s]);return{$$typeof:f,type:t,key:i,ref:l,props:n,_owner:b.current}}o.Fragment=j;o.jsx=h;o.jsxs=h;p.exports=o;var e=p.exports;function d(t){const r=Object.assign({h1:"h1",p:"p",strong:"strong",code:"code",a:"a"},c(),t.components);return e.jsxs(e.Fragment,{children:[e.jsx(x,{title:"Introduction"}),`
`,e.jsx("style",{children:`
    .subheading {
      --mediumdark: '#999999';
      font-weight: 700;
      font-size: 13px;
      color: #999;
      letter-spacing: 6px;
      line-height: 24px;
      text-transform: uppercase;
      margin-bottom: 12px;
      margin-top: 40px;
    }

    .link-list {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
      row-gap: 10px;
    }

    @media (min-width: 620px) {
      .link-list {
        row-gap: 20px;
        column-gap: 20px;
        grid-template-columns: 1fr 1fr;
      }
    }

    @media all and (-ms-high-contrast:none) {
    .link-list {
        display: -ms-grid;
        -ms-grid-columns: 1fr 1fr;
        -ms-grid-rows: 1fr 1fr;
      }
    }

    .link-item {
      display: block;
      padding: 20px;
      border: 1px solid #00000010;
      border-radius: 5px;
      transition: background 150ms ease-out, border 150ms ease-out, transform 150ms ease-out;
      color: #333333;
      display: flex;
      align-items: flex-start;
    }

    .link-item:hover {
      border-color: #1EA7FD50;
      transform: translate3d(0, -3px, 0);
      box-shadow: rgba(0, 0, 0, 0.08) 0 3px 10px 0;
    }

    .link-item:active {
      border-color: #1EA7FD;
      transform: translate3d(0, 0, 0);
    }

    .link-item strong {
      font-weight: 700;
      display: block;
      margin-bottom: 2px;
    }

    .link-item img {
      height: 40px;
      width: 40px;
      margin-right: 15px;
      flex: none;
    }

    .link-item span,
    .link-item p {
      margin: 0;
      font-size: 14px;
      line-height: 20px;
    }

    .tip {
      display: inline-block;
      border-radius: 1em;
      font-size: 11px;
      line-height: 12px;
      font-weight: 700;
      background: #E7FDD8;
      color: #66BF3C;
      padding: 4px 12px;
      margin-right: 10px;
      vertical-align: top;
    }

    .tip-wrapper {
      font-size: 13px;
      line-height: 20px;
      margin-top: 40px;
      margin-bottom: 40px;
    }

    .tip-wrapper code {
      font-size: 12px;
      display: inline-block;
    }
  `}),`
`,e.jsx(r.h1,{id:"welcome-to-storybook",children:"Welcome to Storybook"}),`
`,e.jsxs(r.p,{children:[`Storybook helps you build UI components in isolation from your app's business logic, data, and context.
That makes it easy to develop hard-to-reach states. Save these UI states as `,e.jsx(r.strong,{children:"stories"})," to revisit during development, testing, or QA."]}),`
`,e.jsxs(r.p,{children:[`Browse example stories now by navigating to them in the sidebar.
View their code in the `,e.jsx(r.code,{children:"stories"}),` directory to learn how they work.
We recommend building UIs with a `,e.jsx(r.a,{href:"https://componentdriven.org",target:"_blank",rel:"nofollow noopener noreferrer",children:e.jsx(r.strong,{children:"component-driven"})})," process starting with atomic components and ending with pages."]}),`
`,e.jsx("div",{className:"subheading",children:"Configure"}),`
`,e.jsxs("div",{className:"link-list",children:[e.jsx("a",{className:"link-item",href:"https://storybook.js.org/docs/react/addons/addon-types",target:"_blank",children:e.jsx("span",{children:e.jsxs(r.p,{children:[e.jsx("strong",{children:"Presets for popular tools"}),`
Easy setup for TypeScript, SCSS and more.`]})})}),e.jsx("a",{className:"link-item",href:"https://storybook.js.org/docs/react/configure/webpack",target:"_blank",children:e.jsx("span",{children:e.jsxs(r.p,{children:[e.jsx("strong",{children:"Build configuration"}),`
How to customize webpack and Babel`]})})}),e.jsx("a",{className:"link-item",href:"https://storybook.js.org/docs/react/configure/styling-and-css",target:"_blank",children:e.jsx("span",{children:e.jsxs(r.p,{children:[e.jsx("strong",{children:"Styling"}),`
How to load and configure CSS libraries`]})})}),e.jsx("a",{className:"link-item",href:"https://storybook.js.org/docs/react/get-started/setup#configure-storybook-for-your-stack",target:"_blank",children:e.jsx("span",{children:e.jsxs(r.p,{children:[e.jsx("strong",{children:"Data"}),`
Providers and mocking for data libraries`]})})})]}),`
`,e.jsx("div",{className:"subheading",children:"Learn"}),`
`,e.jsxs("div",{className:"link-list",children:[e.jsx("a",{className:"link-item",href:"https://storybook.js.org/docs",target:"_blank",children:e.jsx("span",{children:e.jsxs(r.p,{children:[e.jsx("strong",{children:"Storybook documentation"}),`
Configure, customize, and extend`]})})}),e.jsx("a",{className:"link-item",href:"https://storybook.js.org/tutorials/",target:"_blank",children:e.jsx("span",{children:e.jsxs(r.p,{children:[e.jsx("strong",{children:"In-depth guides"}),`
Best practices from leading teams`]})})}),e.jsx("a",{className:"link-item",href:"https://github.com/storybookjs/storybook",target:"_blank",children:e.jsx("span",{children:e.jsxs(r.p,{children:[e.jsx("strong",{children:"GitHub project"}),`
View the source and add issues`]})})}),e.jsx("a",{className:"link-item",href:"https://discord.gg/storybook",target:"_blank",children:e.jsx("span",{children:e.jsxs(r.p,{children:[e.jsx("strong",{children:"Discord chat"}),`
Chat with maintainers and the community`]})})})]}),`
`,e.jsx("div",{className:"tip-wrapper",children:e.jsxs(r.p,{children:[e.jsx("span",{className:"tip",children:"Tip"}),"Edit the Markdown in"," ",`
`,e.jsx("code",{children:"stories/Introduction.stories.mdx"})]})})]})}function D(t={}){const{wrapper:r}=Object.assign({},c(),t.components);return r?e.jsx(r,Object.assign({},t,{children:e.jsx(d,t)})):d(t)}export{D as default};
//# sourceMappingURL=Introduction-6b410607.js.map
