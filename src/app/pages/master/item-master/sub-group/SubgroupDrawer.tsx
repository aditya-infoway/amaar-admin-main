import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Button, Input } from "@/components/ui";
import { Get } from "@/ApiHelper";
import { statusOptions } from "../shared/constants";
import { SubGroup } from "./data";

interface OptionItem {
  id: string;
  label: string;
}

// Group ke saath uski category bhi chahiye, filtering ke liye
interface GroupOptionItem extends OptionItem {
  itemCategoryId: string;
  groupId: string;
  parentSubGroupId: string;
}

interface SubGroupDrawerProps {
  isOpen: boolean;
  close: () => void;
  subGroup: SubGroup | null;
  onSave: (subGroup: SubGroup) => void;
}

export function SubGroupDrawer({
  isOpen,
  close,
  subGroup,
  onSave,
}: SubGroupDrawerProps) {
  const isEdit = Boolean(subGroup?.id);
  const [checkingName, setCheckingName] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<OptionItem[]>([]);
  const [allGroupOptions, setAllGroupOptions] = useState<GroupOptionItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SubGroup>({
    values: subGroup
      ? {
          ...subGroup,
          groupId: subGroup.parentSubGroupId
            ? `S-${subGroup.parentSubGroupId}`
            : subGroup.groupId
              ? `G-${subGroup.groupId}`
              : "",
        }
      : undefined,
  });

  const selectedCategoryId = watch("itemCategoryId");

  // ---- Category + Group list: drawer khulte hi fresh laao ----
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        setLoadingCategories(true);
        const res = await Get("master/itemcategory/list", {}, false);
        const list = res?.data?.data || [];
        setCategoryOptions(
          list.map((c: any) => ({
            id: String(c.itemCategoryId),
            label: c.categoryName,
          })),
        );
      } catch (error) {
        // dropdown khali rahega
      } finally {
        setLoadingCategories(false);
      }
    })();

    (async () => {
      try {
        setLoadingGroups(true);
        const res = await Get("master/subgroup/parents", {}, false);
        const list = res?.data?.data || [];
        setAllGroupOptions(
          list.map((g: any) => ({
            id: String(g.id), // "G-1" (main group) ya "S-3" (sub group)
            label: g.label,
            itemCategoryId:
              g.itemCategoryId != null ? String(g.itemCategoryId) : "",
            groupId: String(g.groupId),
            parentSubGroupId: g.parentSubGroupId
              ? String(g.parentSubGroupId)
              : "",
          })),
        );
      } catch (error) {
        // dropdown khali rahega
      } finally {
        setLoadingGroups(false);
      }
    })();
  }, [isOpen]);
  // ---- Selected category ke groups hi dikhao ----
  const filteredGroupOptions = useMemo(() => {
    if (!selectedCategoryId) return [];
    return allGroupOptions.filter(
      (g) => g.itemCategoryId === selectedCategoryId,
    );
  }, [allGroupOptions, selectedCategoryId]);

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  // ---- Same group me sub group ka naam unique ho ----
  // ---- Name company me unique ho ----
  const checkNameUnique = async (name: string) => {
    if (!name) return true;
    setCheckingName(true);
    try {
      const response = await Get("master/subgroup/list", {}, false);
      if (response.data?.success) {
        const allItems: any[] = response.data.data || [];
        const isTaken = allItems.some(
          (item) =>
            item.subGroupName?.trim().toLowerCase() ===
              name.trim().toLowerCase() &&
            String(item.subGroupId) !== String(subGroup?.id || ""),
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

  const onSubmit = async (data: SubGroup) => {
    const isUnique = await checkNameUnique(data.subGroupName);

    if (!isUnique) {
      setError("subGroupName", {
        type: "manual",
        message: "Name already exists. Please enter a different name.",
      });
      return;
    }

    // "G-1" / "S-3" ko decode karke asli groupId + parentSubGroupId bhejo
    const selected = allGroupOptions.find((g) => g.id === data.groupId);

    onSave({
      ...data,
      groupId: selected?.groupId || "",
      parentSubGroupId: selected?.parentSubGroupId || "",
      id: subGroup?.id || "",
    });
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
          <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="dark:text-dark-50 text-lg font-semibold text-white">
              {isEdit ? "Edit Sub Group" : "Create Sub Group"}
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
              {/* Item Category */}
              <Controller
                control={control}
                name="itemCategoryId"
                rules={{ required: "Item category is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={categoryOptions}
                    value={
                      categoryOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item: any) => {
                      onChange(item.id);
                      // Category badalte hi purana Group clear karo
                      setValue("groupId", "", { shouldValidate: false });
                      clearErrors("groupId");
                    }}
                    label="Item Category"
                    placeholder={
                      loadingCategories ? "Loading..." : "Select item category"
                    }
                    displayField="label"
                    error={errors.itemCategoryId?.message}
                    searchFields={["label"]}
                  />
                )}
              />

              {/* Group (main group) - sirf selected category ke groups */}
              <Controller
                control={control}
                name="groupId"
                rules={{ required: "Group is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={filteredGroupOptions}
                    value={
                      filteredGroupOptions.find((item) => item.id === value) ||
                      null
                    }
                    onChange={(item: any) => onChange(item.id)}
                    label="Group"
                    placeholder={
                      !selectedCategoryId
                        ? "Select item category first"
                        : loadingGroups
                          ? "Loading..."
                          : filteredGroupOptions.length === 0
                            ? "No groups in this category"
                            : "Select group"
                    }
                    displayField="label"
                    error={errors.groupId?.message}
                    searchFields={["label"]}
                    disabled={!selectedCategoryId || loadingGroups}
                  />
                )}
              />

              {/* Sub Group Name */}
              <Input
                {...register("subGroupName", {
                  required: "Sub Group Name is required",
                  onChange: () => clearErrors("subGroupName"),
                })}
                label="Sub Group Name"
                placeholder="Enter sub group name"
                error={errors.subGroupName?.message}
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
            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
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