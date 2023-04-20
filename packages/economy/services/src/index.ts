import compression from 'compression';
import dotenv from 'dotenv';
import formidableMiddleware from 'express-formidable';
import helmet from 'helmet';
import pino from 'pino';
import pinoMiddleware from 'pino-http';

import app from './app';

const logger = pino();

app.use(compression());
app.use(formidableMiddleware());
app.use(helmet());
app.use(pinoMiddleware());

app.disable('x-powered-by');

dotenv.config();

const port = process.env.PORT || 3031;
const server = app.listen(port, () =>
  logger.info(`⚡️[Economy SDK]: Services running @ http://127.0.0.1:${port}`)
);

export default server;
