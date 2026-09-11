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
import { Location } from "./data";

interface LocationDrawerProps {
  isOpen: boolean;
  close: () => void;
  location: Location | null;
  onSave: (location: Location) => void;
}

export function LocationDrawer({
  isOpen,
  close,
  location,
  onSave,
}: LocationDrawerProps) {
  const isEdit = Boolean(location?.id);
  const [checking, setChecking] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Location>({
    values: location || undefined,
  });

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  // Check uniqueness for locationCode + locationName
  const checkUnique = async (code: string, name: string) => {
    if (!code && !name) return true;
    setChecking(true);
    try {
      const response = await Get("master/location/list", {}, false);
      if (response.data?.success) {
        const allItems: any[] = response.data.data || [];

        const codeTaken = allItems.some(
          (item) =>
            item.locationCode?.trim().toLowerCase() ===
              code.trim().toLowerCase() &&
            String(item.locationId) !== String(location?.id || "")
        );

        const nameTaken = allItems.some(
          (item) =>
            item.locationName?.trim().toLowerCase() ===
              name.trim().toLowerCase() &&
            String(item.locationId) !== String(location?.id || "")
        );

        return { codeTaken, nameTaken };
      }
      return { codeTaken: false, nameTaken: false };
    } catch (error) {
      return { codeTaken: false, nameTaken: false };
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: Location) => {
    const { codeTaken, nameTaken } = await checkUnique(
      data.locationCode,
      data.locationName
    );

    if (codeTaken) {
      setError("locationCode", {
        type: "manual",
        message: "Location code already exists.",
      });
      return;
    }

    if (nameTaken) {
      setError("locationName", {
        type: "manual",
        message: "Location name already exists.",
      });
      return;
    }

    onSave({ ...data, id: location?.id || "" });
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
              {isEdit ? "Edit Location" : "Create Location"}
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
              {/* Location Code */}
              <Input
                {...register("locationCode", {
                  required: "Location Code is required",
                  onChange: () => clearErrors("locationCode"),
                })}
                label="Location Code"
                placeholder="Enter location code"
                error={errors.locationCode?.message}
                disabled={checking}
              />

              {/* Location Name */}
              <Input
                {...register("locationName", {
                  required: "Location Name is required",
                  onChange: () => clearErrors("locationName"),
                })}
                label="Location Name"
                placeholder="Enter location name"
                error={errors.locationName?.message}
                disabled={checking}
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
              <Button type="submit" color="primary" disabled={checking}>
                {checking ? "Checking..." : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}