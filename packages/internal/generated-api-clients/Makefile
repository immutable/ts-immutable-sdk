.PHONY: generate-imx-openapi
generate-imx-openapi: get-imx-openapi generate-imx-api-client

.PHONY: generate-mr-openapi
generate-mr-openapi: get-mr-openapi generate-mr-api-client

# Note: We generate clients with sandbox spec only as Prod and Sandbox are maintained to be same. 
#.      Prod url is passed in via config to talk to prod API.
.PHONY: get-imx-openapi
get-imx-openapi:
	rm -f imx-openapi.json && touch imx-openapi.json && \
	curl -H "Accept: application/json+v3" \
    https://api.sandbox.x.immutable.com/openapi \
    -o imx-openapi.json

# TODO: update URL once we release to testnet
.PHONY: get-mr-openapi
get-mr-openapi:
	rm -f mr-openapi.json && touch mr-openapi.json && \
	curl -H "Accept: application/json+v3" \
    https://imx-openapiv3-mr-dev.s3.us-east-2.amazonaws.com/openapi.json \
    -o mr-openapi.json

.PHONY: generate-imx-api-client
generate-imx-api-client:
	rm -rf imx && \
    mkdir imx && \
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate \
    -i ./app/imx-openapi.json \
    -g typescript-axios \
    --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true \
    -o /app/imx

.PHONY: generate-mr-api-client
generate-mr-api-client:
	rm -rf multi-rollup && \
    mkdir multi-rollup && \
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate \
    -i ./app/mr-openapi.json \
    -g typescript-axios \
    --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true \
    -o /app/multi-rollup