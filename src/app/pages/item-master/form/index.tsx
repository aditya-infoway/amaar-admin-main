import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import { Page } from "@/components/shared/Page";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Card, Input, Radio, Switch } from "@/components/ui";
import {
  groupOptions,
  itemCategoryOptions,
  itemTypeOptions,
  supplierOptions,
  taxSlabOptions,
  uomOptions,
} from "../../master/shared/constants";
import { masterStorage } from "../../master/shared/storage";
import { emptyItem, ItemMaster } from "../data";

// Extends ItemMaster type with local UI properties safely
interface ExtendedItemMaster extends ItemMaster {
  itemLocation?: string;
  barcodeType?: "manual" | "generate";
}

export default function ItemMasterFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const existing = isEdit
    ? masterStorage.getItems().find((item) => item.id === id)
    : undefined;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExtendedItemMaster>({
    defaultValues: {
      ...(existing || emptyItem()),
      barcodeType: "manual", // Default type
    },
  });

  const stockMapping = watch("stockMapping");
  const barcodeType = watch("barcodeType");
  const currentBarcode = watch("barcode");

  // Automatically generate unique barcode when switching to 'generate' if it doesn't exist
  useEffect(() => {
    if (barcodeType === "generate" && !currentBarcode) {
      const code = `AB${Date.now().toString().slice(-10)}`;
      setValue("barcode", code);
    }
  }, [barcodeType, currentBarcode, setValue]);

  const onSubmit = (data: ExtendedItemMaster) => {
    const items = masterStorage.getItems();

    // Ensure generate mode has a barcode before saving
    let finalBarcode = data.barcode;
    if (data.barcodeType === "generate" && !finalBarcode) {
      finalBarcode = `AB${Date.now().toString().slice(-10)}`;
    }

    // Clean UI-only keys before saving
    const { barcodeType: _, ...savedData } = data;

    const item: ItemMaster = {
      ...savedData,
      barcode: finalBarcode,
      id: existing?.id || crypto.randomUUID(),
    } as ItemMaster;

    const next = existing
      ? items.map((row) => (row.id === item.id ? item : row))
      : [item, ...items];
    masterStorage.saveItems(next);
    navigate("/item-master");
  };

  return (
    <Page title={isEdit ? "Edit Item" : "Create Item"}>
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="dark:text-dark-50 text-xl font-bold tracking-wide text-primary border-b-4 border-primary lg:text-2xl">
            {isEdit ? "Edit Item Master" : "Create Item Master"}
          </h2>
          <Link to="/item-master">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />
              <span>Back</span>
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="space-y-6 p-4 sm:p-6">
            <section>
              <h3 className="dark:text-dark-100 mb-4 text-lg font-medium text-gray-800">
                Basic Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  {...register("itemCode", { required: "Item code is required" })}
                  label="Item Code"
                  placeholder="Enter item code"
                  error={errors.itemCode?.message}
                />
                <Input
                  {...register("itemName", { required: "Item name is required" })}
                  label="Item Name"
                  placeholder="Enter item name"
                  error={errors.itemName?.message}
                />
                <Input
                  {...register("shortName", { required: "Short name is required" })}
                  label="Short Name"
                  placeholder="Enter short name"
                  error={errors.shortName?.message}
                />
                <Input
                  {...register("itemLocation")}
                  label="Item Location"
                  placeholder="Enter item location"
                  error={errors.itemLocation?.message}
                />
                <Controller
                  control={control}
                  name="itemCategory"
                  rules={{ required: "Item category is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={itemCategoryOptions}
                      value={itemCategoryOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="Item Category"
                      placeholder="Select item category"
                      displayField="label"
                      error={errors.itemCategory?.message}
                      {...rest}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="group"
                  rules={{ required: "Group is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={groupOptions}
                      value={groupOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="Group"
                      placeholder="Select group"
                      displayField="label"
                      error={errors.group?.message}
                      {...rest}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="unit"
                  rules={{ required: "Unit is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={uomOptions}
                      value={uomOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="Unit / UOM"
                      placeholder="Select unit"
                      displayField="label"
                      error={errors.unit?.message}
                      {...rest}
                    />
                  )}
                />
              </div>
            </section>

            <section>
              <h3 className="dark:text-dark-100 mb-4 text-lg font-medium text-gray-800">
                Tax & Stock
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Controller
                  control={control}
                  name="taxSlab"
                  rules={{ required: "Tax slab is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={taxSlabOptions}
                      value={taxSlabOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="Tax Slab"
                      placeholder="Select tax slab"
                      displayField="label"
                      error={errors.taxSlab?.message}
                      {...rest}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="stockMapping"
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-end pb-2">
                      <Switch
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        label="Stock Mapping"
                      />
                    </div>
                  )}
                />
                {stockMapping && (
                  <>
                    <Input
                      {...register("minQty", { required: "Min qty is required" })}
                      label="Min Qty"
                      type="number"
                      placeholder="Min quantity"
                      error={errors.minQty?.message}
                    />
                    <Input
                      {...register("maxQty", { required: "Max qty is required" })}
                      label="Max Qty"
                      type="number"
                      placeholder="Max quantity"
                      error={errors.maxQty?.message}
                    />
                  </>
                )}
              </div>
            </section>

            {/* <section>
              <h3 className="dark:text-dark-100 mb-4 text-lg font-medium text-gray-800">
                Classification & Supplier
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">

                <Controller
                  control={control}
                  name="suppliers"
                  rules={{ required: "Select at least one supplier" }}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      multiple
                      data={supplierOptions}
                      value={supplierOptions.filter((item) =>
                        (value || []).includes(item.id),
                      )}
                      onChange={(items: { id: string; label: string }[]) =>
                        onChange(items.map((item) => item.id))
                      }
                      label="Select Supplier"
                      placeholder="Select suppliers"
                      displayField="label"
                      error={errors.suppliers?.message}
                    />
                  )}
                />
              </div>
            </section> */}

            <section>
              <h3 className="dark:text-dark-100 mb-4 text-lg font-medium text-gray-800">
                Pricing
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  {...register("purchasePrice", { required: "Purchase price is required" })}
                  label="Purchase Price"
                  type="number"
                  placeholder="Enter purchase price"
                  error={errors.purchasePrice?.message}
                />
                <Input
                  {...register("actualPurchasePrice", {
                    required: "Actual purchase price is required",
                  })}
                  label="Actual Purchase Price"
                  type="number"
                  placeholder="Enter actual purchase price"
                  error={errors.actualPurchasePrice?.message}
                />
                <Input
                  {...register("salesPrice", { required: "Sales price is required" })}
                  label="Sales Price"
                  type="number"
                  placeholder="Enter sales price"
                  error={errors.salesPrice?.message}
                />
                <Input
                  {...register("mrp", { required: "MRP is required" })}
                  label="MRP"
                  type="number"
                  placeholder="Enter MRP"
                  error={errors.mrp?.message}
                />
              </div>
            </section>

            <section>
              <h3 className="dark:text-dark-100 mb-4 text-lg font-medium text-gray-800">
                Barcode Setup
              </h3>
              <div className="space-y-4">
                {/* Radio Buttons */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Radio
                      value="manual"
                      {...register("barcodeType")}
                      className="size-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-400"
                    />
                    Manually
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Radio

                      value="generate"
                      {...register("barcodeType")}
                      className="size-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-400"
                      onChange={(e) => {
                        register("barcodeType").onChange(e);
                        setValue("barcode", "");
                      }}
                    />
                    Generate Automatically
                  </label>
                </div>

                {/* Conditional Rendering */}
                {barcodeType === "manual" ? (
                  <div className="max-w-md">
                    <Input
                      {...register("barcode")}
                      label="Barcode Number"
                      placeholder="Enter barcode manually"
                    />
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 bg-gray-50/50 p-4 dark:border-dark-400 dark:bg-dark-700/50 max-w-md">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      System Generated Unique Barcode
                    </span>
                    <p className="mt-1 font-mono text-lg font-bold text-gray-900 dark:text-dark-50">
                      {currentBarcode || "Generating..."}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-dark-500">
              <Button type="button" onClick={() => navigate("/item-master")}>
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {isEdit ? "Update Item" : "Create Item"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </Page>
  );
}