const { execSync } = require('child_process');
const fs = require('fs');

if (process.argv.length < 3) {
  console.error('Please provide a project name.');
  process.exit(1);
}

const projectName = process.argv[2];

function findDependents(depGraph, projectName, visited = new Set()) {
  const dependencies = depGraph.graph.dependencies;
  const dependents = new Set();

  Object.keys(dependencies).forEach(key => {
    if (dependencies[key].some(dep => dep.target === projectName)) {
      if (!visited.has(key)) {
        visited.add(key);
        dependents.add(key);
        const nestedDependents = findDependents(depGraph, key, visited);
        nestedDependents.forEach(dep => dependents.add(dep));
      }
    }
  });

  return dependents;
}

try {
  // Read and parse the dependency graph JSON
  const depGraph = JSON.parse(fs.readFileSync('dep-graph.json', 'utf-8'));

  // Find all projects that depend on the specified project recursively
  const dependents = findDependents(depGraph, projectName);

  if (dependents.size === 0) {
    console.log(`No dependent projects found for ${projectName}.`);
    process.exit(0);
  }

  // Convert the Set to an Array
  const dependentsArray = Array.from(dependents).filter(d => d !== '@imtbl/sdk' && !d.includes('sample'));

  console.log('dependents:', dependentsArray);

  // Run the build command for all dependents using nx run-many
  const command = `nx run-many --target=build --projects=${dependentsArray.join(',')} --parallel=5`;
  console.log(`Running command: ${command}`);
  execSync(command, { stdio: 'inherit' });

  console.log('All dependent projects built successfully.');
} catch (error) {
  console.error('Error building dependent projects:', error);
  process.exit(1);
}
