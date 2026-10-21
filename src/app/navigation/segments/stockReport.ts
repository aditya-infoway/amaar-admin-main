import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const stockReport: NavigationTree = {
  ...baseNavigationObj["stockReport"],
  childs: [
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
  ],
};
