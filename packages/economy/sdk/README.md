<div align="center">
  <p align="center">
    <a href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
  <h1>SDK for Economy Building Blocks</h1>
</div>

# Overview

> **Warning** **IMMUTABLE ECONOMY SDK IS UNSTABLE** <br/>
> Since it has not hit the version 1.0 yet, its public interface should not be considered final. Future releases may include breaking changes without further notice. We will do our best to keep this documentation updated providing visibility on breaking changes planned.

This is the source code for the functionalities suported in the Economy Building Blocks SDK.

## Building

Run the following to build the library

```bash
  yarn workspace @imtbl/economy build
```

## Testing

Run the following to build the library

```bash
  yarn workspace @imtbl/economy test
```

```bash
  yarn workspace @imtbl/economy test:watch
```

```bash
  yarn workspace @imtbl/economy-playground test:watch --testFile="relative/path/to/test/file"
```

## Codegen

All generated types and HTTP clients live in `./src/__codegen__` folder.

Run the following to generate types and HTTP clients for all schemas: crafting, inventory, item definition and recipe

```bash
  yarn workspace @imtbl/economy generate:all
```

Run the following to generate types and HTTP clients for a specific schema
Replace `x` with `crafting`, `inventory`, `item-definition` or `recipe`

```bash
  yarn workspace @imtbl/economy generate:x
```

To set an environment for codegen, replace the first line of `Makefile` with `prod` | `sandbox`
e.g. `ENVIRONMENT ?= prod`
