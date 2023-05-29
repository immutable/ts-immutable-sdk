/* eslint-disable @typescript-eslint/naming-convention */
import Container from 'typedi';
import 'reflect-metadata';

import { Config, defaultConfig } from '../Config';
import { Inventory } from './Inventory';
import { InventoryItem } from '../__codegen__/inventory';

describe(Inventory.name, () => {
  beforeAll(() => {
    Container.reset();
    Container.set(Config, new Config(defaultConfig));
  });

  describe('filterItemsBy', () => {
    const items: InventoryItem[] = [
      {
        id: '2PtnmcQfIU4cm4zYAJj7AUbKq2a',
        game_id: 'shardbound',
        token_id: undefined,
        contract_id: undefined,
        item_definition_id: 'd14f72cb-02f2-48e7-826b-b3f1f76509ee',
        owner: 'jimmy-test',
        status: 'pending',
        lock_owner: '',
        location: 'zkevm',
        last_traded: undefined,
        metadata: {
          Attack: 7,
          Health: 5,
          Level: 1,
          Mana: 7,
          description: 'Deal 3 damage to a random sleeping enemy creature',
          dust_power: 100,
          image: 'https://images.godsunchained.com/art2/500/94.webp',
          level: '1',
          name: 'Demogorgon',
        },
        created_at: '2023-05-17T01:03:25.905169Z',
        updated_at: undefined,
        deleted_at: undefined,
      },
      {
        id: '2PtnmPmDrro52cqoloEN7GLVgoj',
        game_id: 'shardbound',
        token_id: undefined,
        contract_id: undefined,
        item_definition_id: 'd14f72cb-02f2-48e7-826b-b3f1f76509ee',
        owner: 'jimmy-test',
        status: 'pending',
        lock_owner: '',
        location: 'zkevm',
        last_traded: undefined,
        metadata: {
          Attack: 7,
          Health: 5,
          Level: 1,
          Mana: 7,
          description: 'Deal 3 damage to a random sleeping enemy creature',
          dust_power: 100,
          image: 'https://images.godsunchained.com/art2/500/94.webp',
          level: '1',
          name: 'Demogorgon',
        },
        created_at: '2023-05-17T01:03:23.157931Z',
        updated_at: undefined,
        deleted_at: undefined,
      },
      {
        id: '2PtnmPmDrro52cqoloEN7l32',
        game_id: 'shardbound',
        token_id: undefined,
        contract_id: undefined,
        item_definition_id: 'd14f72cb-1234-abcd-1234-b3f1f76509ff',
        owner: 'jimmy-test',
        status: 'pending',
        lock_owner: '',
        location: 'zkevm',
        last_traded: undefined,
        metadata: {
          Attack: 7,
          Health: 5,
          Level: 1,
          Mana: 7,
          description: 'Deal 3 damage to a random sleeping enemy creature',
          dust_power: 100,
          image: 'https://images.godsunchained.com/art2/500/94.webp',
          level: '1',
          name: 'Another Card',
        },
        created_at: '2023-05-17T01:03:23.157931Z',
        updated_at: undefined,
        deleted_at: undefined,
      },
    ];
    it('should filter items', () => {
      const inventory = Container.get(Inventory);
      const filteredItems = inventory.filterItemsBy(
        items,
        (x) => x?.item_definition_id === 'd14f72cb-02f2-48e7-826b-b3f1f76509ee',
      );
      expect(filteredItems.length).toBe(2);
    });
  });
});
