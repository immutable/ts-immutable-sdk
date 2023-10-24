import { SemanticVersion, WidgetConfiguration } from '../widgets/definitions/types';

export type WidgetsInit = {
  config: WidgetConfiguration;
  version?: SemanticVersion
};
