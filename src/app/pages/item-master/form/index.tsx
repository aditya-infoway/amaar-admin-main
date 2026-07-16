import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Card, Input, Radio, Switch } from "@/components/ui";
import { taxSlabOptions, uomOptions } from "../../master/shared/constants";
import { Get, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Combobox } from "@/components/shared/form/StyledCombobox";

interface ItemMasterFormValues {
  itemCode: string;
  itemName: string;
  shortName: string;
  hsnCode: string;
  itemLocation: string;
  itemCategoryId: string;
  groupId: string;
  unit: string;
  taxSlab: string;
  stockMapping: boolean;
  minQty: string;
  maxQty: string;
  purchasePrice: string;
  actualPurchasePrice: string;
  salesPrice: string;
  mrp: string;
  barcodeType: "manual" | "generate";
  barcode: string;
  status: string;
}

const emptyFormValues: ItemMasterFormValues = {
  itemCode: "",
  itemName: "",
  shortName: "",
  hsnCode: "",
  itemLocation: "",
  itemCategoryId: "",
  groupId: "",
  unit: "",
  taxSlab: "",
  stockMapping: false,
  minQty: "",
  maxQty: "",
  purchasePrice: "",
  actualPurchasePrice: "",
  salesPrice: "",
  mrp: "",
  barcodeType: "manual",
  barcode: "",
  status: "active",
};

interface OptionItem {
  id: string;
  label: string;
}

