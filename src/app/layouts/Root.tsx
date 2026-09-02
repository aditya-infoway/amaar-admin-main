// Import Dependencies
import { Outlet, ScrollRestoration } from "react-router";
import { lazy } from "react";

// Local Imports
import { useAuthContext } from "@/app/contexts/auth/context";
import { SplashScreen } from "@/components/template/SplashScreen";
import { Loadable } from "@/components/shared/Loadable";
import { Progress } from "@/components/template/Progress";
import { UnsavedChangesProvider } from "@/app/contexts/unsavedChanges/provider";

const Toaster = Loadable(lazy(() => import("@/components/template/Toaster")));
// const Customizer = Loadable(
//   lazy(() => import("components/template/Customizer")),
// );
const Tooltip = Loadable(lazy(() => import("@/components/template/Tooltip")));

// ----------------------------------------------------------------------

function Root() {
  const { isInitialized } = useAuthContext();

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <>
      <UnsavedChangesProvider>
      <Progress />
      <ScrollRestoration />
      <Outlet />
      <Tooltip />
      <Toaster />
      {/* <Customizer /> */}
      </UnsavedChangesProvider>
    </>
  );
}

export default Root;
