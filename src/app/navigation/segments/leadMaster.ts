import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const leadMaster: NavigationTree = {
    ...baseNavigationObj["leadMaster"],
    childs: [
        {
            id: "leadMaster.enquiry",
            type: "item",
            path: "/lead-master/enquiry",
            title: "Create Enquiry ",
            icon: "enquiry.list",
        },
        {
            id: "leadMaster.quotation",
            type: "item",
            path: "/lead-master/quotation",
            title: "Quotation",
            icon: "quotation.list",
        },
    ],
};