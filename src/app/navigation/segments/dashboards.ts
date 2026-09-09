import { NavigationTree } from "@/@types/navigation";

export const dashboards: NavigationTree = {
  id: "dashboards",
  type: "collapse",
  path: "/dashboards",
  title: "Dashboard",
  icon: "dashboards",
  childs: [
    {
      id: "dashboard",
      type: "item",
      title: "Dashboard",
      path: "dashboards",
    },
  ],
};