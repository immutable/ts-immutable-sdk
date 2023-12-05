/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ERC1155Item } from './ERC1155Item';
import type { ERC20Item } from './ERC20Item';
import type { ERC721Item } from './ERC721Item';
import type { NativeItem } from './NativeItem';

export type Item = (NativeItem | ERC20Item | ERC721Item | ERC1155Item);

