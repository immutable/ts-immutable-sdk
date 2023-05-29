import 'reflect-metadata';
import Container from 'typedi';

import { InventoryItem } from 'types';
import { Config, defaultConfig } from '../Config';
import { Store } from '../Store';
import { Crafting } from './Crafting';

const recipe = {
  id: 'recipe_1',
  inputs: [
    {
      id: 'input_1',
      type: 'multiple_item',
      conditions: [
        {
          type: 'qty',
          ref: 'dust',
          comparison: 'gte',
          expected: '2',
        },
      ],
    },
    {
      id: 'input_2',
      type: 'multiple_item',
      conditions: [
        {
          type: '',
          ref: 'item_definition_id',
          comparison: 'eq',
          expected: 'item_def_2',
        },
        {
          type: 'sum',
          ref: 'dust',
          comparison: 'gte',
          expected: '200',
        },
      ],
    },
    {
      id: 'input_3',
      type: 'single_item',
      conditions: [
        {
          type: '',
          ref: 'item_definition_id',
          comparison: 'eq',
          expected: 'item_def_1',
        },
      ],
    },
  ],
  outputs: [
    {
      ref: 'item_def_2',
      location: 'zkevm',
    },
  ],
};

const items = [
  {
    id: 'item_1',
    item_definition_id: 'item_def_1',
    metadata: {
      dust: 100,
    },
  },
  {
    id: 'item_2',
    item_definition_id: 'item_def_1',
    metadata: {
      dust: 100,
    },
  },
  {
    id: 'item_3',
    item_definition_id: 'item_def_2',
    metadata: {
      dust: 100,
    },
  },
  {
    id: 'item_4',
    item_definition_id: 'item_def_1',
    metadata: {
      dust: 100,
    },
  },
  {
    id: 'item_5',
    item_definition_id: 'item_def_2',
    metadata: {
      dust: 100,
    },
  },
] as unknown as Array<InventoryItem>;

describe(Crafting.name, () => {
  beforeAll(() => {
    Container.reset();
    Container.set(Config, new Config(defaultConfig));
    Container.set(
      Store,
      new Store({
        recipes: [recipe],
        inventory: items,
        craftingInputs: [],
        selectedRecipeId: 'recipe_1',
      }),
    );
  });

  it('should be defined', () => {
    const crafting = Container.get(Crafting);
    const store = Container.get(Store);

    try {
      crafting.addInputByItem(store.get().inventory[0]);
      crafting.addInputByItem(store.get().inventory[1]);
      crafting.addInputByItem(store.get().inventory[2]);
      crafting.addInputByItem(store.get().inventory[3]);
      crafting.addInputByItem(store.get().inventory[4]);

      console.log('#########', store.get().craftingInputs);
    } catch (error) {
      console.log('######### ERROR', error);
    }
    expect(crafting).toBeDefined();
  });
});
