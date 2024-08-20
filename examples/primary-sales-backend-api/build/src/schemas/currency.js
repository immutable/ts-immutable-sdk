"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencySchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
exports.CurrencySchema = type_provider_typebox_1.Type.Object({
    currency: type_provider_typebox_1.Type.String(),
    amount: type_provider_typebox_1.Type.Number(),
    currency_type: type_provider_typebox_1.Type.String(),
});
