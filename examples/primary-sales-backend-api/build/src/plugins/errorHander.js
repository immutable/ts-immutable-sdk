"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const handlePrismaError = (err) => {
    var _a;
    switch (err.code) {
        case 'P2025':
            return {
                statusCode: 400,
                message: `Not found: ${(_a = err.meta) === null || _a === void 0 ? void 0 : _a.modelName}`
            };
        default:
            return {
                statusCode: 500,
                message: 'Internal Server Error'
            };
    }
};
const errorHandlerPlugin = (0, fastify_plugin_1.default)(async (fastify) => {
    fastify.setErrorHandler(function (error, request, reply) {
        this.log.error(error);
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const mappedError = handlePrismaError(error);
            reply.status(mappedError.statusCode).send({ message: mappedError.message });
            return;
        }
        if (!error.statusCode) {
            reply.status(500).send({ message: 'Internal Server Error' });
            return;
        }
        reply.status(error.statusCode).send({ message: error.message });
    });
});
exports.default = errorHandlerPlugin;
