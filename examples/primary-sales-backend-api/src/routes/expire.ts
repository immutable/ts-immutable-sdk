import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { OrderStatus, PrismaClient } from "@prisma/client";
import { ApiError } from "../errors";

const expireOrder = async (prisma: PrismaClient, reference: string) => {
    return await prisma.$transaction(async tx => {
        const order = await tx.order.findUnique({
            where: {
                id: reference
            }
        });

        if (!order) {
            throw new ApiError(404, 'Order not found');
        }

        if (order.status !== OrderStatus.reserved) {
            throw new ApiError(400, 'Order is not reserved');
        }

        await tx.order.update({
            where: {
                id: reference
            },
            data: {
                status: OrderStatus.expired
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
                // Since the order is expired, the quantity reserved by that order should be released back
                // so we increase the stock back by the original order quantity
                data: {
                    stockQuantity: {
                        increment: lineItem.quantity
                    }
                }
            });
        }
    });
}


const OrderExpiryRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post('/orders/expire', {
        schema: {
            description: 'Expire an order and release the reserved stock back to the product',
            body: Type.Object({
                reference: Type.String(),
            }),
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
        await expireOrder(fastify.prisma, request.body.reference);

        return reply.status(200).send();
    });
}

export default OrderExpiryRoutes;