<div align="center">
  <p align="center">
    <a href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
  <h1>Economy Building Blocks SDK</h1>
</div>

# Overview

> **Warning** **IMMUTABLE ECONOMY SDK IS UNSTABLE** <br/>
> Since it has not hit the version 1.0 yet, its public interface should not be considered final. Future releases may include breaking changes without further notice. We will do our best to keep this documentation updated providing visibility on breaking changes planned.

Game partners such Gods Unchained, Shardbound, and others will all define , build and run their economies around systems like primary sales, crafting/forging, loot box opening and others.

Running a game economy is complex and requires handling web3 interactions and async communication with backend systems.

Defining the economy bulding blocks (systems described above) and  their inner workings and tooling is often an engineering expensive effort, and the maintenance to build this for every game partnership onboarded to the Immutable's platform is exponentional. Not to mention front end web stack can and may also be different for each.

This SDK aims to abstract that complexity into a Typescript SDK that can be used by any front end developer on the Integration team or by the parnertship game team themselves.


To learn more read:
* [ Problem Statements](https://immutable.atlassian.net/wiki/spaces/IS/pages/2102427822/C1+2023+Problem+Statements) + [Solution 1 pagers](https://immutable.atlassian.net/wiki/spaces/IS/pages/2104623149/C1+2023+Solution+1+Pagers)
* [Economy Building Blocks | PRD](https://immutable.atlassian.net/wiki/spaces/IS/pages/2135949338/Economy+Building+Blocks+PRD+Craft+SDK)

## Dependencies

| Dependency | Version |
|------------|---------|
| Node       | v16     |


## Install
```bash
  nvm install && nvm use
  yarn install
```

## Folder structure
```
|
└───playground --> application where devs see how the SDK is used
│
└───sdk --> source code of the Economy building blocks SDK
│
└───README.md
```

## This module uses Yarn workspaces

Visit the [Yarn workspaces Documentation](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to learn more.
