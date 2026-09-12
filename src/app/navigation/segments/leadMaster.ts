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
          {
            id: "leadMaster.sales-order",
            type: "item",
            path: "/lead-master/sales-order",
            title: "Sales Order",
            icon: "quotation.list",
        },
         {
              id: "leadMaster.work-order",
              type: "collapse",
              path: "/lead-master/work-order",
              title: "work order",
              transKey: "work order",
              icon: "leadMaster.work-order",
              childs: [
                {
                  id: "leadMaster.work-order.create-order",
                  type: "item",
                  path: "/lead-master/work-order/create-order",
                  title: "Create Order",
                  transKey: "Create Order",
                },
                {
                  id: "leadMaster.work-order.work-proccess",
                  type: "item",
                  path: "/lead-master/work-order/work-proccess",
                  title: "Work Proccess",
                  transKey: "Work Proccess",
                },
                  {
                  id: "leadMaster.material-availability.material-availability",
                  type: "item",
                  path: "/lead-master/work-order/material-availability",
                  title: "Material  Availability",
                  transKey: "Material  Availability",
                },
                    {
                  id: "leadMaster.work-order.indent",
                  type: "item",
                  path: "/lead-master/work-order/indent",
                  title: "Indent",
                  transKey: "Indent",
                },
              ],
            },
    ],
};