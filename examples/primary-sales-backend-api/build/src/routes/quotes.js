"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const currency_1 = require("../schemas/currency");
const product_1 = require("../schemas/product");
const errors_1 = require("../errors");
const getProductsWithPrices = (ids, prisma) => {
    return prisma.product.findMany({
        where: {
            id: {
                in: ids
            }
        },
        include: {
            productPrices: {
                include: {
                    currency: true
                }
            }
        }
    });
};
const calculateTotals = (products) => {
    const currencyTotalsMap = new Map();
    products.forEach((product) => {
        product.pricing.forEach((productPrice) => {
            var _a;
            const { currency, amount, currency_type } = productPrice;
            const currentTotal = ((_a = currencyTotalsMap.get(currency)) === null || _a === void 0 ? void 0 : _a.total) || 0;
            currencyTotalsMap.set(currency, {
                type: currency_type,
                name: currency,
                total: currentTotal + amount
            });
        });
    });
    return currencyTotalsMap;
};
const QuoteRoutes = async (fastify) => {
    fastify.post('/quotes', {
        schema: {
            description: 'Get a quote for a list of products. Used to calculate the total cost of an order and show it to the user.',
            body: type_provider_typebox_1.Type.Object({
                recipient_address: type_provider_typebox_1.Type.String(),
                products: type_provider_typebox_1.Type.Array(type_provider_typebox_1.Type.Object({
                    product_id: type_provider_typebox_1.Type.String(),
                    quantity: type_provider_typebox_1.Type.Integer()
                })),
            }),
            response: {
                200: type_provider_typebox_1.Type.Object({
                    products: product_1.ProductsResponseSchema,
                    totals: type_provider_typebox_1.Type.Array(currency_1.CurrencySchema)
                }),
                404: type_provider_typebox_1.Type.Object({
                    message: type_provider_typebox_1.Type.String()
                }),
                400: type_provider_typebox_1.Type.Object({
                    message: type_provider_typebox_1.Type.String()
                }),
            }
        }
    }, async (request, _) => {
        const { products: requestedProducts } = request.body;
        const products = await getProductsWithPrices(requestedProducts.map((product) => product.product_id), fastify.prisma);
        if (!products.length) {
            return { products: [], totals: [] };
        }
        const productsResponse = [];
        for (const requestedProduct of requestedProducts) {
            const product = products.find(p => p.id === requestedProduct.product_id);
            if (!product) {
                throw new errors_1.ApiError(404, `Product with id ${requestedProduct.product_id} not found`);
            }
            if (requestedProduct.quantity > product.stockQuantity) {
                throw new errors_1.ApiError(400, `Not enough stock for product with id ${requestedProduct.product_id}`);
            }
            const productPrices = product.productPrices.map((productPrice) => ({
                currency: productPrice.currency.name,
                amount: productPrice.amount * requestedProduct.quantity,
                currency_type: String(productPrice.currency.type),
            }));
            productsResponse.push({
                product_id: product.id,
                quantity: requestedProduct.quantity,
                pricing: productPrices
            });
        }
        const currencyTotalsMap = calculateTotals(productsResponse);
        const totalsResponse = Array.from(currencyTotalsMap.values()).map(total => ({
            currency: total.name,
            currency_type: String(total.type),
            amount: total.total
        }));
        return {
            products: productsResponse,
            totals: totalsResponse
        };
    });
};
exports.default = QuoteRoutes;
