/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MetadataFieldFilter = {
  /**
   * The metadata field name. Either a top-level NFT metadata field
   * (`name`, `image`, `description`, `animation_url`, `external_url`,
   * `youtube_url`) or an attribute identified by the `attribute:<trait_type>`
   * prefix (e.g. `attribute:Background`).
   */
  field_name: string;
  /**
   * The metadata field values to match against. Matching is case-insensitive
   * and OR-style within a single filter; multiple filters on a bid AND.
   */
  values: Array<string>;
};
