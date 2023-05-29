.PHONY: generate-openapi
generate-openapi: get-openapi-sandbox generate-api

.PHONY: get-openapi
# TODO udpate URL once we release to testnet
get-openapi-sandbox:
	rm openapi.json && touch openapi.json && \
	curl -H "Accept: application/json+v3" \
    https://imx-openapiv3-mr-dev.s3.us-east-2.amazonaws.com/openapi.json \
    -o openapi.json

.PHONY: generate-api
generate-api:
	rm -rf src && \
    mkdir src && \
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate \
    -i ./app/openapi.json \
    -g typescript-axios \
    --additional-properties=supportsES6=true,npmVersion=6.9.0,typescriptThreePlus=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=domain,useSingleRequestParameter=true \
    -o /app/src