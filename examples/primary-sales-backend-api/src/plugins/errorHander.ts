import { Prisma } from '@prisma/client';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): {
    statusCode: number,
    message: string
} => {
    switch (err.code) {
        case 'P2025':
            return {
                statusCode: 400,
                message: `Not found: ${err.meta?.modelName}`
            };
        default:
            // handling all other errors
            return {
                statusCode: 500,
                message: 'Internal Server Error'
            };

    }
};

const errorHandlerPlugin: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
    fastify.setErrorHandler(function (error, request, reply) {
        this.log.error(error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            const mappedError = handlePrismaError(error);

            reply.status(mappedError.statusCode).send({ message: mappedError.message });
            return;
        }

        if (!error.statusCode) {
            reply.status(500).send({ message: 'Internal Server Error' });
            return;
        }

        reply.status(error.statusCode).send({ message: error.message });
    });
});

export default errorHandlerPlugin;