export interface MintRequestByIDResult {
  page: Page;
  result: Result[];
}

interface Page {
  next_cursor: null;
  previous_cursor: null;
}

interface Result {
  activity_id: string;
  chain: Chain;
  collection_address: string;
  created_at: Date;
  error: null;
  owner_address: string;
  reference_id: string;
  status: string;
  token_id: string;
  transaction_hash: string;
  updated_at: Date;
}

interface Chain {
  id: string;
  name: string;
}
