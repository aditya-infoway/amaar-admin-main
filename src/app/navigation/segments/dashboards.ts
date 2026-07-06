import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const dashboards: NavigationTree = {
  ...baseNavigationObj["dashboards"],
  type: "item",
};
