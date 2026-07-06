import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const enquiryMaster: NavigationTree = {
  ...baseNavigationObj["enquiryMaster"],
  childs: [
    {
      id: "enquiry_master.enquiryType",
      type: "item",
      path: "/enquiry-master/enquiry-type",
      title: "Enquiry Type",
      icon: "enquiry_master.enquiryType",
    },
    {
      id: "enquiry_master.enquirySource",
      type: "item",
      path: "/enquiry-master/enquiry-source",
      title: "Enquiry Source",
      icon: "enquiry_master.enquirySource",
    },
    {
      id: "enquiry_master.profession",
      type: "item",
      path: "/enquiry-master/profession",
      title: "Profession",
      icon: "enquiry_master.profession",
    },
    {
      id: "enquiry_master.enquiryStatus",
      type: "item",
      path: "/enquiry-master/enquiry-status",
      title: "Enquiry Status",
      icon: "enquiry_master.enquiryStatus",
    },
    {
      id: "enquiry_master.banker",
      type: "item",
      path: "/enquiry-master/banker",
      title: "Banker",
      icon: "enquiry_master.banker",
    },
    {
      id: "enquiry_master.finance",
      type: "item",
      path: "/enquiry-master/finance",
      title: "Finance",
      icon: "enquiry_master.finance",
    },
  ],
};
