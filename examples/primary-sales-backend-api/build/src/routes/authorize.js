"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const errors_1 = require("../errors");
const product_1 = require("../schemas/product");
const createOrder = async (prisma, recipientAddress, orderProducts) => {
    return await prisma.$transaction(async (tx) => {
        const updatedProducts = [];
        for (const orderProduct of orderProducts) {
            const updatedProduct = await tx.product.update({
                where: { id: orderProduct.product_id },
                data: {
                    stockQuantity: { decrement: orderProduct.quantity }
                },
                include: {
                    productPrices: true
                }
            });
            if (updatedProduct.stockQuantity < 0) {
                throw new errors_1.ApiError(400, `Product with id ${orderProduct.product_id} has insufficient stock for this order`);
            }
            updatedProducts.push(updatedProduct);
        }
        const order = await tx.order.create({
            data: {
                status: 'reserved',
                recipientAddress: recipientAddress,
                lineItems: {
                    create: updatedProducts.map((product) => {
                        var _a, _b;
                        return ({
                            product_id: product.id,
                            quantity: (_b = (_a = orderProducts.find((orderProduct) => orderProduct.product_id === product.id)) === null || _a === void 0 ? void 0 : _a.quantity) !== null && _b !== void 0 ? _b : 0
                        });
                    }),
                }
            },
            include: {
                lineItems: {
                    include: {
                        product: {
                            include: {
                                productPrices: true
                            }
                        }
                    }
                }
            }
        });
        return order;
    });
};
const SaleAuthorizationRoutes = async (fastify) => {
    fastify.post('/authorize', {
        schema: {
            description: 'Authorize a sale and reserve stock for the order',
            body: type_provider_typebox_1.Type.Object({
                products: type_provider_typebox_1.Type.Array(product_1.ProductRequestSchema),
                currency: type_provider_typebox_1.Type.String(),
                recipient_address: type_provider_typebox_1.Type.String()
            }),
            response: {
                200: type_provider_typebox_1.Type.Object({
                    reference: type_provider_typebox_1.Type.String(),
                    currency: type_provider_typebox_1.Type.String(),
                    products: type_provider_typebox_1.Type.Array(type_provider_typebox_1.Type.Object({
                        product_id: type_provider_typebox_1.Type.String(),
                        collection_address: type_provider_typebox_1.Type.String(),
                        contract_type: type_provider_typebox_1.Type.String(),
                        detail: type_provider_typebox_1.Type.Array(type_provider_typebox_1.Type.Object({
                            token_id: type_provider_typebox_1.Type.String(),
                            amount: type_provider_typebox_1.Type.Number()
                        }))
                    }))
                }),
                400: type_provider_typebox_1.Type.Object({
                    message: type_provider_typebox_1.Type.String()
                }),
                404: type_provider_typebox_1.Type.Object({
                    message: type_provider_typebox_1.Type.String()
                }),
            }
        }
    }, async (request, _) => {
        const order = await createOrder(fastify.prisma, request.body.recipient_address, request.body.products);
        const populateDetails = (amount, lineItem) => {
            const details = [];
            for (let i = 0; i < lineItem.quantity; i++) {
                details.push({
                    token_id: String(Math.floor(Math.random() * 10000000000)),
                    amount
                });
            }
            return details;
        };
        return {
            reference: order.id,
            currency: request.body.currency,
            products: order.lineItems.map(lineItem => {
                const pricing = lineItem.product.productPrices.find((productPrice) => productPrice.currency_name === request.body.currency);
                if (!pricing) {
                    throw new errors_1.ApiError(404, `Product with id ${lineItem.product_id} does not have pricing for currency ${request.body.currency}`);
                }
                const productDetails = populateDetails(pricing.amount, lineItem);
                return {
                    product_id: lineItem.product_id,
                    collection_address: lineItem.product.collectionAddress,
                    contract_type: lineItem.product.contractType,
                    detail: productDetails
                };
            })
        };
    });
};
exports.default = SaleAuthorizationRoutes;
