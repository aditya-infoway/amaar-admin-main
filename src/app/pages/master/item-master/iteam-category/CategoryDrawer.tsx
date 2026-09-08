import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { Get } from "@/ApiHelper";
import { statusOptions } from "../shared/constants";
import { ItemCategory } from "./data";

interface ItemCategoryDrawerProps {
  isOpen: boolean;
  close: () => void;
  itemCategory: ItemCategory | null;
  onSave: (itemCategory: ItemCategory) => void;
}

export function ItemCategoryDrawer({
  isOpen,
  close,
  itemCategory,
  onSave,
}: ItemCategoryDrawerProps) {
  const isEdit = Boolean(itemCategory?.id);
  const [checkingName, setCheckingName] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ItemCategory>({
    values: itemCategory || undefined,
  });

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  // ---- Check categoryName uniqueness against currently loaded list via list API ----
  const checkNameUnique = async (name: string) => {
    if (!name) return true;
    setCheckingName(true);
    try {
      const response = await Get("master/itemcategory/list", {}, false);
      if (response.data?.success) {
        const allItems: any[] = response.data.data || [];
        const isTaken = allItems.some(
          (item) =>
            item.categoryName?.trim().toLowerCase() ===
              name.trim().toLowerCase() &&
            String(item.itemCategoryId) !== String(itemCategory?.id || "")
        );
        return !isTaken;
      }
      return true;
    } catch (error) {
      return true; // fail-open on client check; server will still validate
    } finally {
      setCheckingName(false);
    }
  };

  const onSubmit = async (data: ItemCategory) => {
    const isUnique = await checkNameUnique(data.categoryName);

    if (!isUnique) {
      setError("categoryName", {
        type: "manual",
        message: "Item category already exists. Please enter a different name.",
      });
      return;
    }

    onSave({ ...data, id: itemCategory?.id || "" });
    handleClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white transition-transform duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="dark:text-dark-50 text-lg font-semibold text-white">
              {isEdit ? "Edit Item Category" : "Create Item Category"}
            </h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {/* Item Category Name */}
              <Input
                {...register("categoryName", {
                  required: "Item Category Name is required",
                  onChange: () => clearErrors("categoryName"),
                })}
                label="Item Category Name"
                placeholder="Enter item category name"
                error={errors.categoryName?.message}
                disabled={checkingName}
              />

              {/* Status */}
              <Controller
                control={control}
                name="status"
                rules={{ required: "Status is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={statusOptions}
                    value={
                      statusOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Status"
                    placeholder="Select status"
                    displayField="label"
                    error={errors.status?.message}
                    {...rest}
                  />
                )}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={checkingName}>
                {checkingName ? "Checking..." : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}