import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const purchaseMaster: NavigationTree = {
  ...baseNavigationObj["purchaseMaster"],
  childs: [
    {
      id: "purchase_master.purchaseRegister",
      type: "item",
      path: "/purchase-master/purchase-register",
      title: "Purchase Register",
      icon: "purchase_master.purchaseRegister",
    },
    {
      id: "purchase_master.purchaseOrder",
      type: "item",
      path: "/purchase-master/purchase-order",
      title: "Purchase Order",
      icon: "purchase_master.purchaseOrder",
    },
  ],
};