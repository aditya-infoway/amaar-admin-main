import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Link, useNavigate, useParams } from "react-router";

import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Card, Input, GhostSpinner } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import KYCForm from "../steps";

interface LookupOption {
  id: string;
  label: string;
}

// Category/Series/Model ke liye extra fields (code/capacity/standardWeight) bhi carry karte hain
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

interface ApiVariant {
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

export default function VariantStructureFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [availableVariants, setAvailableVariants] = useState<ApiVariant[]>([]);
  const [categories, setCategories] = useState<CategoryLookup[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesLookup[]>([]);
  const [modelList, setModelList] = useState<ModelLookup[]>([]);
  const [bodyTypes, setBodyTypes] = useState<LookupOption[]>([]);
  const [axleBrands, setAxleBrands] = useState<LookupOption[]>([]);
  const [hydraulicBrands, setHydraulicBrands] = useState<LookupOption[]>([]);
  const [tyreBrands, setTyreBrands] = useState<LookupOption[]>([]);

  const [variantId, setVariantId] = useState<string>("");
  const [summary, setSummary] = useState<Record<string, string>>({});

  // ---- Lookups + (create: available variants) / (edit: existing structure) load karo ----
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [
          categoryRes, seriesRes, modelRes, bodyTypeRes,
          axleBrandRes, hydraulicBrandRes, tyreBrandRes,
        ] = await Promise.all([
          Get("master/category/list", {}, false),
          Get("master/productseries/list", {}, false),
          Get("master/model/list", {}, false),
          Get("master/bodytype/list", {}, false),
          Get("master/axlebrand/list", {}, false),
          Get("master/hydraulicbrand/list", {}, false),
          Get("master/tyrebrand/list", {}, false),
        ]);

        let loadedCategories: CategoryLookup[] = [];
        let loadedSeries: SeriesLookup[] = [];
        let loadedModels: ModelLookup[] = [];

        if (categoryRes.data?.success) {
          loadedCategories = (categoryRes.data.data || []).map((i: any) => ({
            id: String(i.categoryId),
            label: i.categoryName,
            code: i.code || "",
          }));
          setCategories(loadedCategories);
        }
        if (seriesRes.data?.success) {
          loadedSeries = (seriesRes.data.data || []).map((i: any) => ({
            id: String(i.productSeriesId),
            label: i.seriesName,
            seriesCode: i.seriesCode || "",
          }));
          setSeriesList(loadedSeries);
        }
        if (modelRes.data?.success) {
          loadedModels = (modelRes.data.data || []).map((i: any) => ({
            id: String(i.modelId),
            label: i.modelName,
            modelCode: i.modelCode || "",
            standardWeight: i.standardWeight || "",
            capacity: i.capacity || "",
            bodyLength: i.length || "",
            bodyWidth: i.width || "",
            bodyHeight: i.height || "",
          }));
          setModelList(loadedModels);
        }
        if (bodyTypeRes.data?.success)
          setBodyTypes((bodyTypeRes.data.data || []).map((i: any) => ({ id: String(i.bodyTypeId), label: i.bodyTypeName })));
        if (axleBrandRes.data?.success)
          setAxleBrands((axleBrandRes.data.data || []).map((i: any) => ({ id: String(i.axleBrandId), label: i.axleBrandName })));
        if (hydraulicBrandRes.data?.success)
          setHydraulicBrands((hydraulicBrandRes.data.data || []).map((i: any) => ({ id: String(i.hydraulicBrandId), label: i.hydraulicBrandName })));
        if (tyreBrandRes.data?.success)
          setTyreBrands((tyreBrandRes.data.data || []).map((i: any) => ({ id: String(i.tyreBrandId), label: i.tyreBrandName })));

        if (isEdit) {
          const response = await Get(`master/variantstructure/${id}`, {}, false);
          if (response.data?.success) {
            const row = response.data.data;

            // categoryId/seriesId/modelId row me aaye to unse list se code/standardWeight nikal lo,
            // lekin PEHLE row ke apne direct fields ko priority do (jaise API list endpoint bhi karta hai) —
            // ID-match sirf fallback ke liye, kyunki modelId/seriesId missing ya stale ho sakta hai
            const matchedCategory = loadedCategories.find((c) => c.id === String(row.categoryId));
            const matchedSeries = loadedSeries.find((s) => s.id === String(row.seriesId));
            const matchedModel = loadedModels.find((m) => m.id === String(row.modelId));

            setVariantId(String(row.variantId));
            setSummary({
              variantCode: row.variantCode || "",
              categoryCode: row.categoryCode || matchedCategory?.code || row.code || "—",
              categoryName: row.categoryName || matchedCategory?.label || "—",
              seriesCode: row.seriesCode || matchedSeries?.seriesCode || "—",
              seriesName: row.seriesName || matchedSeries?.label || "—",
              modelCode: row.modelCode || matchedModel?.modelCode || "—",
              modelName: row.modelName || matchedModel?.label || "—",
              standardWeight: row.standardWeight || matchedModel?.standardWeight || "—",
              capacity: row.capacity || matchedModel?.capacity || "—",
              bodyLength: row.length || matchedModel?.bodyLength || "—",
              bodyWidth: row.width || matchedModel?.bodyWidth || "—",
              bodyHeight: row.height || matchedModel?.bodyHeight || "—",
              bodyType: row.bodyType || "",
              axleBrand: row.axleBrand || "",
              hydraulicBrand: row.hydraulicBrand || "",
              tyreBrand: row.tyreBrand || "",
              targetCost: String(row.targetCost ?? ""),
              sellingMarkup: String(row.sellingPrice ?? ""),
            });
          } else {
            toasterrormsg(response.data?.message || "Failed to load variant structure.");
          }
        } else {
          const variantRes = await Get("master/variantstructure/available-variants", {}, false);
          if (variantRes.data?.success) {
            setAvailableVariants(
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
          } else {
            toasterrormsg(variantRes.data?.message || "Failed to load variants.");
          }
        }
      } catch (error) {
        toasterrormsg("Something went wrong while loading variant structure data.");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const variantOptions = useMemo(
    () => availableVariants.map((v) => ({ id: v.variantId, label: `${v.variantCode} — ${v.variantName}` })),
    [availableVariants],
  );

  const getLabel = (list: LookupOption[], lookupId?: string) =>
    list.find((item) => item.id === lookupId)?.label || "—";

  const handleSelectVariant = (selectedId: string) => {
    const variant = availableVariants.find((v) => v.variantId === selectedId);
    if (!variant) return;

    const matchedCategory = categories.find((c) => c.id === variant.categoryId);
    const matchedSeries = seriesList.find((s) => s.id === variant.seriesId);
    const matchedModel = modelList.find((m) => m.id === variant.modelId);

    setVariantId(variant.variantId);
    setSummary({
      variantCode: variant.variantCode,
      categoryCode: matchedCategory?.code || "—",
      categoryName: matchedCategory?.label || "—",
      seriesCode: matchedSeries?.seriesCode || "—",
      seriesName: matchedSeries?.label || "—",
      modelCode: matchedModel?.modelCode || "—",
      modelName: matchedModel?.label || "—",
      capacity: matchedModel?.capacity || "—",
      standardWeight: matchedModel?.standardWeight || "—",
      bodyLength: matchedModel?.bodyLength || "—",
      bodyWidth: matchedModel?.bodyWidth || "—",
      bodyHeight: matchedModel?.bodyHeight || "—",
      bodyType: getLabel(bodyTypes, variant.bodyTypeId),
      axleBrand: getLabel(axleBrands, variant.axleBrandId),
      hydraulicBrand: getLabel(hydraulicBrands, variant.hydraulicBrandId),
      tyreBrand: getLabel(tyreBrands, variant.tyreBrandId),
      targetCost: String(variant.targetCost ?? ""),
      sellingMarkup: String(variant.sellingPrice ?? ""),
    });
  };

  if (loading) {
    return (
      <Page title={isEdit ? "Edit Variant Structure" : "Create Variant Structure"}>
        <div className="flex h-64 w-full items-center justify-center">
          <GhostSpinner className="size-8 border-4" />
        </div>
      </Page>
    );
  }

  return (
    <Page title={isEdit ? "Edit Variant Structure" : "Create Variant Structure"}>
      <div className="transition-content mx-auto w-full px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="dark:text-dark-50 text-xl font-bold tracking-wide text-primary border-b-4 border-primary lg:text-2xl">
            {isEdit ? "Edit Variant Structure" : "Create Variant Structure"}
          </h2>
          <Link to="/master/variant-structure">
            <Button color="primary" variant="outlined">
              <ChevronLeftIcon className="size-6" />
              <span>Back</span>
            </Button>
          </Link>
        </div>

        <Card className="space-y-6 p-4 sm:p-6">
          <div>
            <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
              Basic Info
            </h3>
          </div>

          <div className="max-w-md">
            <Listbox
              data={variantOptions}
              value={
                isEdit
                  ? { id: variantId, label: summary.variantCode || "" }
                  : variantOptions.find((item) => item.id === variantId) || null
              }
              onChange={(item) => !isEdit && handleSelectVariant(item.id)}
              label="Select Variant"
              placeholder={isEdit ? summary.variantCode || "" : "Select variant"}
              displayField="label"
              inputProps={{ disabled: isEdit }}
            />
            {isEdit && (
              <p className="dark:text-dark-300 mt-1.5 text-xs text-gray-500">
                Variant cannot be changed once a structure has been created.
              </p>
            )}
          </div>

          <hr className="border-gray-200 dark:border-dark-500" />

          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayFieldOrder.map((name) => (
              <div key={name} className="w-full">
                <Input
                  label={fieldLabels[name]}
                  value={summary[name] || ""}
                  placeholder={`Enter ${fieldLabels[name].toLowerCase()}`}
                  readOnly
                  disabled
                />
              </div>
            ))}
          </div>

          {/* Cancel/Create buttons yahan se hata diye — save ab wizard ke Documents step se hota hai */}
        </Card>

        {variantId && <KYCForm key={variantId} variantId={variantId} variantStructureId={id} />}
      </div>
    </Page>
  );
}