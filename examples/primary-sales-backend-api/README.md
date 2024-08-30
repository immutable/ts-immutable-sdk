# Example Primary Sales Webhook API

This example shows how to implement the webhooks required for the [primary sales backend config](https://docs.immutable.com/products/zkEVM/checkout/widgets/primary-sales/backend/byo).

## Pre-requisites

* [NodeJS >= v20](https://nodejs.org/en)
* [Docker](https://www.docker.com/)

### Install dependencies

Run `npm i`

### Set environment variables

Copy the `.env.example` file and rename it to `.env`.

## Running the app

1. Run `docker-compose up -d` to start the postgres DB at port 5432.
2. Run `npx prisma migrate dev` and `npm run seed` to initialise the DB schema and seed it with data.
3. `npm run dev` to start your server on port 3000

## Webhook endpoints

To see the list of endpoints this example serves, go to [the Swagger UI](http://localhost:3000/docs).

Apart from the `/api/v1/products` endpoint which is used to list the products available in the DB, the rest of the endpoints correspond to the [Primary Sales backend config documentation](https://docs.immutable.com/products/zkEVM/checkout/widgets/primary-sales/backend/byo).


## Example requests

For your convenience, we have also added a postman collection under the `postman` folder. These contain sample requests for each endpoint, using the seeded products data.

To run the requests, download [Postman](https://www.postman.com/) and import the collection.


## TO-DO list

* Add authentication for each endpoint, as per the [webhook authentication section](https://docs.immutable.com/products/zkEVM/checkout/widgets/primary-sales/backend/byo#webhook-authentication)