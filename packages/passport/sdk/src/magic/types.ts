import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { OpenIdExtension } from '@magic-ext/oidc';

/** @ts-ignore - Magic canary release has type issues */
export type MagicClient = InstanceWithExtensions<SDKBase, [OpenIdExtension]>;
