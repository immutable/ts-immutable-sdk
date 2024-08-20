"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const client_1 = require("@prisma/client");
const errors_1 = require("../errors");
const expireOrder = async (prisma, reference) => {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: {
                id: reference
            }
        });
        if (!order) {
            throw new errors_1.ApiError(404, 'Order not found');
        }
        if (order.status !== client_1.OrderStatus.reserved) {
            throw new errors_1.ApiError(400, 'Order is not reserved');
        }
        await tx.order.update({
            where: {
                id: reference
            },
            data: {
                status: client_1.OrderStatus.expired
            }
        });
        const lineItems = await tx.orderLineItem.findMany({
            where: {
                order_id: reference
            }
        });
        for (const lineItem of lineItems) {
            await tx.product.update({
                where: {
                    id: lineItem.product_id
                },
                data: {
                    stockQuantity: {
                        increment: lineItem.quantity
                    }
                }
            });
        }
    });
};
const OrderExpiryRoutes = async (fastify) => {
    fastify.post('/expire', {
        schema: {
            description: 'Expire an order and release the reserved stock back to the product',
            body: type_provider_typebox_1.Type.Object({
                reference: type_provider_typebox_1.Type.String(),
            }),
            response: {
                200: type_provider_typebox_1.Type.Null(),
                404: type_provider_typebox_1.Type.Object({
                    message: type_provider_typebox_1.Type.String()
                }),
                400: type_provider_typebox_1.Type.Object({
                    message: type_provider_typebox_1.Type.String()
                }),
            }
        }
    }, async (request, reply) => {
        await expireOrder(fastify.prisma, request.body.reference);
        return reply.status(200).send();
    });
};
exports.default = OrderExpiryRoutes;
