import { WidgetLanguage } from '../configurations';

export enum ConnectTargetLayer {
  LAYER1 = 'LAYER1',
  LAYER2 = 'LAYER2',
}

export type ConnectWidgetParams = {
  /** The language to use for the connect widget */
  language?: WidgetLanguage;
};
