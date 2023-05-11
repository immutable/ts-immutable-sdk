export type InventoryItem = {
  id: string;
  game_id: string;
  token_id: any;
  contract_id: any;
  item_definition_id: string;
  owner: string;
  status: string;
  location: string;
  last_traded: any;
  metadata: {
    name: string;
    description: string;
    image: string;
    level: string;
    dust_power: number;
    [key: string]: number | string;
  };
  created_at: string;
  updated_at: any;
  deleted_at: any;
};
