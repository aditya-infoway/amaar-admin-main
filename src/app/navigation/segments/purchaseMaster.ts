import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const purchaseMaster: NavigationTree = {
  ...baseNavigationObj["purchaseMaster"],
  childs: [

    {
      id: "master.purchasemaster-label",
      type: "title",
      title: "Purchase ",
    },
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
    {
      id: "purchase_master.purchaseGrr",
      type: "item",
      path: "/purchase-master/purchase-grr",
      title: "Purchase GRR",
      icon: "purchase_master.purchaseGrr",
    },

    {
      id: "purchase_master.purchaseqc",
      type: "item",
      path: "/purchase-master/purchase-qc",
      title: "Purchase QC",
      icon: "purchase_master.purchaseGrr",
    },
   
 { id: "divider-stockmaster", type: "divider" },
    {
      id: "master.stockMaster-label",
      type: "title",
      title: "Stock ",
    },
     {
      id: "stock_report.stockReport",
      type: "item",
      path: "/stock-report/list",
      title: "Stock Report",
      icon: "stock_report.stockReport",
    },
    {
      id: "stock_report.stockAlert",
      type: "item",
      path: "/stock-report/alert",
      title: "Stock Alert",
      icon: "stock_report.stockReport",
    },
     { id: "divider-salesmaster", type: "divider" },
    {
      id: "master.salesMaster-label",
      type: "title",
      title: "Sales ",
    },
    {
      id: "purchase_master.sales-register",
      type: "item",
      path: "/purchase-master/sales-register",
      title: "Sales Register",
      icon: "purchase_master.purchaseGrr",
    },
     {
      id: "purchase_master.bodyregister",
      type: "item",
      path: "/purchase-master/body-register",
      title: "Body Register",
      icon: "purchase_master.purchaseGrr",
    },
    
  ],
};
