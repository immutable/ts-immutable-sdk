import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

const OrderConfirmationRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get('/products', {
        schema: {
            description: 'Get a list of products with their pricing',
            response: {
                200: Type.Array(Type.Object({
                    product_id: Type.String(),
                    quantity: Type.Number(),
                    pricing: Type.Array(Type.Object({
                        currency: Type.String(),
                        amount: Type.Number()
                    }))
                })),
                404: Type.Object({
                    message: Type.String()
                }),
                400: Type.Object({
                    message: Type.String()
                }),
            }
        }
    }, async () => {
        const products = await fastify.prisma.product.findMany({
            include: {
                productPrices: true
            }
        });
        return products.map(p => {
            return {
                product_id: p.id,
                quantity: p.stockQuantity,
                pricing: p.productPrices.map(pp => {
                    return {
                        currency: pp.currency_name,
                        amount: pp.amount
                    }
                })
            }
        })
    });
}

export default OrderConfirmationRoutes;