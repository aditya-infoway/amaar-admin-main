// src/pages/master/bom/types.ts
export interface BOMItem {
  id: string;
  itemCode: string;
  itemName: string;
  shortName: string;
  itemCategory: string;
  group: string;
  salesPrice: string;
  mrp: string;
  barcode: string;
  mainParent?: string;
  components?: BOMComponent[];
}

export interface BOMComponent {
  id: string;
  parentCode: string;
  parentName?: string;
  childCode: string;
  childName?: string;
  childSerial?: string;
  qty: string;
}

export const emptyBOMItem = (): BOMItem => ({
  id: "",
  itemCode: "",
  itemName: "",
  shortName: "",
  itemCategory: "",
  group: "",
  salesPrice: "",
  mrp: "",
  barcode: "",
});