const { execSync } = require('child_process');
const fs = require('fs');

if (process.argv.length < 3) {
  console.error('Please provide a project name.');
  process.exit(1);
}

const projectName = process.argv[2];

function findDependents(depGraph, projectName, visited = new Set()) {
  const dependencies = depGraph.graph.dependencies;
  const dependents = [];

  Object.keys(dependencies).forEach(key => {
    if (dependencies[key].some(dep => dep.target === projectName)) {
      if (!visited.has(key)) {
        visited.add(key);
        dependents.push(key);
        dependents.push(...findDependents(depGraph, key, visited));
      }
    }
  });

  return dependents;
}

function removeRedundantDependents(dependents, depGraph) {
  const result = new Set(dependents);
  dependents.forEach(dependent => {
    if (depGraph.graph.dependencies[dependent]) {
      depGraph.graph.dependencies[dependent].forEach(dep => {
        if (result.has(dep.target)) {
          result.delete(dep.target);
        }
      });
    }
  });
  return Array.from(result);
}

try {
  // Generate the dependency graph JSON
  execSync('nx dep-graph --file=dep-graph.json', { stdio: 'inherit' });

  // Read and parse the dependency graph JSON
  const depGraph = JSON.parse(fs.readFileSync('dep-graph.json', 'utf-8'));

  // Find all projects that depend on the specified project recursively
  const allDependents = findDependents(depGraph, projectName);
  const uniqueDependents = removeRedundantDependents(allDependents, depGraph);

  if (uniqueDependents.length === 0) {
    console.log(`No dependent projects found for ${projectName}.`);
    process.exit(0);
  }

  console.log(uniqueDependents);

  // Build the dependent projects
  uniqueDependents.forEach(dependent => {
    console.log(`Building ${dependent}...`);
    execSync(`nx run ${dependent}:build`, { stdio: 'inherit' });
    console.log(`${dependent} has been built.`);
  });

  console.log('All dependent projects built successfully.');
} catch (error) {
  console.error('Error building dependent projects:', error);
  process.exit(1);
}
