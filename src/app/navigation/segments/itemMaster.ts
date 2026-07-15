import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const itemMaster: NavigationTree = {
  ...baseNavigationObj["itemMaster"],
  childs: [
    {
      id: "itemMaster.list",
      type: "item",
      path: "/item-master/item-list",
      title: "Item Master",
      transKey: "nav.itemMaster.list",
      icon: "itemMaster.list",
    },
    {
      id: "itemCategory.list",
      type: "item",
      path: "/item-master/item-category",
      title: "Item Category",
      icon: "itemCategory.list",
    },
    {
      id: "itemGroup.list",
      type: "item",
      path: "/item-master/item-group",
      title: "Item Group",
      icon: "itemGroup.list",
    },
  ],
};
