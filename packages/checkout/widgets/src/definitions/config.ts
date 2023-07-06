import { Environment } from '@imtbl/config';
import { WidgetTheme } from './types';

/**
 * Represents the version of the Checkout Widgets to use defaults to (0.1.9-alpha)
 * @property {number | undefined} major - The major version of the widgets, must specify a major version even if it is 0, otherwise version defaults to (0.1.9-alpha)
 * @property {number | undefined} minor - The minor version of the widgets, leaving this blank will pickup all new minor versions released
 * @property {number | undefined} patch - The patch version of the widgets, leaving this blank will pickup all new patch versions released
 * @property {string | undefined} prerelease - The prerelease version of the widgets, can only be 'alpha' or 'beta', will be used in preference of build if it is also specified. Do not use in production.
 * @property {number | undefined} build - The build version of the widgets, this should not be used in production and will only be used for rare cases when a specific testing is required
 *
 * @example
 * { major: 0 } - use default version 0.1.9-alpha
 * { major: 1 } - use version 1.x.x, pickup all new minor and patch versions released
 * { major: 1, minor: 1 } - use version 1.1.x, pickup all new patch versions released
 * { major: 1, minor: 2, patch: 3 } - use version 1.2.3 specifically
 */
export type SemanticVersion = {
  major: number;
  minor: number;
  patch: number;
  prerelease: 'alpha';
  build?: number;
};

/**
 * Represents the configuration options for the Checkout Widgets.
 * @property {WidgetTheme | undefined} theme - The theme of the Checkout Widget (default: "DARK")
 * @property {Environment | undefined} environment - The environment configuration (default: "SANDBOX")
 * @property {SemanticVersion | undefined} version - The version of the checkout widgets js file to use (default: "0.1.0")
 * @property {boolean | undefined} isOnRampEnabled - Enable on-ramp top-up method (default: "true")
 * @property {boolean | undefined} isSwapEnabled - Enable swap top-up method (default: "true")
 * @property {boolean | undefined} isBridgeEnabled - Enable bridge top-up method (default: "true")
 */
export type CheckoutWidgetsConfig = {
  theme?: WidgetTheme;
  environment?: Environment;
  version?: SemanticVersion;
  isOnRampEnabled?: boolean;
  isSwapEnabled?: boolean;
  isBridgeEnabled?: boolean;
};
