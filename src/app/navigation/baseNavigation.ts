import { NavigationTree } from "@/@types/navigation";

/**
 * Object containing the base navigation items for the application.
 * This object serves as a centralized configuration for main navigation elements.
 */
export const baseNavigationObj: Record<string, NavigationTree> = {
  dashboards: {
    id: "dashboards",
    type: "item",
    path: "/dashboards/home",
    title: "Dashboard",
    transKey: "nav.dashboards.dashboards",
    icon: "dashboards",
  },

  master: {
    id: "master",
    type: "collapse",
    path: "/master",
    title: "Master",
    transKey: "nav.master.master",
    icon: "master",
  },

  itemMaster: {
    id: "itemMaster",
    type: "collapse",
    path: "/item-master",
    title: "Item Master",
    transKey: "nav.itemMaster.itemMaster",
    icon: "itemMaster",
  },
    leadMaster: {
    id: "leadMaster",
    type: "collapse", 
    path: "/lead-master",
    title: "Lead Master",
    icon: "leadMaster",
  },


  enquiryMaster: {
    id: "enquiryMaster",
    type: "collapse",
    path: "/enquiry-master",
    title: "Enquiry Master",
    icon: "enquiryMaster",
  },

  accountingMaster: {
    id: "accountingMaster",
    type: "collapse",
    path: "/accounting-master",
    title: "Accounting Master",
    icon: "accountingMaster",
  },
  purchaseMaster: {
    id: "purchaseMaster",
    type: "collapse",
    path: "/purchase-master",
    title: "Purchase Master",
    icon: "purchaseMaster",
  },
  userMaster: {
    id: "userMaster",
    type: "collapse",
    path: "/user-master",
    title: "User Master",
    icon: "userMaster",
  },

  logout: {
    id: "logout",
    type: "item",
    path: "/login",
    title: "Logout",
    transKey: "nav.logout",
    icon: "logout",
  },
};

/**
 * Array of navigation items derived from baseNavigationObj.
 * This array format is used for rendering the navigation menu in the application.
 */
export const baseNavigation: NavigationTree[] = Array.from(
  Object.values(baseNavigationObj),
);