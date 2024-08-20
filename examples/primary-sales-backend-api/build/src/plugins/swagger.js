"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
exports.default = (0, fastify_plugin_1.default)(async (fastify, opts) => {
    await fastify.register(swagger_1.default, {
        openapi: {
            info: {
                title: 'Primary Sales Webhooks Backend',
                description: 'Example API endpoints for the Primary Sales Webhooks Backend',
                version: '0.1.0',
            },
            servers: [
                {
                    url: `http://0.0.0.0:${fastify.config.PORT}`,
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    });
    await fastify.register(swagger_ui_1.default, {
        routePrefix: '/docs',
    });
});
