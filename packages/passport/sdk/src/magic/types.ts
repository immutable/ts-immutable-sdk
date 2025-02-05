import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { OpenIdExtension } from '@magic-ext/oidc';

export type MagicClient = InstanceWithExtensions<SDKBase, [OpenIdExtension]>;
