/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Pagination properties
 */
export type Page = {
  /**
   * First item as an encoded string
   */
  previous_cursor: string | null;
  /**
   * Last item as an encoded string
   */
  next_cursor: string | null;
};

