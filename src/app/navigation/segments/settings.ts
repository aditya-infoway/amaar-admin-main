import { NavigationTree } from "@/@types/navigation";

export const settings: NavigationTree = {
  id: "settings",
  type: "item",
  path: "/settings",
  title: "Settings",
  transKey: "nav.settings.settings",
  icon: "settings",
  childs: [
    {
      id: "general",
      type: "item",
      path: "/settings/general",
      title: "General",
      transKey: "nav.settings.general",
      icon: "settings.general",
    },
    {
      id: "prefix",
      type: "item",
      path: "/settings/prefix",
      title: "Prefix",
      icon: "settings.prefix",
    },
    {
      id: "appearance",
      type: "item",
      path: "/settings/appearance",
      title: "Appearance",
      transKey: "nav.settings.appearance",
      icon: "settings.appearance",
    },
  ],
};
