import fastify from "fastify";
import fastifyEnv from "@fastify/env";
import AutoLoad from '@fastify/autoload';
import { PrismaClient } from "@prisma/client";
import { Static, Type } from "@fastify/type-provider-typebox";

export const ConfigSchema = Type.Object({
    PORT: Type.String({ default: '3000' }),
});

export type Config = Static<typeof ConfigSchema>;

declare module 'fastify' {
    interface FastifyInstance {
        config: Config;
        prisma: PrismaClient;
    }
}

const options = {
    schema: ConfigSchema,
    dotenv: true,
    data: process.env
}

const server = fastify({ logger: true });

const initialize = async () => {
    await server
        .register(fastifyEnv, options);

    server
        .register(AutoLoad, {
            dir: `${__dirname}/plugins`,
            ignorePattern: /.test.(t|j)s/,
        })
        .register(AutoLoad, {
            dir: `${__dirname}/routes`,
            ignorePattern: /.test.(t|j)s/,
            dirNameRoutePrefix: true,
            routeParams: true,
            options: { prefix: "/api/v1" },
        });

    await server.after();
}

(async () => {
    try {
        await initialize();
        await server.ready();
        await server.listen({
            port: Number(server.config.PORT),
            host: '0.0.0.0'
        });
    } catch (error) {
        server.log.error(error);
        process.exit(1);
    }
})();
