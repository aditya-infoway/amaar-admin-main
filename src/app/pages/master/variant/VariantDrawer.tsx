import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { Get } from "@/ApiHelper";
import { Variant } from "./data";

interface Option {
  id: string;
  label: string;
}

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
  const [categories, setCategories] = useState<Option[]>([]);
  const [allSeries, setAllSeries] = useState<{ id: string; categoryId: string; label: string }[]>([]);
  const [allModels, setAllModels] = useState<{ id: string; seriesId: string; label: string }[]>([]);
  const [bodyTypes, setBodyTypes] = useState<Option[]>([]);
  const [axleBrands, setAxleBrands] = useState<Option[]>([]);
  const [hydraulicBrands, setHydraulicBrands] = useState<Option[]>([]);
  const [tyreBrands, setTyreBrands] = useState<Option[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
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
  } = useForm<Variant>({
    values: variant || undefined,
  });

  const selectedCategory = watch("categoryId");
  const selectedSeries = watch("seriesId");

  // ---- Load all dropdown options from live APIs ----
  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [
          categoryRes,
          seriesRes,
          modelRes,
          bodyTypeRes,
          axleBrandRes,
          hydraulicBrandRes,
          tyreBrandRes,
        ] = await Promise.all([
          Get("master/category/list", {}, false),
          Get("master/productseries/list", {}, false),
          Get("master/model/list", {}, false),
          Get("master/bodytype/list", {}, false),
          Get("master/axlebrand/list", {}, false),
          Get("master/hydraulicbrand/list", {}, false),
          Get("master/tyrebrand/list", {}, false),
        ]);

        if (categoryRes.data?.success) {
          setCategories(
            (categoryRes.data.data || []).map((item: any) => ({
              id: String(item.categoryId),
              label: item.categoryName,
            }))
          );
        }

        if (seriesRes.data?.success) {
          setAllSeries(
            (seriesRes.data.data || []).map((item: any) => ({
              id: String(item.productSeriesId),
              categoryId: String(item.categoryId),
              label: item.seriesName,
            }))
          );
        }

        if (modelRes.data?.success) {
          setAllModels(
            (modelRes.data.data || []).map((item: any) => ({
              id: String(item.modelId),
              seriesId: String(item.seriesId),
              label: item.modelName,
            }))
          );
        }

        if (bodyTypeRes.data?.success) {
          setBodyTypes(
            (bodyTypeRes.data.data || []).map((item: any) => ({
              id: String(item.bodyTypeId),
              label: item.bodyTypeName,
            }))
          );
        }

        if (axleBrandRes.data?.success) {
          setAxleBrands(
            (axleBrandRes.data.data || []).map((item: any) => ({
              id: String(item.axleBrandId),
              label: item.axleBrandName,
            }))
          );
        }

        if (hydraulicBrandRes.data?.success) {
          setHydraulicBrands(
            (hydraulicBrandRes.data.data || []).map((item: any) => ({
              id: String(item.hydraulicBrandId),
              label: item.hydraulicBrandName,
            }))
          );
        }

        if (tyreBrandRes.data?.success) {
          setTyreBrands(
            (tyreBrandRes.data.data || []).map((item: any) => ({
              id: String(item.tyreBrandId),
              label: item.tyreBrandName,
            }))
          );
        }
      } catch (error) {
        // fail silently, drawer fields will just show empty dropdowns
      } finally {
        setLoadingOptions(false);
      }
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const seriesOptions = allSeries
    .filter((item) => item.categoryId === selectedCategory)
    .map((item) => ({ id: item.id, label: item.label }));

  const modelOptions = allModels
    .filter((item) => item.seriesId === selectedSeries)
    .map((item) => ({ id: item.id, label: item.label }));

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  // ---- Check variantCode uniqueness against currently loaded list via list API ----
  const checkCodeUnique = async (code: string) => {
    if (!code) return true;
    setCheckingCode(true);
    try {
      const response = await Get("master/variant/list", {}, false);
      if (response.data?.success) {
        const allItems: any[] = response.data.data || [];
        const isTaken = allItems.some(
          (item) =>
            item.variantCode?.trim().toLowerCase() ===
              code.trim().toLowerCase() &&
            String(item.variantId) !== String(variant?.id || "")
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

  const onSubmit = async (data: Variant) => {
    const isUnique = await checkCodeUnique(data.variantCode);

    if (!isUnique) {
      setError("variantCode", {
        type: "manual",
        message: "Variant code already exists. Please enter a different code.",
      });
      return;
    }

    onSave({ ...data, id: variant?.id || "" });
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
            <h3 className="text-lg font-semibold text-white">
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
                    inputProps={{ disabled: loadingOptions }}
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
                <Input
                  {...register("variantCode", {
                    required: "Variant code is required",
                    onChange: () => clearErrors("variantCode"),
                  })}
                  label="Variant Code"
                  placeholder="Enter variant code"
                  error={errors.variantCode?.message}
                  disabled={checkingCode}
                />
                <Input
                  {...register("variantName", { required: "Variant name is required" })}
                  label="Variant Name"
                  placeholder="Enter variant name"
                  error={errors.variantName?.message}
                />
              </div>
              <Controller
                control={control}
                name="bodyTypeId"
                rules={{ required: "Body type is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={bodyTypes}
                    value={bodyTypes.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label="Select Body Type"
                    placeholder="Select body type"
                    displayField="label"
                    error={errors.bodyTypeId?.message}
                    inputProps={{ disabled: loadingOptions }}
                    {...rest}
                  />
                )}
              />
              <Controller
                control={control}
                name="axleBrandId"
                rules={{ required: "Axle brand is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={axleBrands}
                    value={axleBrands.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label="Select Axle Brand"
                    placeholder="Select axle brand"
                    displayField="label"
                    error={errors.axleBrandId?.message}
                    inputProps={{ disabled: loadingOptions }}
                    {...rest}
                  />
                )}
              />
              <Controller
                control={control}
                name="hydraulicBrandId"
                rules={{ required: "Hydraulic brand is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={hydraulicBrands}
                    value={hydraulicBrands.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label="Hydraulic Brand"
                    placeholder="Select hydraulic brand"
                    displayField="label"
                    error={errors.hydraulicBrandId?.message}
                    inputProps={{ disabled: loadingOptions }}
                    {...rest}
                  />
                )}
              />
              <Controller
                control={control}
                name="tyreBrandId"
                rules={{ required: "Tyre brand is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={tyreBrands}
                    value={tyreBrands.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label="Tyre Brand"
                    placeholder="Select tyre brand"
                    displayField="label"
                    error={errors.tyreBrandId?.message}
                    inputProps={{ disabled: loadingOptions }}
                    {...rest}
                  />
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register("targetCost", { required: "Target cost is required" })}
                  label="Target Cost"
                  type="number"
                  placeholder="Enter target cost"
                  error={errors.targetCost?.message}
                />
                <Input
                  {...register("sellingPrice", { required: "Selling price is required" })}
                  label="Selling Price"
                  type="number"
                  placeholder="Enter selling price"
                  error={errors.sellingPrice?.message}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose}>Cancel</Button>
              <Button type="submit" color="primary" disabled={checkingCode || loadingOptions}>
                {checkingCode ? "Checking..." : variant?.id ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}