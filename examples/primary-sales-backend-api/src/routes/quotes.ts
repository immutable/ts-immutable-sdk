import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { PrismaClient, Currency, CurrencyType } from "@prisma/client";
import { CurrencySchema } from "../schemas/currency";
import { ProductsResponseSchema, ProductsResponseType } from "../schemas/product";
import { ApiError } from "../errors";

const getProductsWithPrices = (ids: string[], prisma: PrismaClient) => {
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
}

const calculateTotals = (products: ProductsResponseType): Map<string, Currency & {
    total: number
}> => {
    const currencyTotalsMap = new Map<string, Currency & {
        total: number
    }>();

    products.forEach((product) => {
        product.pricing.forEach((productPrice) => {
            const { currency, amount, currency_type } = productPrice;

            const currentTotal = currencyTotalsMap.get(currency)?.total || 0;

            currencyTotalsMap.set(currency, {
                type: currency_type as CurrencyType,
                name: currency,
                total: currentTotal + amount
            });
        });
    });

    return currencyTotalsMap;
}

const QuoteRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.post('/quotes', {
        schema: {
            description: 'Get a quote for a list of products. Used to calculate the total cost of an order and show it to the user.',
            body: Type.Object({
                recipient_address: Type.String(),
                products: Type.Array(Type.Object({
                    product_id: Type.String(),
                    quantity: Type.Integer()
                })),
            }),
            response: {
                200: Type.Object({
                    products: ProductsResponseSchema,
                    totals: Type.Array(CurrencySchema)
                }),
                404: Type.Object({
                    message: Type.String()
                }),
                400: Type.Object({
                    message: Type.String()
                }),
            }
        }
    }, async (request, _) => {
        const { products: requestedProducts } = request.body;

        const products = await getProductsWithPrices(requestedProducts.map((product) => product.product_id), fastify.prisma);

        if (!products.length) {
            return { products: [], totals: [] }
        }

        const productsResponse: ProductsResponseType = [];

        for (const requestedProduct of requestedProducts) {
            const product = products.find(p => p.id === requestedProduct.product_id);

            if (!product) {
                throw new ApiError(404, `Product with id ${requestedProduct.product_id} not found`);
            }

            if (requestedProduct.quantity > product.stockQuantity) {
                throw new ApiError(400, `Not enough stock for product with id ${requestedProduct.product_id}`);
            }

            // Get the pricing for the product, separated by currency
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

        // Calculate totals for each currency
        const currencyTotalsMap = calculateTotals(productsResponse);

        const totalsResponse = Array.from(currencyTotalsMap.values()).map(total => ({
            currency: total.name,
            currency_type: String(total.type),
            amount: total.total
        }));

        return {
            products: productsResponse,
            totals: totalsResponse
        }
    });
}

export default QuoteRoutes;