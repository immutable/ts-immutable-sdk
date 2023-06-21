/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ERC20Item } from './ERC20Item';
import type { ERC721Item } from './ERC721Item';
import type { NativeItem } from './NativeItem';

export type Item = (NativeItem | ERC20Item | ERC721Item);

