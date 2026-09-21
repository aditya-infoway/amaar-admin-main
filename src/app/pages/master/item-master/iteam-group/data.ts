export interface ItemGroup {
  id: string;
  groupName: string;
  itemCategoryId: string;
  categoryName?: string;
   createdBy?: string;  
  createdType?: string; 
  status: string;
  createdAt?: string;
}

export const emptyItemGroup = (): ItemGroup => ({
  id: "",
  groupName: "",
  itemCategoryId: "",
   createdBy: "", 
    createdType :"",
  status: "active",
});

export const mapApiItemGroupToItemGroup = (item: any): ItemGroup => ({
  id: String(item.itemGroupId),
  groupName: item.groupName,
  itemCategoryId: item.itemCategoryId != null ? String(item.itemCategoryId) : "",
  categoryName: item.categoryName || "",
   createdBy: item.createdBy || "",  
     createdType: item.createdType || "", 
  status: item.status,
  createdAt: item.created,
});