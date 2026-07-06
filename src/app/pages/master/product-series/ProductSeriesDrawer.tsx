import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { statusOptions } from "../shared/constants";
import { masterStorage } from "../shared/storage";
import { ProductSeries } from "./data";

interface ProductSeriesDrawerProps {
  isOpen: boolean;
  close: () => void;
  series: ProductSeries | null;
  onSave: (series: ProductSeries) => void;
}

export function ProductSeriesDrawer({
  isOpen,
  close,
  series,
  onSave,
}: ProductSeriesDrawerProps) {
  const isEdit = Boolean(series?.id);
  const categories = masterStorage.getCategories().map((item) => ({
    id: item.id,
    label: item.categoryName,
  }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductSeries>({
    values: series || undefined,
  });

  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = (data: ProductSeries) => {
    onSave({
      ...data,
      id: series?.id || crypto.randomUUID(),
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
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="dark:text-dark-50 text-lg font-semibold text-white">
              {isEdit ? "Edit Product Series" : "Create Product Series"}
            </h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full">
              <XMarkIcon className="size-4.5 text-white" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              <Controller
                control={control}
                name="categoryId"
                rules={{ required: "Category is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={categories}
                    value={categories.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label="Select Category"
                    placeholder="Select category"
                    displayField="label"
                    error={errors.categoryId?.message}
                    {...rest}
                  />
                )}
              />
              <Input
                {...register("seriesCode", { required: "Series code is required" })}
                label="Series Code"
                placeholder="Enter series code"
                error={errors.seriesCode?.message}
              />
              <Input
                {...register("seriesName", { required: "Series name is required" })}
                label="Series Name"
                placeholder="Enter series name"
                error={errors.seriesName?.message}
              />
              <Input
                {...register("capacity", { required: "Capacity is required" })}
                label="Capacity"
                placeholder="Enter capacity"
                error={errors.capacity?.message}
              />
              <Controller
                control={control}
                name="status"
                rules={{ required: "Status is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={statusOptions}
                    value={statusOptions.find((item) => item.id === value) || null}
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

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose}>Cancel</Button>
              <Button type="submit" color="primary">{isEdit ? "Update" : "Create"}</Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
