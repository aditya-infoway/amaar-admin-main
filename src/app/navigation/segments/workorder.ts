import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const workOrder: NavigationTree = {
    ...baseNavigationObj["workOrder"],
    childs: [
        {
            id: "work-order.create-order",
            type: "item",
            path: "/work-order/create-order",
            title: "Create Order",
            icon: "user_master.createAccount",
        },
        {
            id: "user_master.createEmployee",
            type: "item",
            path: "/user-master/create-employee",
            title: "Work Proccess",
            icon: "user_master.createEmployee",
        },
    ],
};