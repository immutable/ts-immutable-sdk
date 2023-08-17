/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Fee } from './Fee';

export type FulfillmentDataRequest = {
  order_id: string;
  fee?: Fee;
};

