import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const master: NavigationTree = {
  ...baseNavigationObj["master"],
  childs: [
    {
      id: "master.category",
      type: "item",
      path: "/master/category",
      title: "Category",
      transKey: "nav.master.category",
      icon: "master.category",
    },
    {
      id: "master.productSeries",
      type: "item",
      path: "/master/product-series",
      title: "Product Series",
      transKey: "nav.master.productSeries",
      icon: "master.productSeries",
    },
    {
      id: "master.model",
      type: "item",
      path: "/master/model",
      title: "Model",
      transKey: "nav.master.model",
      icon: "master.model",
    },
    {
      id: "master.variant",
      type: "item",
      path: "/master/variant",
      title: "Variant",
      transKey: "nav.master.variant",
      icon: "master.variant",
    },
    {
      id: "master.variantStructure",
      type: "item",
      path: "/master/variant-structure",
      title: "Variant Structure",
      transKey: "nav.master.variantStructure",
      icon: "master.variantStructure",
    },
     {
      id: "master.bom",
      type: "item",
      path: "/master/bom",
      title: "BOM",
      icon: "master.bom",
    },
  ],
};
