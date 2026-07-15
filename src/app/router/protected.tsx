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
                Component: (await import("@/app/pages/master/category")).default,
              }),
            },
            {
              path: "bom",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/bom/form")).default,
              }),
            },
            {
              path: "product-series",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/master/product-series")
                ).default,
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
                Component: (await import("@/app/pages/master/brand/body-type")).default,
              }),
            },
            {
              path: "axle-brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/axle-brand")).default,
              }),
            },
            {
              path: "hydraulic-brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/hydraulic-brand")).default,
              }),
            },
            {
              path: "tyre-brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand/tyre-brand")).default,
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
                Component: (await import("@/app/pages/item-master/form")).default,
              }),
            },
            {
              path: "edit/:id",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form")).default,
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
                Component: (await import("@/app/pages/item-master/form")).default,
              }),
            },

            {
              path: "edit/:id",
              lazy: async () => ({
                Component: (await import("@/app/pages/item-master/form")).default,
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
                Component: (
                  await import("@/app/pages/item-master/iteam-group")
                ).default,
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
                      await import(
                        "@/app/pages/purchase-master/purchase-register"
                      )
                    ).default,
                  }),
                },
                {
                  path: "create",
                  lazy: async () => ({
                    Component: (
                      await import(
                        "@/app/pages/purchase-master/purchase-register/form"
                      )
                    ).default,
                  }),
                },
                {
                  path: "edit/:id",
                  lazy: async () => ({
                    Component: (
                      await import(
                        "@/app/pages/purchase-master/purchase-register/form"
                      )
                    ).default,
                  }),
                },
              ],
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
                Component: (
                  await import("@/app/pages/lead-master/enquiry")
                ).default,
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
                Component: (
                  await import("@/app/pages/lead-master/quotation")
                ).default,
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
      ],
    },
    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("@/app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
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
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };