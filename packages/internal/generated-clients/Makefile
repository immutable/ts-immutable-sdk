.PHONY: generate-imx-openapi
generate-imx-openapi: get-imx-openapi generate-imx-api-client

.PHONY: generate-mr-openapi
generate-mr-openapi: get-mr-openapi generate-mr-api-client

# Note: We generate clients with sandbox spec only as Prod and Sandbox are maintained to be same. 
#.      Prod url is passed in via config to talk to prod API.
.PHONY: get-imx-openapi
get-imx-openapi:
	rm -f src/imx-openapi.json && touch src/imx-openapi.json && \
	curl -H "Accept: application/json+v3" \
    https://api.sandbox.x.immutable.com/openapi \
    -o src/imx-openapi.json

# TODO: update URL once we release to testnet
.PHONY: get-mr-openapi
get-mr-openapi:
	rm -f src/mr-openapi.json && touch src/mr-openapi.json && \
	curl -H "Accept: application/json+v3" \
    https://imx-openapiv3-mr-dev.s3.us-east-2.amazonaws.com/openapi.json \
    -o src/mr-openapi.json

.PHONY: generate-imx-api-client
generate-imx-api-client:
	rm -rf src/imx && \
    mkdir src/imx && \
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate \
    -i ./app/src/imx-openapi.json \
    -g typescript-axios \
    --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true \
    -o /app/src/imx

.PHONY: generate-mr-api-client
generate-mr-api-client:
	rm -rf src/multi-rollup && \
    mkdir src/multi-rollup && \
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate \
    -i ./app/src/mr-openapi.json \
    -g typescript-axios \
    --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true \
    -o /app/src/multi-rollup
