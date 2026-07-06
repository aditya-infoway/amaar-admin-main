import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const logout: NavigationTree = {
  ...baseNavigationObj["logout"],
  type: "item",
};
