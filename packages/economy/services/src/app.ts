import express, { Request, Response } from 'express';

import routes from './routes';
import pino from 'pino';
import cors from 'cors';

const logger = pino();
const app = express();
const paths: { path: string; methods: string }[] = routes.reduce(
  (a, r) => [
    ...a,
    ...r.stack.map((s) => ({
      path: s.route.path,
      methods: Object.keys(s.route.methods)
        .map((s) => s.toUpperCase())
        .toString(),
    })),
  ],
  [] as any
);

logger.info(paths);

app.use(
  cors({
    origin: '*',
  })
);

/**
 * Root must only be used the resources directory
 */
app.get('/', (req: Request, res: Response) =>
  res.send(/*html*/ `
    <h1>Economy SDK Services</h1>
    <ul>
    ${paths
      .map(
        ({ path, methods }) =>
          `<li><b>[${methods}]</b> <a href="${path}" target="_blank">${path}</a></li>`
      )
      .join('')}
    </ul>
  `)
);

export default app;
