/* eslint-disable @typescript-eslint/naming-convention */

export type Recipe = {
  id: string;
  game_id: string;
  name: string;
  description: string;
  status: string;
  inputs: {
    id: string;
    type: string;
    name: string;
    conditions: {
      type: 'sum' | null;
      ref: string;
      comparison: string;
      expected: string;
    }[];
  }[];
  outputs: {
    id: string;
    type: string;
    name: string;
    ref: string;
    location: string;
    data: any;
  }[];
  created_at: string;
  updated_at: string;
};
