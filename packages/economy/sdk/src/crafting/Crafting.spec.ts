/** @jest-environment jsdom */

import 'reflect-metadata';
import Container from 'typedi';

import { InventoryItem } from '../__codegen__/inventory';
import { Config, defaultConfig } from '../Config';
import { Store } from '../Store';
import { Crafting } from './Crafting';

const recipe1 = {
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

const items1 = [
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

const recipe2 = {
  id: 'wood-pickaxe-recipe-id',
  inputs: [
    {
      id: 'woodplank_input_1',
      type: 'single_item',
      name: 'Wood Plank',
      conditions: [
        {
          type: '',
          ref: 'item_definition_id',
          comparison: 'eq',
          expected: 'woodplank_item_definition_id',
        },
      ],
    },
    {
      id: 'woodplank_input_2',
      type: 'single_item',
      name: 'Wood Plank',
      conditions: [
        {
          type: '',
          ref: 'item_definition_id',
          comparison: 'eq',
          expected: 'woodplank_item_definition_id',
        },
      ],
    },
    {
      id: 'woodplank_input_3',
      type: 'single_item',
      name: 'Wood Plank',
      conditions: [
        {
          type: '',
          ref: 'item_definition_id',
          comparison: 'eq',
          expected: 'woodplank_item_definition_id',
        },
      ],
    },
    {
      id: 'stick_input_1',
      type: 'single_item',
      name: 'Stick',
      conditions: [
        {
          type: '',
          ref: 'item_definition_id',
          comparison: 'eq',
          expected: 'stick_item_definition_id',
        },
      ],
    },
    {
      id: 'stick_input_2',
      type: 'single_item',
      name: 'Stick',
      conditions: [
        {
          type: '',
          ref: 'item_definition_id',
          comparison: 'eq',
          expected: 'stick_item_definition_id',
        },
      ],
    },
  ],
  outputs: [
    {
      type: 'item_definition',
      name: 'Wood Pickaxe',
      ref: '7ee3130f-cbf8-4b21-8aed-011eea9188f9',
      location: 'offchain',
      data: null,
    },
  ],
};

const items2 = [
  {
    id: 'stick_1_id',
    item_definition_id: 'stick_item_definition_id',
    metadata: {
      description: 'Stick Regular',
      image:
        'https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/7a/Stick_JE1_BE1.png',
      name: 'Stick Regular',
    },
  },
  {
    id: 'stick_2_id',
    item_definition_id: 'stick_item_definition_id',
    metadata: {
      description: 'Stick Regular',
      image:
        'https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/7a/Stick_JE1_BE1.png',
      name: 'Stick Regular',
    },
  },
  {
    id: 'stick_3_id',
    item_definition_id: 'stick_item_definition_id',
    metadata: {
      description: 'Stick Regular',
      image:
        'https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/7a/Stick_JE1_BE1.png',
      name: 'Stick Regular',
    },
  },
  {
    id: 'woodplank_1_id',
    item_definition_id: 'woodplank_item_definition_id',
    metadata: {
      description: 'Wood Plank Regular',
      image:
        'https://j-img.game8.co/1652109/a087c7c4677cd9fa3c030c798faafe4c.png/show?1527556487',
      name: 'Wood Plank Regular',
    },
  },
  {
    id: 'woodplank_2_id',
    item_definition_id: 'woodplank_item_definition_id',
    metadata: {
      description: 'Wood Plank Regular',
      image:
        'https://j-img.game8.co/1652109/a087c7c4677cd9fa3c030c798faafe4c.png/show?1527556487',
      name: 'Wood Plank Regular',
    },
  },
  {
    id: 'woodplank_3_id',
    item_definition_id: 'woodplank_item_definition_id',
    metadata: {
      description: 'Wood Plank Regular',
      image:
        'https://j-img.game8.co/1652109/a087c7c4677cd9fa3c030c798faafe4c.png/show?1527556487',
      name: 'Wood Plank Regular',
    },
  },
] as unknown as Array<InventoryItem>;

describe(Crafting.name, () => {
  beforeAll(() => {
    Container.reset();
    Container.set(Config, new Config(defaultConfig));
  });

  it('should be defined', () => {
    Container.set(
      Store,
      new Store({
        recipes: [recipe1],
        inventory: items1,
        craftingInputs: [],
        selectedRecipeId: 'recipe_1',
      }),
    );

    const crafting = Container.get(Crafting);
    const store = Container.get(Store);

    crafting.addInputByItem(store.get().inventory[0]);
    crafting.addInputByItem(store.get().inventory[1]);
    crafting.addInputByItem(store.get().inventory[2]);
    crafting.addInputByItem(store.get().inventory[3]);
    crafting.addInputByItem(store.get().inventory[4]);

    expect(store.get().craftingInputs).toEqual([
      { condition_id: 'input_1', item_id: 'item_1' },
      { condition_id: 'input_1', item_id: 'item_2' },
      { condition_id: 'input_2', item_id: 'item_3' },
      { condition_id: 'input_3', item_id: 'item_4' },
      { condition_id: 'input_2', item_id: 'item_5' },
    ]);
  });

  it('should add item in the correct available slot', () => {
    Container.set(
      Store,
      new Store({
        recipes: [recipe2],
        inventory: items2,
        craftingInputs: [],
        selectedRecipeId: 'wood-pickaxe-recipe-id',
      }),
    );

    const crafting = Container.get(Crafting);
    const store = Container.get(Store);

    try {
      crafting.addInputByItem(store.get().inventory[0]);
      crafting.addInputByItem(store.get().inventory[1]);

      expect(store.get().craftingInputs).toEqual([
        { condition_id: 'stick_input_1', item_id: 'stick_1_id' },
        { condition_id: 'stick_input_2', item_id: 'stick_2_id' },
      ]);

      expect(crafting.addInputByItem(store.get().inventory[2])).toThrowError();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
