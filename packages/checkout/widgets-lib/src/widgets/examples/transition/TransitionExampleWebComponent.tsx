import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  TransitionExampleWidget,
  TransitionExampleWidgetParams,
} from './TransitionExampleWidget';
import { ImmutableWebComponent } from '../../ImmutableWebComponent';

export class ImmutableTransitionExample extends ImmutableWebComponent {
  connectedCallback() {
    super.connectedCallback();
    this.renderWidget();
  }

  renderWidget() {
    const params: TransitionExampleWidgetParams = {};

    if (!this.reactRoot) {
      this.reactRoot = ReactDOM.createRoot(this);
    }

    this.reactRoot.render(
      <React.StrictMode>
        <TransitionExampleWidget
          params={params}
          theme={this.theme}
        />
      </React.StrictMode>,
    );
  }
}
