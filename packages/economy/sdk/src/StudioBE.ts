import { Service } from 'typedi';
import { Config } from './Config';

import { Configuration, RootApi as RecipeApi } from './__codegen__/recipe';
import { RootApi as InventoryApi } from './__codegen__/inventory';
import { RootApi as CraftingApi } from './__codegen__/crafting';
import { RootApi as ItemDefinitionApi } from './__codegen__/item-definition';

@Service()
export class StudioBE {
  public recipeApi!: RecipeApi;

  public inventoryApi!: InventoryApi;

  public craftingApi!: CraftingApi;

  public itemDefinitionApi!: ItemDefinitionApi;

  constructor(private config: Config) {
    this.recipeApi = new RecipeApi(this.getConfig('/recipe/v1'));
    this.inventoryApi = new InventoryApi(this.getConfig('/inventory/v1'));
    this.craftingApi = new CraftingApi(this.getConfig('/crafting/v1'));
    this.itemDefinitionApi = new ItemDefinitionApi(
      this.getConfig('/item-definition/v1'),
    );
  }

  private getConfig(path: string): Configuration {
    return new Configuration({
      basePath: `${this.config.servicesBaseURL}${path}`,
    });
  }
}
