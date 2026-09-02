import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "../layouts/DynamicLayout";
import { AppLayout } from "../layouts/AppLayout";

/**
 * Protected routes configuration
 * These routes require authentication to access
 * Uses AuthGuard middleware to verify user authentication
 */
const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/home" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/dashboards/home/crm-analytics")
                ).default,
              }),
            },
          ],
        },

        {
          path: "master",
          children: [
            {
              index: true,
              element: <Navigate to="/master/category" replace />,
            },
            {
              path: "category",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/category"))
                  .default,
              }),
            },
            {
              path: "bom",
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (await import("@/app/pages/master/bom"))
                      .default,
                  }),
                },
                {
                  path: "create",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/bom/form")
                    ).default,
                  }),
                },
                {
                  path: "edit/:id",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/bom/form")
                    ).default,
                  }),
                },
                {
                  path: "view/:id",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/bom/BOMViewPage")
                    ).default,
                  }),
                },
              ],
            },
            {
              path: "product-series",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/product-series"))
                  .default,
              }),
            },
            {
              path: "model",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/model")).default,
              }),
            },
            {
              path: "variant",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/variant")).default,
              }),
            },
            {
              path: "variant-structure",
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/variant-structure")
                    ).default,
                  }),
                },
                {
                  path: "create",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/variant-structure/form")
                    ).default,
                  }),
                },
                {
                  path: "edit/:id",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/variant-structure/form")
                    ).default,
                  }),
                },
              ],
            },
          ],
        },

        {
          path: "master/brand",
          children: [
            {
              index: true,
              element: <Navigate to="/master/brand/body-type" replace />,
            },
            {
              path: "body-type",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/body-type"))
                  .default,
              }),
            },
            {
              path: "axle-brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/axle-brand"))
                  .default,
              }),
            },
            {
              path: "hydraulic-brand",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/master/brand/hydraulic-brand")
                ).default,
              }),
            },
            {
              path: "tyre-brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/tyre-brand"))
                  .default,
              }),
            },
          ],
        },

        {
          path: "master/quotation-master",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/master/quotation-master/createmaster" replace />
              ),
            },
            {
              path: "createmaster",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/master/quotation-master/createmaster")
                ).default,
              }),
            },
             {
              path: "createpricing",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/master/quotation-master/createpricing")
                ).default,
              }),
            },
          ],
        },

        {
          path: "enquiry-master",
          children: [
            {
              index: true,
              element: <Navigate to="/enquiry-master/enquiry-type" replace />,
            },

            {
              path: "enquiry-type",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/enquiry-type/index")
                ).default,
              }),
            },

            {
              path: "enquiry-source",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/enquiry-source")
                ).default,
              }),
            },

            {
              path: "profession",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/profession")
                ).default,
              }),
            },

            {
              path: "enquiry-status",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/enquiry-master/enquiry-status")
                ).default,
              }),
            },

            {
              path: "banker",
              lazy: async () => ({
                Component: (await import("@/app/pages/enquiry-master/banker"))
                  .default,
              }),
            },

            {
              path: "finance",
              lazy: async () => ({
                Component: (await import("@/app/pages/enquiry-master/finance"))
                  .default,
              }),
            },
          ],
        },

        {
          path: "item-master",
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master")).default,
              }),
            },
            {
              path: "create",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form"))
                  .default,
              }),
            },
            {
              path: "edit/:id",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form"))
                  .default,
              }),
            },
          ],
        },
        {
          path: "item-master",
          children: [
            {
              index: true,
              element: <Navigate to="/item-master/item-list" replace />,
            },

            {
              path: "item-list",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master")).default,
              }),
            },

            {
              path: "create",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form"))
                  .default,
              }),
            },

            {
              path: "edit/:id",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form"))
                  .default,
              }),
            },

            {
              path: "barcode-manager",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/item-master/barcode-manager")
                ).default,
              }),
            },

            {
              path: "item-category",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/item-master/iteam-category")
                ).default,
              }),
            },

            {
              path: "item-group",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/iteam-group"))
                  .default,
              }),
            },
          ],
        },
        {
          path: "accounting-master",
          children: [
            {
              index: true,
              element: <Navigate to="/accounting-master/debit-note" replace />,
            },

            {
              path: "debit-note",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/debit-note")
                ).default,
              }),
            },

            {
              path: "credit-note",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/credit-note")
                ).default,
              }),
            },

            {
              path: "cash-payment",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/cash-payment")
                ).default,
              }),
            },

            {
              path: "bank-payment",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/bank-payment")
                ).default,
              }),
            },

            {
              path: "cash-receipt",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/cash-receipt")
                ).default,
              }),
            },

            {
              path: "bank-receipt",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/bank-receipt")
                ).default,
              }),
            },

            {
              path: "contra",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/contra")
                ).default,
              }),
            },

            {
              path: "journal-entry",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/journal-entry")
                ).default,
              }),
            },
            {
              path: "cash-book",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/cash-book")
                ).default,
              }),
            },
            {
              path: "bank-book",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/accounting-master/bank-book")
                ).default,
              }),
            },
            {
              path: "ledger-report",
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/accounting-master/ledger-report")
                    ).default,
                  }),
                },
                {
                  path: "details/:id",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/accounting-master/ledger-report/details")
                    ).default,
                  }),
                },
              ],
            },
          ],
        },
        {
          path: "purchase-master",
          children: [
            {
              index: true,
              element: (
                <Navigate to="/purchase-master/purchase-register" replace />
              ),
            },

            {
              path: "purchase-register",
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/purchase-master/purchase-register")
                    ).default,
                  }),
                },
                {
                  path: "create",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/purchase-master/purchase-register/form")
                    ).default,
                  }),
                },
                {
                  path: "edit/:id",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/purchase-master/purchase-register/form")
                    ).default,
                  }),
                },
              ],
            },
            {
              path: "purchase-order",
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/purchase-master/purchase-order")
                    ).default,
                  }),
                },
                {
                  path: "create",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/purchase-master/purchase-order")
                    ).default,
                  }),
                },
              ],
            },
          ],
        },
        {
          path: "stock-report",
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (await import("@/app/pages/stock-report")).default,
              }),
            },
            {
              path: ":itemId",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/stock-report/StockReportDetailPage")
                ).default,
              }),
            },
          ],
        },
        // In your route configuration file
        {
          path: "user-master",
          children: [
            {
              index: true,
              element: <Navigate to="/user-master/accounts" replace />,
            },
            {
              path: "accounts",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/user-master/create-account")
                ).default,
              }),
            },
            {
              path: "accounts/create",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/user-master/create-account/form")
                ).AccountForm,
              }),
            },
            {
              path: "accounts/edit/:id",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/user-master/create-account/form")
                ).AccountForm,
              }),
            },
            {
              path: "create-employee",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/user-master/create-employee")
                ).default,
              }),
            },
          ],
        },
        {
          path: "lead-master",
          children: [
            {
              index: true,
              element: <Navigate to="/lead-master/enquiry" replace />,
            },
            {
              path: "enquiry",
              lazy: async () => ({
                Component: (await import("@/app/pages/lead-master/enquiry"))
                  .default,
              }),
            },
            // {
            //   path: "enquiry/create",
            //   lazy: async () => ({
            //     Component: (
            //       await import("@/app/pages/lead-master/enquiry/form")
            //     ).EnquiryForm,
            //   }),
            // },
            // {
            //   path: "enquiry/edit/:id",
            //   lazy: async () => ({
            //     Component: (
            //       await import("@/app/pages/lead-master/enquiry/form")
            //     ).EnquiryForm,
            //   }),
            // },
            {
              path: "quotation",
              lazy: async () => ({
                Component: (await import("@/app/pages/lead-master/quotation"))
                  .default,
              }),
            },
            // {
            //   path: "quotation/create",
            //   lazy: async () => ({
            //     Component: (
            //       await import("@/app/pages/lead-master/quotation/form")
            //     ).QuotationForm,
            //   }),
            // },
            // {
            //   path: "quotation/edit/:id",
            //   lazy: async () => ({
            //     Component: (
            //       await import("@/app/pages/lead-master/quotation/form")
            //     ).QuotationForm,
            //   }),
            // },
          ],
        },
         // Followups
        {
          path: "followups",
          children: [
            {
              index: true,
              element: <Navigate to="todayfollowups" replace /> ,
            },

            {
              path: "todayfollowups",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/followup/todayfolloups")
                ).default,
              }),
            },

            {
              path: "follow-up/:id",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/followup/followup")
                ).default,
              }),
            },

            {
              path: "history/:id",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/followup/followuphistory")
                ).default,
              }),
            },

          ],
        },


        
           // ============================================================
        // SETTINGS
        // ============================================================
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("@/app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" replace />,
            },

            {
              path: "general",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/General")
                ).default,
              }),
            },

            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/Appearance")
                ).default,
              }),
            },

            {
              path: "prefix",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/Prefix")
                ).default,
              }),
            },
          ],
        },
      ],
    },

    // ============================================================
    // APP LAYOUT SETTINGS ROUTE REMOVED
    // ============================================================
    // {
    //   Component: AppLayout,
    //   children: [
    //     ...
    //   ],
    // },
  ],
};

export { protectedRoutes };