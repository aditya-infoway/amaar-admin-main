import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Get, Post, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import { STAGE_OPTIONS, type ItemCategory } from "./data";

interface Props {
  isOpen: boolean;
  close: () => void;
  itemCategory: ItemCategory | null;
  onSave: () => void;
}

interface Option {
  id: string;
  label: string;
}

export function ItemCategoryDrawer({
  isOpen,
  close,
  itemCategory,
  onSave,
}: Props) {
  const isEditing = Boolean(itemCategory?.id);

  const [categoryOptions, setCategoryOptions] = useState<Option[]>([]);
  const [selectedStage, setSelectedStage] = useState<Option[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Option[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Item category list — ⚠️ endpoint apne backend ke hisaab se change karo
  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      try {
        const response = await Get("master/itemcategory/list", {}, false);

        if (response?.data?.success || response?.data?.status === 200) {
          const list = response.data.data || [];
          setCategoryOptions(
            list.map((c: any) => ({
                id: String(c.id ?? c.itemCategoryId ?? c.categoryId),
              label: c.categoryName ?? c.name,
            })),
          );
        }
      } catch (error) {
        console.error("Item category list error:", error);
        toasterrormsg("Unable to load item categories.");
      }
    };

    fetchCategories();
  }, [isOpen]);

  // Prefill on edit / reset on add
  useEffect(() => {
    if (!isOpen) return;

    queueMicrotask(() => {
      if (itemCategory?.id) {
        const stage = STAGE_OPTIONS.find((s) => s.id === itemCategory.stage);
        setSelectedStage(stage ? [stage] : []);

        const cat = categoryOptions.find(
          (c) => c.id === String(itemCategory.categoryId),
        );
        setSelectedCategory(cat ? [cat] : []);
      } else {
        setSelectedStage([]);
        setSelectedCategory([]);
      }
      setErrors({});
    });
  }, [isOpen, itemCategory, categoryOptions]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!selectedStage[0]) next.stage = "Select a Stage";
    if (!selectedCategory[0]) next.category = "Select an Item Category";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
  const financialYearId = localStorage.getItem("financialYearId");

  if (!financialYearId) {
    toasterrormsg("Financial Year not found. Please select a company year.");
    return;
  }
    const payload = {
            financialYearId: Number(financialYearId),
       stage: selectedStage[0].id,
      categoryId: Number(selectedCategory[0].id),
    };

    try {
      // ⚠️ endpoints apne backend ke hisaab se
      const response =
        isEditing && itemCategory?.id
          ? await Put(`itemcategory-stage/${itemCategory.id}`, payload, false)
          : await Post("itemcategory-stage/create", payload, false);

      const res = response?.data;

      if (res?.success || res?.status === 200) {
        toastsuccessmsg(
          res?.message || (isEditing ? "Updated successfully" : "Saved successfully"),
        );
        onSave();
        close();
      } else {
        toasterrormsg(res?.message || "Failed to save.");
      }
    } catch (error: any) {
      console.error("Item category save error:", error);
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving.",
      );
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-2xl transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-white">
              {isEditing ? "Edit Item Category" : "Add Item Category"}
            </h3>
            <Button
              onClick={close}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <div className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-6">
              <div>
                <Combobox
                  data={STAGE_OPTIONS}
                  displayField="label"
                  value={selectedStage[0] ?? null}
                  onChange={(val: any) =>
                    setSelectedStage(val ? (Array.isArray(val) ? val : [val]) : [])
                  }
                  placeholder="Select Stage"
                  label="Stage"
                  searchFields={["label"]}
                />
                {errors.stage && (
                  <p className="text-error mt-1 text-xs">{errors.stage}</p>
                )}
              </div>

              <div>
                <Combobox
                  data={categoryOptions}
                  displayField="label"
                  value={selectedCategory[0] ?? null}
                  onChange={(val: any) =>
                    setSelectedCategory(
                      val ? (Array.isArray(val) ? val : [val]) : [],
                    )
                  }
                  placeholder="Select Item Category"
                  label="Item Category"
                  searchFields={["label"]}
                />
                {errors.category && (
                  <p className="text-error mt-1 text-xs">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
              <Button type="button" onClick={close}>
                Cancel
              </Button>
              <Button type="button" color="primary" onClick={handleSubmit}>
                {isEditing ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}