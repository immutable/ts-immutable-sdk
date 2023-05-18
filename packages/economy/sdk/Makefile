# Set environment variable (default: sandbox)
# Change this environment variable to prod/sandbox to generate production/sandbox schemas
ENVIRONMENT ?= sandbox

# Set base URLs for prod and sandbox environments
BASE_URL_PROD := https://api.prod.games.immutable.com
BASE_URL_SANDBOX := https://api.sandbox.games.immutable.com

# Set base URL based on environment variable
ifeq ($(ENVIRONMENT),prod)
BASE_URL := $(BASE_URL_PROD)
else
BASE_URL := $(BASE_URL_SANDBOX)
endif

# Generate all schemas
.PHONY: all
all: generate-crafting generate-inventory generate-recipe generate-item-definition

# Generate individual schemas
.PHONY: generate-crafting generate-inventory generate-recipe generate-item-definition
generate-crafting: get-crafting-openapi
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate -i ./app/openapi/crafting-openapi.json -g typescript-axios --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true -o /app/src/__codegen__/crafting

generate-inventory: get-inventory-openapi
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate -i ./app/openapi/inventory-openapi.json -g typescript-axios --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true -o /app/src/__codegen__/inventory

generate-recipe: get-recipe-openapi
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate -i ./app/openapi/recipe-openapi.json -g typescript-axios --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true -o /app/src/__codegen__/recipe

generate-item-definition: get-item-definition-openapi
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate -i ./app/openapi/item-definition-openapi.json -g typescript-axios --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true -o /app/src/__codegen__/item-definition 

# Get OpenAPI specs
.PHONY: get-crafting-openapi get-inventory-openapi get-recipe-openapi get-item-definition-openapi
get-crafting-openapi:
	rm -rf ./openapi/crafting-openapi.json && mkdir -p ./openapi && touch ./openapi/crafting-openapi.json && \
	curl -H "Accept: application/json+v3" $(BASE_URL)/crafting/swagger/doc.json  -o ./openapi/crafting-openapi.json

get-inventory-openapi:
	rm -rf ./openapi/inventory-openapi.json && mkdir -p ./openapi && touch ./openapi/inventory-openapi.json && \
	curl -H "Accept: application/json+v3" $(BASE_URL)/inventory/swagger/doc.json -o ./openapi/inventory-openapi.json

get-recipe-openapi:
	rm -rf ./openapi/recipe-openapi.json && mkdir -p ./openapi && touch ./openapi/recipe-openapi.json && \
	curl -H "Accept: application/json+v3" $(BASE_URL)/recipe/swagger/doc.json -o ./openapi/recipe-openapi.json

get-item-definition-openapi:
	rm -rf ./openapi/item-definition-openapi.json && mkdir -p ./openapi && touch ./openapi/item-definition-openapi.json && \
	curl -H "Accept: application/json+v3" $(BASE_URL)/item-definition/swagger/doc.json -o ./openapi/item-definition-openapi.json 