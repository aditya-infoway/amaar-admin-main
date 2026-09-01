// src/pages/master/bom/bomTree.ts
import { BOMComponent, BOMItem } from "./types";

export interface BOMTreeNode {
  itemCode: string;
  itemName: string;
  qty: string;
  children: BOMTreeNode[];
}

export function buildBOMTree(
  rootCode: string,
  components: BOMComponent[],
  allItems: BOMItem[],
  visited: Set<string> = new Set(),
): BOMTreeNode[] {
  if (visited.has(rootCode)) return [];
  const nextVisited = new Set(visited).add(rootCode);

  return components
    .filter((c) => c.parentCode === rootCode)
    .map((c) => ({
       itemCode: c.childCode,
       itemName: c.childName || "—",
       qty: c.qty,
     children: buildBOMTree(c.childCode, components, allItems, nextVisited),
     }));
}

export function buildFullBOMTree(
  rootCode: string,
  components: BOMComponent[],
  allItems: BOMItem[],
): BOMTreeNode {
  const rootItem = allItems.find((i) => i.itemCode === rootCode);
  return {
    itemCode: rootCode,
    itemName: rootItem?.itemName || "—",
    qty: "1",
    children: buildBOMTree(rootCode, components, allItems),
  };
}