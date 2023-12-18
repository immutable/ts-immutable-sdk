The contents of the `.uploaded.json` files should be `deepEqual` to what is returned by requests to `BASE_URI`.

The contents of the `.indexed.json` should be `deepEqual` to what is returned by the indexer. Notably, some fields from the `.uploaded.json` may be omitted, and vice versa.
