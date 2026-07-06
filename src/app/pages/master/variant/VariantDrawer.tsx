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
import {
  bodyTypeOptions,
  brandOptions,
  hydraulicBrandOptions,
  tyreBrandOptions,
} from "../shared/constants";
import { masterStorage } from "../shared/storage";
import { Variant } from "./data";

interface VariantDrawerProps {
  isOpen: boolean;
  close: () => void;
  variant: Variant | null;
  onSave: (variant: Variant) => void;
}

export function VariantDrawer({
  isOpen,
  close,
  variant,
  onSave,
}: VariantDrawerProps) {
  const categories = masterStorage.getCategories().map((item) => ({
    id: item.id,
    label: item.categoryName,
  }));
  const allSeries = masterStorage.getProductSeries();
  const allModels = masterStorage.getModels();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Variant>({
    values: variant || undefined,
  });

  const selectedCategory = watch("categoryId");
  const selectedSeries = watch("seriesId");

  const seriesOptions = allSeries
    .filter((item) => item.categoryId === selectedCategory)
    .map((item) => ({ id: item.id, label: item.seriesName }));

  const modelOptions = allModels
    .filter((item) => item.seriesId === selectedSeries)
    .map((item) => ({ id: item.id, label: item.modelName }));

  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = (data: Variant) => {
    onSave({ ...data, id: variant?.id || crypto.randomUUID() });
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-lg transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="dark:text-dark-50 text-lg font-semibold text-white">
              {variant?.id ? "Edit Variant" : "Create Variant"}
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
                    onChange={(item) => {
                      onChange(item.id);
                      setValue("seriesId", "");
                      setValue("modelId", "");
                    }}
                    label="Select Category"
                    placeholder="Select category"
                    displayField="label"
                    error={errors.categoryId?.message}
                    {...rest}
                  />
                )}
              />
              <Controller
                control={control}
                name="seriesId"
                rules={{ required: "Series is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={seriesOptions}
                    value={seriesOptions.find((item) => item.id === value) || null}
                    onChange={(item) => {
                      onChange(item.id);
                      setValue("modelId", "");
                    }}
                    label="Select Series"
                    placeholder="Select series"
                    displayField="label"
                    error={errors.seriesId?.message}
                    inputProps={{ disabled: !selectedCategory }}
                    {...rest}
                  />
                )}
              />
              <Controller
                control={control}
                name="modelId"
                rules={{ required: "Model is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={modelOptions}
                    value={modelOptions.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label="Select Model"
                    placeholder="Select model"
                    displayField="label"
                    error={errors.modelId?.message}
                    inputProps={{ disabled: !selectedSeries }}
                    {...rest}
                  />
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input {...register("variantCode", { required: "Variant code is required" })} label="Variant Code" placeholder="Enter variant code" error={errors.variantCode?.message} />
                <Input {...register("variantName", { required: "Variant name is required" })} label="Variant Name" placeholder="Enter variant name" error={errors.variantName?.message} />
              </div>
              <Controller
                control={control}
                name="bodyType"
                rules={{ required: "Body type is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox data={bodyTypeOptions} value={bodyTypeOptions.find((item) => item.id === value) || null} onChange={(item) => onChange(item.id)} label="Select Body Type" placeholder="Select body type" displayField="label" error={errors.bodyType?.message} {...rest} />
                )}
              />
              <Controller
                control={control}
                name="axleBrand"
                rules={{ required: "Axle brand is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox data={brandOptions} value={brandOptions.find((item) => item.id === value) || null} onChange={(item) => onChange(item.id)} label="Select Axle Brand" placeholder="Select axle brand" displayField="label" error={errors.axleBrand?.message} {...rest} />
                )}
              />
              <Controller
                control={control}
                name="hydraulicBrand"
                rules={{ required: "Hydraulic brand is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox data={hydraulicBrandOptions} value={hydraulicBrandOptions.find((item) => item.id === value) || null} onChange={(item) => onChange(item.id)} label="Hydraulic Brand" placeholder="Select hydraulic brand" displayField="label" error={errors.hydraulicBrand?.message} {...rest} />
                )}
              />
              <Controller
                control={control}
                name="tyreBrand"
                rules={{ required: "Tyre brand is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox data={tyreBrandOptions} value={tyreBrandOptions.find((item) => item.id === value) || null} onChange={(item) => onChange(item.id)} label="Tyre Brand" placeholder="Select tyre brand" displayField="label" error={errors.tyreBrand?.message} {...rest} />
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input {...register("targetCost", { required: "Target cost is required" })} label="Target Cost" type="number" placeholder="Enter target cost" error={errors.targetCost?.message} />
                <Input {...register("sellingPrice", { required: "Selling price is required" })} label="Selling Price" type="number" placeholder="Enter selling price" error={errors.sellingPrice?.message} />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose}>Cancel</Button>
              <Button type="submit" color="primary">{variant?.id ? "Update" : "Create"}</Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
