import fp from 'fastify-plugin'
import SwaggerUI from '@fastify/swagger-ui'
import Swagger, { type FastifyDynamicSwaggerOptions } from '@fastify/swagger'

export default fp<FastifyDynamicSwaggerOptions>(async (fastify, opts) => {
    await fastify.register(Swagger, {
        openapi: {
            info: {
                title: 'Primary Sales Webhooks Backend',
                description: 'Example API endpoints for the Primary Sales Webhooks Backend',
                version: '0.1.0',
            },
            servers: [
                {
                    url: `http://localhost:${fastify.config.PORT}`,
                },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    })

    await fastify.register(SwaggerUI, {
        routePrefix: '/docs',
    })
})