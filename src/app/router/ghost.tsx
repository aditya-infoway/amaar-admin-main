import { RouteObject } from "react-router";
import GhostGuard from "@/middleware/GhostGuard";

const ghostRoutes: RouteObject = {
  id: "ghost",
  Component: GhostGuard,
  children: [
    {
      path: "login",
      lazy: async () => ({
        Component: (await import("@/app/pages/Auth")).default,
      }),
    },
    {
      path: "select-company",
      lazy: async () => ({
        Component: (await import("@/app/pages/Auth/select-company")).default,
      }),
    },
    {
      path: "otp",
      lazy: async () => ({
        Component: (await import("@/app/pages/Auth/otp")).default,
      }),
    },
  ],
};

export { ghostRoutes };