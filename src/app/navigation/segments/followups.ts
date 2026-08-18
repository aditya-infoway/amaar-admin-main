import { NavigationTree } from "@/@types/navigation";

export const followups: NavigationTree = {
  id: "followups",
  type: "collapse",
  path: "/followUps",
  title: "FollowUps",
  icon: "followups",
  childs: [
    {
      id: "todayfollowups",
      type: "item",
      title: "Today Followups",
      path: "followups/todayfollowups",
    },
  ],
};