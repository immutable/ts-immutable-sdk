/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ActiveOrderStatus } from './ActiveOrderStatus';
import type { CancelledOrderStatus } from './CancelledOrderStatus';
import type { ExpiredOrderStatus } from './ExpiredOrderStatus';
import type { FilledOrderStatus } from './FilledOrderStatus';
import type { InactiveOrderStatus } from './InactiveOrderStatus';
import type { PendingOrderStatus } from './PendingOrderStatus';

/**
 * The Order status
 */
export type OrderStatus = (CancelledOrderStatus | PendingOrderStatus | ActiveOrderStatus | InactiveOrderStatus | FilledOrderStatus | ExpiredOrderStatus);

