import inventoryData from "../content/inventory.json";

/** Module-dependency inventory graph (produced by scripts/build-inventory.mjs). */
export type Inventory = typeof inventoryData;

export function getInventory(): Inventory {
  return inventoryData;
}
