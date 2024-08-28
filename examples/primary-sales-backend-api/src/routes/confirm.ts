import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { OrderStatus } from "@prisma/client";

const ConfirmOrderRequestSchema = Type.Object({
    // This example doesn't need the rest of the fields in the request
    // Consider what fields you'll need for your own implementation and adjust accordingly
    reference: Type.String(),
    tx_hash: Type.String(),
})


const OrderConfirmationRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post('/orders/confirm', {
        schema: {
            description: 'Endpoint that will be called after a successful transation.',
            body: ConfirmOrderRequestSchema,
            response: {
                200: Type.Null(),
                404: Type.Object({
                    message: Type.String()
                }),
                400: Type.Object({
                    message: Type.String()
                }),
            }
        }
    }, async (request, reply) => {
        const { reference, tx_hash } = request.body;

        // We only update the order status to completed and store the transaction hash
        // In real life scenarios you can use this endpoint for randomised metadata generation (such as lootboxes), to transfer the NFTs to the user in-game, etc.
        await fastify.prisma.order.update({
            where: {
                id: reference
            },
            data: {
                status: OrderStatus.completed,
                transactionHash: tx_hash,
            }
        });
        return reply.status(200).send();
    });
}

export default OrderConfirmationRoutes;