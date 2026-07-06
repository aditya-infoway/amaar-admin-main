import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const itemMaster: NavigationTree = {
  ...baseNavigationObj["itemMaster"],
  childs: [
    {
      id: "itemMaster.list",
      type: "item",
      path: "/item-master",
      title: "Item Master",
      transKey: "nav.itemMaster.list",
      icon: "itemMaster.list",
    },
  ],
};
