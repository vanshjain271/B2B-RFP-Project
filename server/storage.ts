import { SKU_CATALOG, type SKUItem } from "@shared/schema";

export interface IStorage {
  getSkuCatalog(): Promise<SKUItem[]>;
  getSkuBySku(sku: string): Promise<SKUItem | undefined>;
}

export class MemStorage implements IStorage {
  private skuCatalog: SKUItem[];

  constructor() {
    this.skuCatalog = [...SKU_CATALOG];
  }

  async getSkuCatalog(): Promise<SKUItem[]> {
    return this.skuCatalog;
  }

  async getSkuBySku(sku: string): Promise<SKUItem | undefined> {
    return this.skuCatalog.find(item => item.sku === sku);
  }
}

export const storage = new MemStorage();
