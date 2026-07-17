export interface ItemCategory {
  id: string;
  categoryName: string;
  status: string;
  createdAt?: string;
}

export const emptyItemCategory = (): ItemCategory => ({
  id: "",
  categoryName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiItemCategoryToItemCategory = (item: any): ItemCategory => ({
  id: String(item.itemCategoryId),
  categoryName: item.categoryName,
  status: item.status,
  createdAt: item.created,
});