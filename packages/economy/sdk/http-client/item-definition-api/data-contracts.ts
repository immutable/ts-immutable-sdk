/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HttpCreateItemDefinitionRequest {
  /** @example "Deal 3 damage to a random sleeping enemy creature" */
  description?: string;
  /** @example "shardbound" */
  game_id: string;
  /**
   * Image URL
   * @example "https://images.godsunchained.com/art2/500/94.webp"
   */
  image?: string;
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  item_template_id: string;
  /** @example "Demogorgon" */
  name: string;
  /** JSON Object of item properties */
  properties?: object;
}

export interface HttpCreateItemTemplateRequest {
  /** @example "shardbound" */
  game_id: string;
  /** @example "Creature" */
  name: string;
  property_schema: ItemPropertySchema[];
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  type_id: string;
}

export interface HttpUpdateItemDefinitionRequest {
  /** @example "Deal 3 damage to a random sleeping enemy creature" */
  description?: string;
  /**
   * Image URL
   * @example "https://images.godsunchained.com/art2/500/94.webp"
   */
  image?: string;
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  item_template_id: string;
  /** @example "Demogorgon" */
  name: string;
  /** JSON Object of item properties */
  properties?: object;
  /** @example "draft" */
  status?: 'draft' | 'published';
}

export interface ItemCreationPayloadOutput {
  properties?: Record<string, any>;
}

export interface ItemDefinition {
  /** @example "2023-03-01T12:00:00.000Z" */
  created_at?: string;
  /** @example "Deal 3 damage to a random sleeping enemy creature" */
  description?: string;
  /** @example "shardbound" */
  game_id?: string;
  /** @example "ec950ac3-b3bf-4b81-8b17-576234eabd41" */
  id?: string;
  /**
   * Image URL
   * @example "https://images.godsunchained.com/art2/500/94.webp"
   */
  image?: string;
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  item_template_id?: string;
  /** @example "Demogorgon" */
  name?: string;
  /** JSON Object of item properties */
  properties?: object;
  property_schema?: ItemPropertySchema[];
  /** @example "2023-03-02T12:00:00.000Z" */
  published_at?: string;
  /** @example "published" */
  status?: 'draft' | 'published';
  /** @example "Card" */
  type?: string;
  /** @example "2023-03-02T12:00:00.000Z" */
  updated_at?: string;
}

export interface ItemPropertySchema {
  /** @example false */
  dynamic?: boolean;
  /** @example "off-chain" */
  location: string;
  /** @example "Mana" */
  name: string;
  /** @example true */
  required?: boolean;
  /** Map of property schema rules. Valid keys are "enum", "min", and "max" */
  rules?: object;
  /** @example "int" */
  type?: string;
}

export interface ItemTemplate {
  /** @example "2023-03-01T12:00:00.000Z" */
  created_at?: string;
  /** @example "sb" */
  game_id?: string;
  /** @example "a8a9c29b-018d-43fe-b2d4-963a781161f0" */
  id?: string;
  /** @example "Creature" */
  name?: string;
  property_schema?: ItemPropertySchema[];
  /** @example "Card" */
  type?: string;
  /** @example "3e58eba-0f1b-4ed3-a1e8-d925ddc009c1" */
  type_id?: string;
  /** @example "2023-03-02T12:00:00.000Z" */
  updated_at?: string;
}

export interface ItemType {
  game_id?: string;
  id?: string;
  name?: string;
}
