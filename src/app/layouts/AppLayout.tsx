// Import Dependencies
import { Outlet } from "react-router";
import { useLayoutEffect } from "react";

// Local Imports
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { useThemeContext } from "@/app/contexts/theme/context";
import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";

// ----------------------------------------------------------------------

export function AppLayout() {
  const { themeLayout } = useThemeContext();
  const { close } = useSidebarContext();
  const { lgAndDown } = useBreakpointsContext();

  useLayoutEffect(() => {
    // Login/refresh par sidebar hamesha closed rahega
    // Sirf hamburger icon click se open hoga
    return () => {
      if (lgAndDown) close();
    };
  }, [close, lgAndDown]);

  useLayoutEffect(() => {
    if (document?.body?.dataset) {
      let cancelled = false;
      document.body.dataset.layout = "main-layout";
      queueMicrotask(() => {
        if (cancelled) return;
        document.body.dataset.layout = "main-layout";
      });
      return () => {
        cancelled = true;
        document.body.dataset.layout = themeLayout;
      };
    }
  }, [themeLayout]);

  return <Outlet />;
}
