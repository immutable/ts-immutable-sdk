"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const client_1 = require("@prisma/client");
const ConfirmOrderRequestSchema = type_provider_typebox_1.Type.Object({
    reference: type_provider_typebox_1.Type.String(),
    tx_hash: type_provider_typebox_1.Type.String(),
});
const OrderConfirmationRoutes = async (fastify) => {
    fastify.post('/confirm', {
        schema: {
            description: 'Confirmation endpoint Immutable will call after a successful transation.',
            body: ConfirmOrderRequestSchema,
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
        const { reference, tx_hash } = request.body;
        await fastify.prisma.order.update({
            where: {
                id: reference
            },
            data: {
                status: client_1.OrderStatus.completed,
                transactionHash: tx_hash,
            }
        });
        return reply.status(200).send();
    });
};
exports.default = OrderConfirmationRoutes;
