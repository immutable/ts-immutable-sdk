const { execSync } = require('child_process');
const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Please provide a changed project name and the current project.');
  process.exit(1);
}

const changedProject = process.argv[2];
const currentProject = process.argv[3];

try {
  console.log('changedProject:', changedProject);
  // Generate the focused dependency graph JSON
  execSync(`nx graph --file=dep-graph.json --focus=${currentProject}`, { stdio: 'inherit' });

  // Read and parse the dependency graph JSON
  const depGraph = JSON.parse(fs.readFileSync('dep-graph.json', 'utf-8'));

  // Check if the changed project is in the dependencies of the current project
  const dependencies = depGraph.graph.dependencies[currentProject] || [];
  const isDependent = dependencies.some((dep) => dep.target === changedProject);

  if (isDependent || changedProject === currentProject) {
    // Rebuild the current project
    const command = `nx run-many --target=d --projects=${currentProject} --no-cloud`;

    console.log(`Running command: ${command}`);
    execSync(command, { stdio: 'inherit' });

    console.log(`Rebuilt the ${currentProject} project successfully.`);
  } else {
    console.log(`No need to build anything as changes to ${changedProject} do not affect ${currentProject}.`);
  }
} catch (error) {
  console.error('Error rebuilding projects:', error);
  process.exit(1);
}
