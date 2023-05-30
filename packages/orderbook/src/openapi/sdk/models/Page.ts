/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Pagination properties
 */
export type Page = {
  /**
   * First item as base64 encoded string
   */
  previous_cursor: string | null;
  /**
   * Last item as base64 encoded string
   */
  next_cursor: string | null;
};

