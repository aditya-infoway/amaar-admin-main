import { Get } from "@/ApiHelper";

export interface ItemMasterLookup {
  itemCode: string;
  itemName: string;
}

export async function fetchItemByCode(
  itemCode: string,
): Promise<ItemMasterLookup | null> {
  const response = await Get("master/itemmaster/list", {}, false);
  const list: any[] = response.data?.data || [];
  const match = list.find((i) => i.itemCode === itemCode);
  if (!match) return null;
  return {
    itemCode: match.itemCode,
    itemName: match.itemName,
  };
}