import { ReactNode, useEffect, useState } from "react";
import { useBlocker } from "react-router";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { UnsavedChangesContext } from "./context";

export function UnsavedChangesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isDirty, setIsDirty] = useState(false);

  // ============================================================
  // BLOCK ALL REACT ROUTER NAVIGATION WHEN FORM IS DIRTY
  // ============================================================

  const blocker = useBlocker(isDirty);

  // ============================================================
  // WHEN NAVIGATION IS BLOCKED
  // ============================================================

  const isOpen = blocker.state === "blocked";

  // ============================================================
  // CONFIRM LEAVE
  // ============================================================

  const handleLeave = () => {
    if (blocker.state === "blocked") {
      setIsDirty(false);
      blocker.proceed();
    }
  };

  // ============================================================
  // CANCEL NAVIGATION
  // ============================================================

  const handleClose = () => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  // ============================================================
  // CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      setIsDirty(false);
    };
  }, []);

  return (
    <UnsavedChangesContext.Provider
      value={{
        isDirty,
        setDirty: setIsDirty,

        // Keep this function for your existing buttons/components.
        requestNavigation: (onConfirm) => {
          if (!isDirty) {
            onConfirm();
            return;
          }

          // Since global blocker handles Router navigation,
          // this is mainly useful for custom/non-router actions.
          onConfirm();
        },
      }}
    >
      {children}

      <ConfirmModal
        show={isOpen}
        onClose={handleClose}
        onOk={handleLeave}
        state="pending"
        messages={{
          pending: {
            Icon: ExclamationTriangleIcon,
            title: "Unsaved Changes",
            description:
              "You have unsaved changes. If you leave this page, your entered data will be lost.",
            actionText: "Leave",
            iconClassName: "text-warning",
          },
        }}
      />
    </UnsavedChangesContext.Provider>
  );
}