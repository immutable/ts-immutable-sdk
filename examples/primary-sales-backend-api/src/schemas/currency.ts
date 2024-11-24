import { Type } from "@fastify/type-provider-typebox";

export const CurrencySchema = Type.Object({
    currency: Type.String(),
    amount: Type.Number(),
    currency_type: Type.String(),
})