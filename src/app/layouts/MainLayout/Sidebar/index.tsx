// Import Dependencies
import { useMemo, useState } from "react";
import { useLocation } from "react-router";
// Local Imports
import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { navigation } from "@/app/navigation";
import { settings } from "@/app/navigation/segments/settings";
import { useDidUpdate } from "@/hooks";
import { isRouteActive } from "@/utils/isRouteActive";
import { MainPanel } from "./MainPanel";
import { PrimePanel } from "./PrimePanel";
// ----------------------------------------------------------------------

// Segments that can appear in PrimePanel but aren't part of the main visible nav list
const allSegments = [...navigation, settings];

export type SegmentPath = string | undefined;
export function Sidebar() {
  const { pathname } = useLocation();
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close } = useSidebarContext();
  const initialSegment = useMemo(
    () => allSegments.find((item) => isRouteActive(item.path, pathname)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [activeSegmentPath, setActiveSegmentPath] = useState<SegmentPath>(
    initialSegment?.path,
  );
  const currentSegment = useMemo(() => {
    return allSegments.find((item) => item.path === activeSegmentPath);
  }, [activeSegmentPath]);
  useDidUpdate(() => {
    const activePath = allSegments.find((item) =>
      isRouteActive(item.path, pathname),
    )?.path;
    setActiveSegmentPath(activePath);
  }, [pathname]);
  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);
  return (
    <>
      <MainPanel
        nav={navigation}
        activeSegmentPath={activeSegmentPath}
        setActiveSegmentPath={setActiveSegmentPath}
      />
      <PrimePanel
        close={close}
        currentSegment={currentSegment}
        pathname={pathname}
      />
    </>
  );
}