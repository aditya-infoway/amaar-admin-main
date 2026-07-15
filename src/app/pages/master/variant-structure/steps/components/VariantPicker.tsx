// Import Dependencies
import { useEffect, useMemo, useState } from "react";

// Local Imports
import { Card, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, toasterrormsg } from "@/ApiHelper";
import { useKYCFormContext, VariantSummary } from "../KYCFormContext";

interface LookupOption {
  id: string;
  label: string;
}

// Category/Series/Model ke liye extra fields (code/seriesCode/modelCode/dimensions) bhi carry karte hain
interface CategoryLookup extends LookupOption {
  code: string;
}
interface SeriesLookup extends LookupOption {
  seriesCode: string;
}
interface ModelLookup extends LookupOption {
  modelCode: string;
  standardWeight: string;
  capacity: string;
  bodyLength: string;
  bodyWidth: string;
  bodyHeight: string;
}

interface AvailableVariant {
  variantId: string;
  categoryId: string;
  seriesId: string;
  modelId: string;
  variantCode: string;
  variantName: string;
  bodyTypeId: string;
  axleBrandId: string;
  hydraulicBrandId: string;
  tyreBrandId: string;
  targetCost: string | number;
  sellingPrice: string | number;
}

const displayFieldOrder = [
  "variantCode", "categoryCode", "categoryName", "seriesCode", "seriesName",
  "modelCode", "modelName", "capacity", "bodyLength", "bodyWidth",
  "bodyHeight", "standardWeight", "bodyType", "axleBrand", "hydraulicBrand",
  "tyreBrand", "targetCost", "sellingMarkup",
] as const;

const fieldLabels: Record<(typeof displayFieldOrder)[number], string> = {
  variantCode: "Variant Code",
  categoryCode: "Category Code",
  categoryName: "Category Name",
  seriesCode: "Series Code",
  seriesName: "Series Name",
  modelCode: "Model Code",
  modelName: "Model Name",
  capacity: "Capacity",
  bodyLength: "Body Length",
  bodyWidth: "Body Width",
  bodyHeight: "Body Height",
  standardWeight: "Standard Weight",
  bodyType: "Body Type",
  axleBrand: "Axle Brand",
  hydraulicBrand: "Hydraulic Brand",
  tyreBrand: "Tyre Brand",
  targetCost: "Target Cost",
  sellingMarkup: "Selling Markup",
};