export default function ItemMasterFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categoryOptions, setCategoryOptions] = useState<OptionItem[]>([]);
  const [groupOptionsList, setGroupOptionsList] = useState<OptionItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<ItemMasterFormValues>({
    defaultValues: emptyFormValues,
  });

  const stockMapping = watch("stockMapping");
  const barcodeType = watch("barcodeType");

  // ---- Item Category — dynamic from Item Category master ----
  useEffect(() => {
    (async () => {
      try {
        setLoadingCategories(true);
        const res = await Get("master/itemcategory/list", {}, false);
        const list = res?.data?.data || [];
        setCategoryOptions(
          list.map((c: any) => ({ id: String(c.itemCategoryId), label: c.categoryName }))
        );
      } catch (err) {
        toasterrormsg("Failed to load item categories");
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  // ---- Group — dynamic from Item Group master ----
  useEffect(() => {
    (async () => {
      try {
        setLoadingGroups(true);
        const res = await Get("master/itemgroup/list", {}, false);
        const list = res?.data?.data || [];
        setGroupOptionsList(
          list.map((g: any) => ({ id: String(g.itemGroupId), label: g.groupName }))
        );
      } catch (err) {
        toasterrormsg("Failed to load groups");
      } finally {
        setLoadingGroups(false);
      }
    })();
  }, []);

  // ---- Edit mode: existing item load karo ----
  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          const res = await Get(`master/itemmaster/${id}`, {}, false);
          const item = res?.data?.data || res?.data;
          if (!item) return;

          reset({
            itemCode: item.itemCode || "",
            itemName: item.itemName || "",
            shortName: item.shortName || "",
            hsnCode: item.hsnCode || "",
            itemLocation: item.itemLocation || "",
            itemCategoryId: item.itemCategoryId ? String(item.itemCategoryId) : "",
            groupId: item.groupId ? String(item.groupId) : "",
            unit: item.unit || "",
            taxSlab: item.taxSlab || "",
            stockMapping: Boolean(item.stockMapping),
            minQty: item.minQty != null ? String(item.minQty) : "",
            maxQty: item.maxQty != null ? String(item.maxQty) : "",
            purchasePrice: item.purchasePrice != null ? String(item.purchasePrice) : "",
            actualPurchasePrice:
              item.actualPurchasePrice != null ? String(item.actualPurchasePrice) : "",
            salesPrice: item.salesPrice != null ? String(item.salesPrice) : "",
            mrp: item.mrp != null ? String(item.mrp) : "",
            barcodeType: item.barcodeType || "manual",
            barcode: item.barcode || "",
            status: item.status || "active",
          });
        } catch (err) {
          toasterrormsg("Failed to load item details");
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, reset]);

  // ---- Barcode type switch — generate karte hi API call ----
  const handleBarcodeTypeChange = async (type: "manual" | "generate") => {
    setValue("barcodeType", type, { shouldValidate: true });

    if (type === "generate") {
      setGeneratingBarcode(true);
      try {
        const res = await Get("master/itemmaster/generate-barcode", {}, false);
        const nextBarcode = res?.data?.data?.barcode || "";
        setValue("barcode", nextBarcode, { shouldValidate: true });
      } catch (err) {
        toasterrormsg("Failed to generate barcode");
      } finally {
        setGeneratingBarcode(false);
      }
    } else {
      setValue("barcode", "", { shouldValidate: true });
      clearErrors("barcode");
    }
  };

  const extractErrorMessage = (res: any, fallback: string): string => {
    const data = res?.data ?? res;
    if (data?.message && typeof data.message === "string") return data.message;
    if (data?.error && typeof data.error === "string") return data.error;
    return fallback;
  };

  const onSubmit = async (data: ItemMasterFormValues) => {
    try {
      setSubmitting(true);

      const payload = {
        ...data,
        itemCategoryId: Number(data.itemCategoryId),
        groupId: Number(data.groupId),
        minQty: data.stockMapping ? data.minQty : null,
        maxQty: data.stockMapping ? data.maxQty : null,
      };

      if (isEdit && id) {
        const res = await Put("master/itemmaster/update", { itemId: Number(id), ...payload }, false);
        if (res?.data?.status === 400 || res?.data?.success === false) {
          toasterrormsg(extractErrorMessage(res, "Something went wrong."));
          return;
        }
        toastsuccessmsg(extractErrorMessage(res, "Item updated successfully"));
      } else {
        const res = await Post("master/itemmaster/create", payload, false);
        if (res?.data?.status === 400 || res?.data?.success === false) {
          toasterrormsg(extractErrorMessage(res, "Something went wrong."));
          return;
        }
        toastsuccessmsg(extractErrorMessage(res, "Item created successfully"));
      }

      navigate("/item-master");
    } catch (err: any) {
      toasterrormsg(extractErrorMessage(err?.response, "Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
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
                  {...register("itemCode", {
                    required: "Item code is required",
                    minLength: { value: 2, message: "Item code must be at least 2 characters" },
                    maxLength: { value: 30, message: "Item code must not exceed 30 characters" },
                  })}
                  label="Item Code"
                  placeholder="Enter item code"
                  error={errors.itemCode?.message}
                />
                <Input
                  {...register("itemName", {
                    required: "Item name is required",
                    maxLength: { value: 150, message: "Item name must not exceed 150 characters" },
                  })}
                  label="Item Name"
                  placeholder="Enter item name"
                  error={errors.itemName?.message}
                />
                <Input
                  {...register("shortName", {
                    required: "Short name is required",
                    maxLength: { value: 50, message: "Short name must not exceed 50 characters" },
                  })}
                  label="Short Name"
                  placeholder="Enter short name"
                  error={errors.shortName?.message}
                />
                <Input
                  {...register("hsnCode", {
                    required: "HSN Code is required",
                    pattern: {
                      value: /^\d{4,8}$/,
                      message: "HSN Code must be 4 to 8 digits",
                    },
                  })}
                  label="HSN Code"
                  placeholder="Enter HSN Code"
                  error={errors.hsnCode?.message}
                />
                <Input
                  {...register("itemLocation")}
                  label="Item Location"
                  placeholder="Enter item location"
                  error={errors.itemLocation?.message}
                />

                {/* Item Category — dynamic */}
                <Controller
                  control={control}
                  name="itemCategoryId"
                  rules={{ required: "Item category is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Combobox
                      data={categoryOptions}
                      value={categoryOptions.find((item) => item.id === value) || null}
                      onChange={(item: any) => onChange(item.id)}
                      label="Item Category"
                      placeholder={loadingCategories ? "Loading..." : "Select item category"}
                      displayField="label"
                      error={errors.itemCategoryId?.message}
                      searchFields={["label"]}
                    />
                  )}
                />

                {/* Group — dynamic */}
                <Controller
                  control={control}
                  name="groupId"
                  rules={{ required: "Group is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (

                    <Combobox
                      data={groupOptionsList}
                      value={groupOptionsList.find((item) => item.id === value) || null}
                      onChange={(item: any) => onChange(item.id)}
                      label="Group"
                      placeholder={loadingGroups ? "Loading..." : "Select group"}
                      displayField="label"
                      error={errors.groupId?.message}
                      searchFields={["label"]}
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
                      {...register("minQty", {
                        required: stockMapping ? "Min qty is required" : false,
                        min: { value: 0, message: "Min qty cannot be negative" },
                      })}
                      label="Min Qty"
                      type="number"
                      placeholder="Min quantity"
                      error={errors.minQty?.message}
                    />
                    <Input
                      {...register("maxQty", {
                        required: stockMapping ? "Max qty is required" : false,
                        min: { value: 0, message: "Max qty cannot be negative" },
                      })}
                      label="Max Qty"
                      type="number"
                      placeholder="Max quantity"
                      error={errors.maxQty?.message}
                    />
                  </>
                )}
              </div>
            </section>

            <section>
              <h3 className="dark:text-dark-100 mb-4 text-lg font-medium text-gray-800">
                Pricing
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input
                  {...register("purchasePrice", {
                    required: "Purchase price is required",
                    min: { value: 0, message: "Purchase price cannot be negative" },
                  })}
                  label="Purchase Price"
                  type="number"
                  placeholder="Enter purchase price"
                  error={errors.purchasePrice?.message}
                />
                <Input
                  {...register("actualPurchasePrice", {
                    required: "Actual purchase price is required",
                    min: { value: 0, message: "Actual purchase price cannot be negative" },
                  })}
                  label="Actual Purchase Price"
                  type="number"
                  placeholder="Enter actual purchase price"
                  error={errors.actualPurchasePrice?.message}
                />
                <Input
                  {...register("salesPrice", {
                    required: "Sales price is required",
                    min: { value: 0, message: "Sales price cannot be negative" },
                  })}
                  label="Sales Price"
                  type="number"
                  placeholder="Enter sales price"
                  error={errors.salesPrice?.message}
                />
                <Input
                  {...register("mrp", {
                    required: "MRP is required",
                    min: { value: 0, message: "MRP cannot be negative" },
                  })}
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
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Radio
                      checked={barcodeType === "manual"}
                      onChange={() => handleBarcodeTypeChange("manual")}
                      className="size-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-400"
                    />
                    Manually
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Radio
                      checked={barcodeType === "generate"}
                      onChange={() => handleBarcodeTypeChange("generate")}
                      className="size-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-400"
                    />
                    Generate Automatically
                  </label>
                </div>

                {barcodeType === "manual" ? (
                  <div className="max-w-md">
                    <Input
                      {...register("barcode", {
                        // required hataya — ab optional hai
                        minLength: { value: 4, message: "Barcode must be at least 4 characters" },
                        maxLength: { value: 30, message: "Barcode must not exceed 30 characters" },
                        pattern: {
                          value: /^[A-Za-z0-9-]+$/,
                          message: "Barcode can only contain letters, numbers, and hyphens",
                        },
                      })}
                      label="Barcode Number"
                      placeholder="Enter barcode manually (optional)"
                      error={errors.barcode?.message}
                    />
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 bg-gray-50/50 p-4 dark:border-dark-400 dark:bg-dark-700/50 max-w-md">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      System Generated Unique Barcode
                    </span>
                    <p className="mt-1 font-mono text-lg font-bold text-gray-900 dark:text-dark-50">
                      {generatingBarcode ? "Generating..." : watch("barcode") || "—"}
                    </p>
                    <input
                      type="hidden"
                      {...register("barcode")}   // 👈 required hataya yahan se bhi
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-dark-500">
              <Button type="button" onClick={() => navigate("/item-master")}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={submitting}>
                {submitting ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </Page>
  );
}