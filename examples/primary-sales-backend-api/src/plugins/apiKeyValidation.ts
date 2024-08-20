// import { FastifyInstance, FastifyPluginAsync } from "fastify";
// import fp from 'fastify-plugin'

// // We have different header names for each endpoint, so we need to pass the header name as an option
// type ApiKeyValidationOpts = {
//     apiKeyHeaderName: string;
// }

// const ApiKeyValidationPlugin: FastifyPluginAsync<ApiKeyValidationOpts> = fp(async (fastify: FastifyInstance, opts: ApiKeyValidationOpts) => {
//     fastify.addHook('onRequest', async (request, reply) => {
//         const apiKey = request.headers[opts.apiKeyHeaderName];

//         if (!apiKey || apiKey !== fastify.config.API_KEY) {
//             return reply
//                 .status(401)
//                 .send({ message: 'test' });
//         }
//     });
// })

// export default ApiKeyValidationPlugin;