// import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";
import { baseNavigationObj } from "../baseNavigation";

export const master: NavigationTree = {
  ...baseNavigationObj["master"],
  childs: [
    // Quotation Master section (pehla section, upar divider nahi)
    {
      id: "master.quotationMaster-label",
      type: "title",
      title: "Quotation Master",
    },
    {
      id: "master.quotation-master.createmaster",
      type: "item",
      path: "/master/quotation-master/createmaster",
      title: "Create Master",
      transKey: "Create Master",
    },
    {
      id: "master.quotation-master.createpricing",
      type: "item",
      path: "/master/quotation-master/createpricing",
      title: "Create Pricing",
      transKey: "Create Pricing",
    },
    {
      id: "master.quotation-master.modelprice",
      type: "item",
      path: "/master/quotation-master/modelprice",
      title: "Model Pricing",
      transKey: "Model Pricing",
    },

    // Item Master section
    { id: "divider-itemmaster", type: "divider" },
    {
      id: "master.itemMaster-label",
      type: "title",
      title: "Item Master",
    },
    {
      id: "itemMaster.list",
      type: "item",
      path: "/master/item-master/item-list",
      title: "Item Master",
      transKey: "nav.itemMaster.list",
    },
    {
      id: "itemBarcode.list",
      type: "item",
      path: "/master/item-master/barcode-manager",
      title: "Barcode Manager",
      transKey: "Barcode Manager",
    },
    {
      id: "itemlocation.list",
      type: "item",
      path: "/master/item-master/item-location",
      title: "Item Location",
      transKey: "Item Location",
    },
    {
      id: "itemCategory.list",
      type: "item",
      path: "/master/item-master/item-category",
      title: "Item Category",
      transKey: "Item Category",
    },
    {
      id: "itemGroup.list",
      type: "item",
      path: "/master/item-master/item-group",
      title: "Item Group",
      transKey: "Item Group",
    },
    {
      id: "itemSubGroup.list",
      type: "item",
      path: "/master/item-master/sub-group",
      title: "Sub Group",
      transKey: "Sub Group",
    },
    {
      id: "itemBom.bom",
      type: "item",
      path: "/master/item-master/bom",
      title: "BOM",
      transKey: "BOM",
    },

    // Lead Master section
    { id: "divider-leadmaster", type: "divider" },
    {
      id: "master.leadMaster-label",
      type: "title",
      title: "Lead Master",
    },
    {
      id: "leadMaster.enquiry",
      type: "item",
      path: "/lead-master/enquiry",
      title: "Create Enquiry",
    },
    {
      id: "leadMaster.quotation",
      type: "item",
      path: "/lead-master/quotation",
      title: "Quotation",
    },
    {
      id: "leadMaster.sales-order",
      type: "item",
      path: "/lead-master/sales-order",
      title: "Sales Order",
    },
    {
      id: "leadMaster.work-order.create-order",
      type: "item",
      path: "/lead-master/work-order/create-order",
      title: "Create Order",
    },
    {
      id: "leadMaster.work-order.work-proccess",
      type: "item",
      path: "/lead-master/work-order/work-proccess",
      title: "Work Process",
    },
    {
      id: "leadMaster.work-order.material-availability",
      type: "item",
      path: "/lead-master/work-order/material-availability",
      title: "Material Availability",
    },
    {
      id: "leadMaster.work-order.indent",
      type: "item",
      path: "/lead-master/work-order/indent",
      title: "Indent",
    },
  ],
};
