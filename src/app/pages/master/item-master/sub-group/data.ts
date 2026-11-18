export interface SubGroup {
  id: string;
  subGroupName: string;
  itemCategoryId: string;
  groupId: string;
  parentSubGroupId?: string; // 👈 add
  categoryName?: string;
  groupName?: string;
  createdBy?: string;
  createdType?: string;
  status: string;
  createdAt?: string;
}

export const emptySubGroup = (): SubGroup => ({
  id: "",
  subGroupName: "",
  itemCategoryId: "",
  groupId: "",
  parentSubGroupId: "", // 👈 add
  createdBy: "",
  createdType: "",
  status: "active",
});

export const mapApiSubGroupToSubGroup = (item: any): SubGroup => ({
  id: String(item.subGroupId),
  subGroupName: item.subGroupName,
  itemCategoryId:
    item.itemCategoryId != null ? String(item.itemCategoryId) : "",
  groupId: item.groupId != null ? String(item.groupId) : "",
  parentSubGroupId:
    item.parentSubGroupId != null ? String(item.parentSubGroupId) : "", // 👈 add
  categoryName: item.categoryName || "",
  groupName: item.groupName || "",
  createdBy: item.createdBy || "",
  createdType: item.createdType || "",
  status: item.status,
  createdAt: item.created,
});