import { Config } from '@imtbl/core-sdk';

var Environment;
(function (Environment) {
    Environment["DEVELOPMENT"] = "development";
    Environment["SANDBOX"] = "sandbox";
    Environment["PRODUCTION"] = "production";
})(Environment || (Environment = {}));
class Configuration {
    starkExConfig;
    constructor(config) {
        this.starkExConfig = config;
    }
    getStarkExConfig() {
        return this.starkExConfig;
    }
}
const PRODUCTION = {
    ...Config.PRODUCTION,
    env: Environment.PRODUCTION,
};
const SANDBOX = {
    ...Config.SANDBOX,
    env: Environment.SANDBOX,
};

export { Configuration, Environment, PRODUCTION, SANDBOX };
