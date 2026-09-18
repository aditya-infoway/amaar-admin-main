// src/app/pages/grr/data.ts

export type GrrItem = {
  id: number;                      // = purchaseOrderDetailsId, used as table row id
  purchaseOrderDetailsId: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  orderQty: number;
  hsnCode: string;
 inQty: number | null;
  verified: boolean;
};

export const grrList: GrrItem[] = [];