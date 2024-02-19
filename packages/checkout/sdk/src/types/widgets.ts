import { WidgetConfiguration } from '../widgets/definitions/configurations/widget';
import { SemanticVersion } from '../widgets/definitions/types';

/**
 * Represents the configuration options for instantiating the Checkout Widgets factory.
 * @property {WidgetConfiguration} config - global configuration options for the widgets.
 * @property {SemanticVersion | undefined} version - version of the Checkout widgets bundle(default latest version will be used).
 */
export type WidgetsInit = {
  config: WidgetConfiguration;
  version?: SemanticVersion;
};
