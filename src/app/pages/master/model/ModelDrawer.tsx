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
import { Get, toasterrormsg } from "@/ApiHelper";
import { statusOptions } from "../shared/constants";
import { Model } from "./data";

interface OptionItem {
  id: string;
  label: string;
}

interface SeriesOptionItem extends OptionItem {
  categoryId: string;
}

interface ModelDrawerProps {
  isOpen: boolean;
  close: () => void;
  model: Model | null;
  categories: OptionItem[];
  series: SeriesOptionItem[];
  onSave: (model: Model) => void;
}

export function ModelDrawer({
  isOpen,
  close,
  model,
  categories,
  series,
  onSave,
}: ModelDrawerProps) {
  const [checkingCode, setCheckingCode] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Model>({
    values: model || undefined,
  });

  const selectedCategory = watch("categoryId");
  const seriesOptions = series
    .filter((item) => item.categoryId === selectedCategory)
    .map((item) => ({ id: item.id, label: item.label }));

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  // ---- Check modelCode uniqueness against currently loaded list via list API ----
  // (Lightweight client-side pre-check; server also enforces this on submit.)
  const checkModelCodeUnique = async (code: string) => {
    if (!code) return true;
    setCheckingCode(true);
    try {
      const response = await Get("master/model/list", {}, false);
      if (response.data?.success) {
        const allModels: any[] = response.data.data || [];
        const isTaken = allModels.some(
          (m) =>
            m.modelCode?.trim().toLowerCase() === code.trim().toLowerCase() &&
            String(m.modelId) !== String(model?.id || "")
        );
        return !isTaken;
      }
      return true;
    } catch (error) {
      return true; // fail-open on client check; server will still validate
    } finally {
      setCheckingCode(false);
    }
  };

  const onSubmit = async (data: Model) => {
    const isUnique = await checkModelCodeUnique(data.modelCode);

    if (!isUnique) {
      setError("modelCode", {
        type: "manual",
        message: "Model code already exists. Please enter a different code.",
      });
      return;
    }

    onSave({ ...data, id: model?.id || "" });
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
              {model?.id ? "Edit Model" : "Create Model"}
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
                    onChange={(item) => onChange(item.id)}
                    label="Select Series"
                    placeholder="Select series"
                    displayField="label"
                    error={errors.seriesId?.message}
                    inputProps={{ disabled: !selectedCategory }}
                    {...rest}
                  />
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register("modelCode", {
                    required: "Model code is required",
                    onChange: () => clearErrors("modelCode"),
                  })}
                  label="Model Code"
                  placeholder="Enter model code"
                  error={errors.modelCode?.message}
                  disabled={checkingCode}
                />
                <Input
                  {...register("modelName", { required: "Model name is required" })}
                  label="Model Name"
                  placeholder="Enter model name"
                  error={errors.modelName?.message}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register("capacity", { required: "Capacity is required" })}
                  label="Capacity"
                  placeholder="Enter capacity"
                  error={errors.capacity?.message}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  {...register("length", { required: "Length is required" })}
                  label="Length"
                  placeholder="Length"
                  error={errors.length?.message}
                />
                <Input
                  {...register("width", { required: "Width is required" })}
                  label="Width"
                  placeholder="Width"
                  error={errors.width?.message}
                />
                <Input
                  {...register("height", { required: "Height is required" })}
                  label="Height"
                  placeholder="Height"
                  error={errors.height?.message}
                />
              </div>
              <Input
                {...register("standardWeight", { required: "Standard weight is required" })}
                label="Standard Weight"
                placeholder="Enter standard weight"
                error={errors.standardWeight?.message}
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
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={checkingCode}>
                {checkingCode ? "Checking..." : model?.id ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}