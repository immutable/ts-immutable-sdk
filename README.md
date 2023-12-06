<div align="center">
  <p align="center">
    <a  href="https://docs.x.immutable.com/docs">
      <img src="https://cdn.dribbble.com/users/1299339/screenshots/7133657/media/837237d447d36581ebd59ec36d30daea.gif" width="280"/>
    </a>
  </p>
</div>

---

# Welcome to Immutable Unified TypeScript SDK
This Unified SDK aims to enhance user experience, reduce complexity, and streamline development by offering a cohesive development environment.

The need for a Unified SDK arises from the challenges developers face when managing multiple SDKs, such as fragmented development experiences, increased complexity, slower project setup times, and resource overhead.

[Public facing README shipped with each SDK release is here](https://github.com/immutable/ts-immutable-sdk/blob/main/sdk/README.md)

# Technical Architecture
The Unified SDK is designed as a Yarn Workspace monorepo that contains all the packages from different Immutable products. Each product area has its own package within the monorepo, and these packages are imported and re-exported by one root-level package.

All code for each module is contained within its respective package, which allows for easy maintenance and updates. The root-level package serves as a single entry point to access all modules included in the Unified SDK.

To ensure compatibility with different platforms or devices, we externalize all third-party dependencies used by each module. This allows us to only bundle our code without including third-party dependencies which can get bundled by Node for customers who have their own build process.

We also use bundling techniques to optimize code delivery and reduce load times for customers who intend to use the SDK directly in the browser. By bundling up all code into a single file, we can minimize network requests and improve overall user experience.

Overall, this technical architecture provides a scalable solution that enables us to add new modules easily while maintaining high stability across multiple platforms.

# Contribution Guides
See [CONTRIBUTING.md](https://github.com/immutable/ts-immutable-sdk/blob/main/CONTRIBUTING.md)

Internal maintainers' guide is available at Immutable's wiki `UnifiedSDK Internal Development Guide`
- In the .github/CODEOWNERS file add your github team to the corresponding subfolder that your team will be responsible for.
- [Example from GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners#example-of-a-codeowners-file)
