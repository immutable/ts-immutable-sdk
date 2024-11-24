import { Type, Static } from "@fastify/type-provider-typebox";
import { CurrencySchema } from "./currency";

export const ProductRequestSchema = Type.Object({
    product_id: Type.String(),
    quantity: Type.Integer()
});

export type ProductRequestType = Static<typeof ProductRequestSchema>;

export const ProductsResponseSchema = Type.Array(Type.Object({
    product_id: Type.String(),
    quantity: Type.Number(),
    pricing: Type.Array(CurrencySchema)
}));

export type ProductsResponseType = Static<typeof ProductsResponseSchema>;