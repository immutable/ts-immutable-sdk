/* eslint-disable @typescript-eslint/naming-convention */
export type ItemDefinition = {
  id: string;
  game_id: string;
  item_template_id: string;
  type: string;
  name: string;
  description: string;
  properties: Record<string, string | number>;
  image: string;
  property_schema: {
    type: string;
    required: string[];
    properties: {
      hp: {
        type: string;
        default: number;
        location: string;
        exclusiveMaximum: number;
        exclusiveMinimum: number;
      };
      level: {
        type: string;
        default: number;
        location: string;
        exclusiveMaximum: number;
        exclusiveMinimum: number;
      };
      attack: {
        type: string;
        default: number;
        location: string;
        exclusiveMaximum: number;
        exclusiveMinimum: number;
      };
    };
  };
  status: string;
  published_at: any;
  created_at: string;
  updated_at: string;
};
