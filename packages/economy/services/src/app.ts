import express, { Request, Response } from 'express';

const app = express();

/**
 * Root must only be used the resources directory
 */
app.get('/', (req: Request, res: Response) =>
  res.send(/*html*/ `
    <h1>Economy SDK Services</h1>
    <ul>
      <li><a href="/status" target="_blank">status</a></li>
      <!-- <li><a href="/path-to-resource" target="_blank">resource name</a></li> -->
    </ul>
  `)
);

export default app;
