<div align="center">
  <p align="center">
    <a href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
  <h1>Mock server application for Economy Building Blocks</h1>
</div>

# Overview

This is a server application that can be use to mock and stub the different backend services required in the SDK functionality. The setup uses expressjs.

## Running

Run the following to serve the playground application on `http://127.0.0.1:3031/`
```bash
  yarn workspace @imtbl/economy-playground start
```


## Adding new routes
To add a new mock response, you have to:
1.  create a new resource by creating a directory under `src/routes`, and then
2.  export the routes for that resource at `src/routes/indext.ts`.

### Routes template
```typescript
import { Router } from "express";

const router = Router();

router.get("/path/to/resource", (req, res) => {
  res.status(200).send({ ok: true });
});

export default router;
```

For further examples refer to [ExpressJS Routing docs](https://expressjs.com/en/guide/routing.html).