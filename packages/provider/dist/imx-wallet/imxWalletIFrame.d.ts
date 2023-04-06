import { Environment } from "@imtbl/config";
export declare const IMX_WALLET_IFRAME_ID = "imx-wallet-app";
export declare const IMX_WALLET_IFRAME_HOSTS: {
    development: string;
    sandbox: string;
    production: string;
};
export declare const IMX_WALLET_IFRAME_STYLE = "display: none;";
export declare function getIFrame(): HTMLIFrameElement | null;
export declare function setupIFrame(env: Environment): Promise<HTMLIFrameElement>;
export declare function getOrSetupIFrame(env: Environment): Promise<HTMLIFrameElement>;
