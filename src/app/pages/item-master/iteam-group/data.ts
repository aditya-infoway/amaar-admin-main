export interface ItemGroup {
  id: string;
  groupName: string;
  status: string;
  createdAt?: string;
}

export const emptyItemGroup = (): ItemGroup => ({
  id: "",
  groupName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiItemGroupToItemGroup = (item: any): ItemGroup => ({
  id: String(item.itemGroupId),
  groupName: item.groupName,
  status: item.status,
  createdAt: item.created,
});