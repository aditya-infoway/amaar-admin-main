import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const userMaster: NavigationTree = {
    ...baseNavigationObj["userMaster"],
    childs: [
        {
            id: "user_master.accounts",
            type: "item",
            path: "/user-master/accounts",
            title: "Accounts",
            icon: "user_master.createAccount",
        },
        {
            id: "user_master.createEmployee",
            type: "item",
            path: "/user-master/create-employee",
            title: "Create Employee",
            icon: "user_master.createEmployee",
        },
    ],
};