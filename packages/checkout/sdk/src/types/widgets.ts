import { WidgetConfiguration } from '../widgets/definitions/configurations/widget';
import { SemanticVersion } from '../widgets/definitions/types';

/**
 * Represents the configuration options for instantiating the Checkout Widgets factory.
 * @property {WidgetConfiguration} config - global configuration options for the widgets.
 * @property {SemanticVersion | undefined} version - version of the Checkout widgets bundle(default latest version will be used).
 * @property {boolean | undefined} useEsModules - Set to true to use the esm build of the widgets.
 */
export type WidgetsInit = {
  config: WidgetConfiguration;
  version?: SemanticVersion;
  /** Loads separate parts of the widget script as required for performance improvements. */
  useEsModules?: boolean;
};
