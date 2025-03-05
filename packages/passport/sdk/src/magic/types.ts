import { LoginWithOpenIdParams } from '@magic-ext/oidc';
import { InstanceWithExtensions, SDKBase, Extension, PromiEvent } from '@magic-sdk/provider';

export declare class OpenIdExtension extends Extension<'openid'> {
  name: "openid";
  config: any;
  loginWithOIDC(params: LoginWithOpenIdParams): PromiEvent<string, {
    done: (result: string) => void;
    error: (reason: any) => void;
    settled: () => void;
    "closed-by-user": () => void;
  }>;
}

export type MagicClient = InstanceWithExtensions<SDKBase, [OpenIdExtension]>;