export function VariantPicker({ disabled = false }: { disabled?: boolean }) {
  const kycFormCtx = useKYCFormContext();
  const { variantId, variantSummary } = kycFormCtx.state;

  const [variants, setVariants] = useState<AvailableVariant[]>([]);
  const [categories, setCategories] = useState<CategoryLookup[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesLookup[]>([]);
  const [modelList, setModelList] = useState<ModelLookup[]>([]);
  const [bodyTypes, setBodyTypes] = useState<LookupOption[]>([]);
  const [axleBrands, setAxleBrands] = useState<LookupOption[]>([]);
  const [hydraulicBrands, setHydraulicBrands] = useState<LookupOption[]>([]);
  const [tyreBrands, setTyreBrands] = useState<LookupOption[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- Sirf create mode me hi "available" (unused) variants chahiye ----
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [
          variantRes, categoryRes, seriesRes, modelRes,
          bodyTypeRes, axleBrandRes, hydraulicBrandRes, tyreBrandRes,
        ] = await Promise.all([
          disabled
            ? Promise.resolve({ data: { success: true, data: [] } })
            : Get("master/variantstructure/available-variants", {}, false),
          Get("master/category/list", {}, false),
          Get("master/productseries/list", {}, false),
          Get("master/model/list", {}, false),
          Get("master/bodytype/list", {}, false),
          Get("master/axlebrand/list", {}, false),
          Get("master/hydraulicbrand/list", {}, false),
          Get("master/tyrebrand/list", {}, false),
        ]);

        if (!disabled && variantRes.data?.success) {
          setVariants(
            (variantRes.data.data || []).map((item: any) => ({
              variantId: String(item.variantId),
              categoryId: String(item.categoryId),
              seriesId: String(item.seriesId),
              modelId: String(item.modelId),
              variantCode: item.variantCode,
              variantName: item.variantName,
              bodyTypeId: String(item.bodyTypeId),
              axleBrandId: String(item.axleBrandId),
              hydraulicBrandId: String(item.hydraulicBrandId),
              tyreBrandId: String(item.tyreBrandId),
              targetCost: item.targetCost,
              sellingPrice: item.sellingPrice,
            })),
          );
        }

        if (categoryRes.data?.success)
          setCategories(
            (categoryRes.data.data || []).map((i: any) => ({
              id: String(i.categoryId),
              label: i.categoryName,
              code: i.code || "",
            })),
          );
        if (seriesRes.data?.success)
          setSeriesList(
            (seriesRes.data.data || []).map((i: any) => ({
              id: String(i.productSeriesId),
              label: i.seriesName,
              seriesCode: i.seriesCode || "",
            })),
          );
        if (modelRes.data?.success)
          setModelList(
            (modelRes.data.data || []).map((i: any) => ({
              id: String(i.modelId),
              label: i.modelName,
              modelCode: i.modelCode || "",
              standardWeight: i.standardWeight || "",
              capacity: i.capacity || "",
              bodyLength: i.length || "",
              bodyWidth: i.width || "",
              bodyHeight: i.height || "",
            })),
          );
        if (bodyTypeRes.data?.success)
          setBodyTypes((bodyTypeRes.data.data || []).map((i: any) => ({ id: String(i.bodyTypeId), label: i.bodyTypeName })));
        if (axleBrandRes.data?.success)
          setAxleBrands((axleBrandRes.data.data || []).map((i: any) => ({ id: String(i.axleBrandId), label: i.axleBrandName })));
        if (hydraulicBrandRes.data?.success)
          setHydraulicBrands((hydraulicBrandRes.data.data || []).map((i: any) => ({ id: String(i.hydraulicBrandId), label: i.hydraulicBrandName })));
        if (tyreBrandRes.data?.success)
          setTyreBrands((tyreBrandRes.data.data || []).map((i: any) => ({ id: String(i.tyreBrandId), label: i.tyreBrandName })));
      } catch (error) {
        toasterrormsg("Something went wrong while loading variant options.");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const variantOptions = useMemo(
    () => variants.map((v) => ({ id: v.variantId, label: `${v.variantCode} - ${v.variantName}` })),
    [variants],
  );

  const getLabel = (list: LookupOption[], id?: string) =>
    list.find((item) => item.id === id)?.label || "—";

  const handleSelectVariant = (id: string) => {
    const selected = variants.find((v) => v.variantId === id);
    if (!selected) return;

    const matchedCategory = categories.find((c) => c.id === selected.categoryId);
    const matchedSeries = seriesList.find((s) => s.id === selected.seriesId);
    const matchedModel = modelList.find((m) => m.id === selected.modelId);

    const summary: VariantSummary = {
      variantCode: selected.variantCode,
      categoryCode: matchedCategory?.code || "—",
      categoryName: matchedCategory?.label || "—",
      seriesCode: matchedSeries?.seriesCode || "—",
      seriesName: matchedSeries?.label || "—",
      modelCode: matchedModel?.modelCode || "—",
      modelName: matchedModel?.label || "—",
      capacity: matchedModel?.capacity || "—",
      bodyLength: matchedModel?.bodyLength || "—",
      bodyWidth: matchedModel?.bodyWidth || "—",
      bodyHeight: matchedModel?.bodyHeight || "—",
      standardWeight: matchedModel?.standardWeight || "—",
      bodyType: getLabel(bodyTypes, selected.bodyTypeId),
      axleBrand: getLabel(axleBrands, selected.axleBrandId),
      hydraulicBrand: getLabel(hydraulicBrands, selected.hydraulicBrandId),
      tyreBrand: getLabel(tyreBrands, selected.tyreBrandId),
      targetCost: String(selected.targetCost ?? ""),
      sellingMarkup: String(selected.sellingPrice ?? ""),
    };

    kycFormCtx.dispatch({
      type: "SET_VARIANT",
      payload: { variantId: selected.variantId, variantSummary: summary },
    });
  };

  const summaryFields: { label: string; value: string }[] = displayFieldOrder
    .filter((key) => key !== "variantCode")
    .map((key) => ({
      label: fieldLabels[key],
      value: (variantSummary as Record<string, string> | undefined)?.[key] || "",
    }));

  return (
    <Card className="p-4 sm:p-5">
      <h5 className="dark:text-dark-100 text-lg font-medium text-gray-800">
        Select Variant
      </h5>
      <p className="dark:text-dark-200 mb-4 text-sm text-gray-500">
        {disabled
          ? "Variant cannot be changed after the structure has been created."
          : "Pick the variant this structure belongs to. Details below fill in automatically."}
      </p>

      <div className="max-w-md">
        <Listbox
          data={variantOptions}
          value={variantOptions.find((item) => item.id === variantId) || null}
          onChange={(item) => handleSelectVariant(item.id)}
          label="Variant"
          placeholder={disabled ? variantSummary?.variantCode || "" : "Select variant"}
          displayField="label"
          inputProps={{ disabled: disabled || loading }}
        />
      </div>

      {variantId && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Variant Code" value={variantSummary?.variantCode || ""} readOnly disabled />
          {summaryFields.map((field) => (
            <Input key={field.label} label={field.label} value={field.value} readOnly disabled />
          ))}
        </div>
      )}
    </Card>
  );
}