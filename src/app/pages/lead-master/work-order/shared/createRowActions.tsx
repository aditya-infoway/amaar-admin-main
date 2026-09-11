import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useCallback, useState } from "react";
import { Row, Table } from "@tanstack/react-table";

import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { Button } from "@/components/ui";

interface RowActionExtraItem {
  key: string;
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  // Set to false to skip rendering this item for a given row (e.g. no file uploaded)
  show?: boolean;
}

interface RowActionsOptions<T> {
  // When true, adds a "View" item above Edit/Delete that calls
  // table.options.meta?.viewRow?.(row.original)
  withView?: boolean;
  // Extra menu items appended after View/Edit — e.g. "Aadhar Card", "PAN Card"
  extraItems?: (row: T) => RowActionExtraItem[];
}

export function createRowActions<T extends { id: string }>(
  entityName: string,
   options?: RowActionsOptions<T>,
) {
  const withView = options?.withView ?? false;
  const confirmMessages: ConfirmMessages = {
    pending: {
      description: `Are you sure you want to delete this ${entityName}? Once deleted, it cannot be restored.`,
    },
    success: {
      title: `${entityName} Deleted`,
    },
  };

  return function RowActions({ row, table }: { row: Row<T>; table: Table<T> }) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState(false);

    const handleDelete = useCallback(() => {
      setConfirmDeleteLoading(true);
      setTimeout(() => {
        table.options.meta?.deleteRow?.(row);
        setDeleteSuccess(true);
        setConfirmDeleteLoading(false);
      }, 300);
    }, [row, table.options.meta]);

      const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

    const extraItems =
      options?.extraItems?.(row.original)?.filter((item) => item.show !== false) ??
      [];

    return (
      <>
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton as={Button} isIcon className="size-8 rounded-full">
            <EllipsisHorizontalIcon className="size-4.5" />
          </MenuButton>

          <MenuItems
            transition
            anchor={{ to: "bottom end", gap: 8 }}
           className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 w-44 rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden transition duration-200 ease-out data-closed:translate-y-2 data-closed:opacity-0 dark:shadow-none"
          >
            {withView && (
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => table.options.meta?.viewRow?.(row.original)}
                    className={clsx(
                      "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                      focus &&
                        "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                    )}
                  >
                    <EyeIcon className="size-4.5 stroke-1" />
                    <span>View</span>
                  </button>
                )}
               </MenuItem>
  )}
  {extraItems.map((item) => {
    const Icon = item.icon ?? ArrowDownTrayIcon;

    return (
      <MenuItem key={item.key}>
        {({ focus }) => (
          <button
            type="button"
            onClick={item.onClick}
            className={clsx(
              "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
              focus &&
                "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
            )}
          >
            <Icon className="size-4.5 stroke-1" />
            <span>{item.label}</span>
          </button>
        )}
      </MenuItem>
    );
  })}
  <MenuItem>
    {({ focus }) => (
      <button
        type="button"
        onClick={() =>
          table.options.meta?.openEditDrawer?.(row.original)
        }
                  className={clsx(
                    "flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <PencilIcon className="size-4.5 stroke-1" />
                  <span>Edit</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(false);
                    setDeleteSuccess(false);
                    setDeleteModalOpen(true);
                  }}
                  className={clsx(
                    "text-this dark:text-this-light flex h-9 w-full items-center gap-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus && "bg-this/10 dark:bg-this-light/10",
                  )}
                >
                  <TrashIcon className="size-4.5 stroke-1" />
                  <span>Delete</span>
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>

        <ConfirmModal
          show={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          messages={confirmMessages}
          onOk={handleDelete}
          confirmLoading={confirmDeleteLoading}
          state={state}
        />
      </>
    );
  };
}
