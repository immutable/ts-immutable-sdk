import { PrismaClient } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import fp from 'fastify-plugin'

const PrismaPlugin: FastifyPluginAsync = fp(async (fastify) => {
    const prisma = new PrismaClient();

    await prisma.$connect();

    fastify.decorate('prisma', prisma)

    fastify.addHook('onClose', async () => {
        await prisma.$disconnect();
    });
})

export default PrismaPlugin;