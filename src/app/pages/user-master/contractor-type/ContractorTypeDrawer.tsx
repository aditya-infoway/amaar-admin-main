import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";
import { Controller, useForm } from "react-hook-form";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { CONTRACTOR_TYPE_OPTIONS, ContractorEmployee } from "./data";

interface Props {
  isOpen: boolean;
  close: () => void;
  employee: ContractorEmployee | null;
  onSave: (employee: ContractorEmployee) => void;
}

export function ContractorTypeDrawer({
  isOpen,
  close,
  employee,
  onSave,
}: Props) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContractorEmployee>({ values: employee ?? undefined });

  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = (data: ContractorEmployee) => {
    onSave(data);
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
          <div className="bg-primary-600 dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-white">
              Edit Contractor Type
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
                label="Role"
                value={employee?.roleName ?? ""}
                disabled
                readOnly
              />
              <Input
                label="Employee Name"
                value={employee?.employeeName ?? ""}
                disabled
                readOnly
              />

              <Controller
                control={control}
                name="contractorTypes"
                rules={{ required: "Type is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={CONTRACTOR_TYPE_OPTIONS}
                    value={
                      CONTRACTOR_TYPE_OPTIONS.find((item) =>
                        value?.includes(item.id),
                      ) || null
                    }
                    onChange={(item) => onChange([item.id])}
                    label="Type"
                    placeholder="Select type"
                    displayField="label"
                    error={errors.contractorTypes?.message}
                    {...rest}
                  />
                )}
              />
            </div>

            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Update
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
