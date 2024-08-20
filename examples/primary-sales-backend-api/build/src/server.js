"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSchema = void 0;
const fastify_1 = __importDefault(require("fastify"));
const env_1 = __importDefault(require("@fastify/env"));
const autoload_1 = __importDefault(require("@fastify/autoload"));
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
exports.ConfigSchema = type_provider_typebox_1.Type.Object({
    PORT: type_provider_typebox_1.Type.String({ default: '3000' }),
});
const options = {
    schema: exports.ConfigSchema,
    dotenv: true,
    data: process.env
};
const server = (0, fastify_1.default)({ logger: true });
const initialize = async () => {
    await server
        .register(env_1.default, options);
    server
        .register(autoload_1.default, {
        dir: `${__dirname}/plugins`,
        ignorePattern: /.test.(t|j)s/,
    })
        .register(autoload_1.default, {
        dir: `${__dirname}/routes`,
        ignorePattern: /.test.(t|j)s/,
        dirNameRoutePrefix: true,
        routeParams: true,
        options: { prefix: "/api/v1/orders" },
    });
    await server.after();
};
(async () => {
    try {
        await initialize();
        await server.ready();
        await server.listen({
            port: Number(server.config.PORT),
            host: '0.0.0.0'
        });
    }
    catch (error) {
        server.log.error(error);
        process.exit(1);
    }
})();
