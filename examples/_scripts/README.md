# Example Apps Documentation Automation

This directory contains scripts that automate the process of parsing example apps and publishing their documentation to the Immutable documentation site.

## Sample App Parser

The `sample-app-parser.mjs` script scans all example apps in the `/examples` directory for the following products:
- passport
- checkout
- orderbook
- contracts

For each example app, it looks for:
1. `metadata.json` - Contains metadata about the example app
2. `tutorial.md` - Contains a tutorial that explains how the example app works

The script collects this information and generates JSON files in the `examples/_parsed` directory, which can then be used by the documentation site.

## How It Works

1. The script runs through each product directory in `/examples`
2. For each app found, it tries to read the `metadata.json` and `tutorial.md` files
3. If both files are found, it adds the app's data to a collection
4. The collected data is written to a JSON file named `{product}-examples.json` in the `examples/_parsed` directory

## CI/CD Integration

The example apps documentation is automatically updated through GitHub Actions when:

1. Any `metadata.json` or `tutorial.md` file is changed in the `/examples` directory
2. The changes are pushed to the `DVR-332-example-app-content-workflow-pipeline` branch

The workflow that handles this process is defined in `.github/workflows/update-examples-docs.yaml`. It:

1. Checks out the SDK repository
2. Checks out the documentation site repository (branch: `DVR-332-example-app-content-pipeline`)
3. Runs the sample app parser script
4. Copies the generated JSON files to the documentation site repository at `docs/main/example/zkEVM/<product>-examples/`
5. Commits and pushes the changes to the `DVR-332-example-app-content-pipeline` branch of the docs site repository
6. Triggers a Netlify build to update the documentation site

## Running the Parser Locally

You can run the sample app parser locally with:

```bash
pnpm parse:examples
```

This will generate the JSON files in the `examples/_parsed` directory.

## Adding New Example Apps

To add a new example app:

1. Create a new directory in the appropriate product directory (e.g., `/examples/passport/my-new-app`)
2. Create a `metadata.json` file with information about your app
3. Create a `tutorial.md` file that explains how your app works
4. When these files are pushed to the DVR-332-example-app-content-workflow-pipeline branch, the CI/CD pipeline will automatically update the documentation

## Documentation Site Integration

The parsed example files are stored in the docs site repository with the following structure:

```
docs/main/example/zkEVM/
  ├── passport-examples/
  │   └── passport-examples.json
  ├── checkout-examples/
  │   └── checkout-examples.json
  ├── orderbook-examples/
  │   └── orderbook-examples.json
  └── contracts-examples/
      └── contracts-examples.json
```

These files are used by the documentation site to render the example apps documentation.

## Metadata.json Format

The `metadata.json` file should follow this format:

```json
{
  "title": "Example App Title",
  "description": "Brief description of what the example app demonstrates",
  "keywords": ["Immutable", "SDK", "Feature1", "Feature2"],
  "tech_stack": ["React", "TypeScript", "etc"],
  "product": "passport|checkout|orderbook|contracts",
  "programming_language": "TypeScript|JavaScript"
}
``` 