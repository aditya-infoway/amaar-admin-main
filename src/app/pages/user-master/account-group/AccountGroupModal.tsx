import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment } from "react";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { AccountGroup } from "./data";

interface GroupOption {
  id: string;
  label: string;
}

interface AccountGroupDrawerProps {
  isOpen: boolean;
  close: () => void;
  accountGroup: AccountGroup | null;
  groupOptions: GroupOption[];
  onSave: (item: AccountGroup) => void;
}

export function AccountGroupDrawer({
  isOpen,
  close,
  accountGroup,
  groupOptions,
  onSave,
}: AccountGroupDrawerProps) {
  const isEditing = Boolean(accountGroup?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<AccountGroup>({
    values: accountGroup ?? undefined,
  });

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  const onSubmit = (data: AccountGroup) => {
    onSave({ ...data, id: accountGroup?.id || "" });
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
          <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-white">
              {isEditing ? "Edit Account Group" : "Add Account Group"}
            </h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full"
            >
              <XMarkIcon className="size-4.5 text-white" />
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              <Input
                {...register("groupName", {
                  required: "Group name is required",
                  validate: (v) => v.trim() !== "" || "Group name is required",
                })}
                label="Group Name *"
                placeholder="Enter group name"
                error={errors.groupName?.message}
              />

              <Controller
                control={control}
                name="groupId"
                rules={{ required: "Group is required" }}
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={groupOptions}
                    value={
                      groupOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item: any) => onChange(item?.id || "")}
                    label="Group *"
                    placeholder="Select group"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.groupId?.message}
                  />
                )}
              />
            </div>

            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
