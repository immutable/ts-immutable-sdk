import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { OrderLineItem, OrderStatus, PrismaClient } from '@prisma/client';
import { ApiError } from '../errors';
import { ProductRequestSchema, ProductRequestType } from "../schemas/product";

const createOrder = async (prisma: PrismaClient, recipientAddress: string, orderProducts: ProductRequestType[]) => {
    return await prisma.$transaction(async tx => {
        const updatedProducts = [];

        for (const orderProduct of orderProducts) {

            // For each product in the order, we decrement the stock quantity by the order quantity since we are reserving stock for the order.
            const updatedProduct = await tx.product.update({
                where: { id: orderProduct.product_id },
                data: {
                    stockQuantity: { decrement: orderProduct.quantity }
                },
                include: {
                    productPrices: true
                }
            })

            if (updatedProduct.stockQuantity < 0) {
                throw new ApiError(400, `Product with id ${orderProduct.product_id} has insufficient stock for this order`);
            }
            updatedProducts.push(updatedProduct);
        }

        // Create an order with a 'reserved' status alongside the order line items.
        const order = await tx.order.create({
            data: {
                status: OrderStatus.reserved,
                recipientAddress: recipientAddress,
                lineItems: {
                    create: updatedProducts.map((product) => ({
                        product_id: product.id,
                        quantity: orderProducts.find((orderProduct) => orderProduct.product_id === product.id)?.quantity ?? 0
                    })),
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
        })
        return order;
    })
}

const SaleAuthorizationRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post('/orders/authorize', {
        schema: {
            description: 'Authorize a sale and reserve stock for the order',
            body: Type.Object({
                products: Type.Array(ProductRequestSchema),
                currency: Type.String(),
                recipient_address: Type.String()
            }),
            response: {
                200: Type.Object({
                    reference: Type.String(),
                    currency: Type.String(),
                    products: Type.Array(Type.Object({
                        product_id: Type.String(),
                        collection_address: Type.String(),
                        contract_type: Type.String(),
                        detail: Type.Array(Type.Object({
                            token_id: Type.String(),
                            amount: Type.Number()
                        })
                        )
                    }))
                }),
                400: Type.Object({
                    message: Type.String()
                }),
                404: Type.Object({
                    message: Type.String()
                }),
            }
        }
    }, async (request, _) => {
        const order = await createOrder(fastify.prisma, request.body.recipient_address, request.body.products);

        const populateDetails = (amount: number, lineItem: OrderLineItem) => {
            const details = [];
            for (let i = 0; i < lineItem.quantity; i++) {
                details.push({
                    // We don't persist token ID in this example, so we generate a random one.
                    // For real life use cases, consider whether you need to persist token_id or not during order creation.
                    token_id: String(Math.floor(Math.random() * 10000000000)),
                    amount
                })
            }

            return details;
        }

        return {
            reference: order.id,
            currency: request.body.currency,
            products: order.lineItems.map(lineItem => {
                const pricing = lineItem.product.productPrices.find((productPrice) => productPrice.currency_name === request.body.currency);
                if (!pricing) {
                    throw new ApiError(404, `Product with id ${lineItem.product_id} does not have pricing for currency ${request.body.currency}`);
                }
                const productDetails = populateDetails(pricing.amount, lineItem);

                return {
                    product_id: lineItem.product_id,
                    collection_address: lineItem.product.collectionAddress,
                    contract_type: lineItem.product.contractType,
                    detail: productDetails
                }
            })
        }
    });
}

export default SaleAuthorizationRoutes;
