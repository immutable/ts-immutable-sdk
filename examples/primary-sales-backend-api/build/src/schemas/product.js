"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsResponseSchema = exports.ProductRequestSchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const currency_1 = require("./currency");
exports.ProductRequestSchema = type_provider_typebox_1.Type.Object({
    product_id: type_provider_typebox_1.Type.String(),
    quantity: type_provider_typebox_1.Type.Integer()
});
exports.ProductsResponseSchema = type_provider_typebox_1.Type.Array(type_provider_typebox_1.Type.Object({
    product_id: type_provider_typebox_1.Type.String(),
    quantity: type_provider_typebox_1.Type.Number(),
    pricing: type_provider_typebox_1.Type.Array(currency_1.CurrencySchema)
}));
