import fs from "fs";
import path from "path";
import { getPluginConfiguration } from "@yarnpkg/cli";
import { Configuration, Project } from "@yarnpkg/core";

const mode = process.argv[2];

const manifestUpdateMap = {
  dev: {
    main: {
      from: 'dist/index.js',
        to: 'src/index.ts'
    },
    types: {
      from: 'dist/index.d.ts',
        to: 'src/index.ts'
    }
  },
  build: {
    main: {
      from: 'src/index.ts',
        to: 'dist/index.js'
    },
    types: {
      from: 'src/index.ts',
        to: 'dist/index.d.ts'
    }
  }
};

// Update package.json with the main and types to point to the dist folder
(async () => {
  const cwd = process.cwd();
  const pluginConfiguration = getPluginConfiguration();
  const configuration = await Configuration.find(cwd, pluginConfiguration);
  const { project } = await Project.find(configuration, cwd);

  for (const workspace of project.workspaces) {
    if (workspace.manifest.name.scope !== 'imtbl' || workspace.manifest.name.name === 'sdk') {
      continue;
    }

    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(workspace.cwd, 'package.json'), 'utf8')
    );


    if (manifestUpdateMap[mode]?.main?.from === workspace.manifest.main) {
      packageJson.main = manifestUpdateMap[mode]?.main?.to;
    }

    if (manifestUpdateMap[mode]?.types?.from === workspace.manifest.raw.types) {
      packageJson.types = manifestUpdateMap[mode]?.types?.to;
    }

    fs.writeFileSync(
      path.resolve(workspace.cwd, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }
})();
