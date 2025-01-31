# -------------------------------------------------
# Immutable X
# -------------------------------------------------

.PHONY: generate-imx-openapi
generate-imx-openapi: get-imx-openapi generate-imx-api-client

# Note: We generate clients with sandbox spec only as Prod and Sandbox are maintained to be same.
#.      Prod url is passed in via config to talk to prod API.
.PHONY: get-imx-openapi
get-imx-openapi:
	rm -f src/imx-openapi.json && touch src/imx-openapi.json && \
	curl -H "Accept: application/json+v3" \
    https://api.sandbox.x.immutable.com/openapi \
    -o src/imx-openapi.json

.PHONY: generate-imx-api-client
generate-imx-api-client:
	pnpm rimraf src/imx && \
    mkdir src/imx && \
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v6.2.1 generate \
    -i ./app/src/imx-openapi.json \
    -g typescript-axios \
    -o /app/src/imx \
    -c /app/config/imx.config.json

# -------------------------------------------------
# Immutable zkEVM - Combined clients
# -------------------------------------------------

.PHONY: generate-mr-openapi
generate-mr-openapi: get-mr-openapi generate-mr-api-client

# TODO: update URL once we release to testnet
.PHONY: get-mr-openapi
get-mr-openapi:
	rm -f src/mr-openapi.json && touch src/mr-openapi.json && \
	curl -H "Accept: application/json+v3" \
    https://imx-openapiv3-mr-sandbox.s3.us-east-2.amazonaws.com/openapi-sdk.json \
    -o src/mr-openapi.json

.PHONY: generate-mr-api-client
generate-mr-api-client:
	pnpm rimraf src/multi-rollup && \
    mkdir src/multi-rollup && \
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v7.0.1 generate \
    --inline-schema-options REFACTOR_ALLOF_INLINE_SCHEMAS=true \
    -i ./app/src/mr-openapi.json \
    -g typescript-axios \
    -o /app/src/multi-rollup \
    -c /app/config/mr.config.json

# -------------------------------------------------
# Immutable zkEVM - Seperate clients
# -------------------------------------------------

.PHONY: generate-blockchain-data
generate-blockchain-data: get-blockchain-data-openapi generate-blockchain-data-client

.PHONY: get-blockchain-data-openapi
get-blockchain-data-openapi:
	pnpm rimraf src/blockchain-data-openapi.json && touch src/blockchain-data-openapi.json && \
	curl -H "Accept: application/json+v3" \
    https://imtbl-sdk.s3.us-east-2.amazonaws.com/openapi/blockchain-data-oas.json \
    -o src/blockchain-data-openapi.json

# TODO
.PHONY: generate-blockchain-data-client
generate-blockchain-data-client:

# TODO remove once combined with API functions in above command
.PHONY: generate-blockchain-data-types
generate-blockchain-data-types:
	pnpm rimraf src/blockchain-data && \
    mkdir src/blockchain-data && \
	docker run --rm -v $(shell pwd):/app openapitools/openapi-generator-cli:v7.0.1 generate \
    --inline-schema-options REFACTOR_ALLOF_INLINE_SCHEMAS=true \
    -i ./app/src/blockchain-data-openapi.json \
    -g typescript-axios \
    -o /app/src/blockchain-data \
    -c /app/config/blockchain-data.config.json \
    --additional-properties=stringEnums=true
