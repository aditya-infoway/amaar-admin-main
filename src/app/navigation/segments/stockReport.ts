import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const stockReport: NavigationTree = {
  ...baseNavigationObj["stockReport"],
  childs: [
    {
      id: "stock_report.stockReport",
      type: "item",
      path: "/stock-report",
      title: "Stock Report",
      icon: "stock_report.stockReport",
    },
  ],
};