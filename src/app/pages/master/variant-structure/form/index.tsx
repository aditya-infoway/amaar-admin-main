import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Card, Input } from "@/components/ui";
import { masterStorage } from "../../shared/storage";
import { buildVariantStructureFromVariant } from "../../shared/variantStructureUtils";
import { emptyVariantStructure, VariantStructure } from "../data";
import KYCForm from "../steps";

const formFields: {
  name: keyof Omit<VariantStructure, "id" | "variantId">;
  label: string;
}[] = [
    { name: "variantCode", label: "Variant Code" },
    { name: "categoryCode", label: "Category Code" },
    { name: "categoryName", label: "Category Name" },
    { name: "seriesCode", label: "Series Code" },
    { name: "seriesName", label: "Series Name" },
    { name: "modelCode", label: "Model Code" },
    { name: "modelName", label: "Model Name" },
    { name: "capacity", label: "Capacity" },
    { name: "axleType", label: "Axle Type" },
    { name: "bodyLength", label: "Body Length" },
    { name: "bodyWidth", label: "Body Width" },
    { name: "bodyHeight", label: "Body Height" },
    { name: "standardWeight", label: "Standard Weight" },
    { name: "bodyType", label: "Body Type" },
    { name: "axleBrand", label: "Axle Brand" },
    { name: "hydraulicBrand", label: "Hydraulic Brand" },
    { name: "tyreBrand", label: "Tyre Brand" },
    { name: "targetCost", label: "Target Cost" },
    { name: "sellingMarkup", label: "Selling Markup" },
  ];

export default function VariantStructureFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const categories = masterStorage.getCategories();
  const seriesList = masterStorage.getProductSeries();
  const models = masterStorage.getModels();
  const variants = masterStorage.getVariants();

  const existing = isEdit
    ? masterStorage.getVariantStructures().find((item) => item.id === id)
    : undefined;

  const variantOptions = variants.map((item) => ({
    id: item.id,
    label: `${item.variantCode} — ${item.variantName}`,
  }));

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<VariantStructure>({
    defaultValues: existing || emptyVariantStructure(),
  });

  const fillFromVariant = (variantId: string) => {
    const variant = variants.find((item) => item.id === variantId);
    if (!variant) return;

    const structure = buildVariantStructureFromVariant(
      variant,
      categories,
      seriesList,
      models,
      existing?.id || "",
    );

    setValue("variantId", structure.variantId);
    formFields.forEach(({ name }) => {
      setValue(name, structure[name]);
    });
  };

  const onSubmit = (data: VariantStructure) => {
    const items = masterStorage.getVariantStructures();
    const record: VariantStructure = {
      ...data,
      id: existing?.id || crypto.randomUUID(),
    };
    const next = existing
      ? items.map((row) => (row.id === record.id ? record : row))
      : [record, ...items];
    masterStorage.saveVariantStructures(next);
    navigate("/master/variant-structure");
  };

  return (
    <Page title={isEdit ? "Edit Variant Structure" : "Create Variant Structure"}>
      {/* Maximum width constraint bumped up to max-w-7xl to accommodate 4 columns comfortably */}
      <div className="transition-content mx-auto w-full  px-(--margin-x) pb-8">
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="space-y-6 p-4 sm:p-6">
            <div>
              <h3 className="dark:text-dark-100 text-lg font-medium text-gray-800">
                Basic Info
              </h3>
            </div>

            {/* Kept outside the grid to maintain its full-width structure */}
            <div className="max-w-md">
              <Controller
                control={control}
                name="variantId"
                rules={{ required: "Please select a variant" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={variantOptions}
                    value={variantOptions.find((item) => item.id === value) || null}
                    onChange={(item) => {
                      onChange(item?.id || "");
                      if (item) fillFromVariant(item.id);
                    }}
                    label="Select Variant"
                    placeholder="Select variant"
                    displayField="label"
                    error={errors.variantId?.message}
                    {...rest}
                  />
                )}
              />
            </div>

            <hr className="border-gray-200 dark:border-dark-500" />

            {/* Responsive Grid System: 1 column on mobile, 2 on small tablets, 3 on tablets/small laptops, 4 on desktop screens */}
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {formFields.map(({ name, label }) => (
                <div key={name} className="w-full">
                  <Input
                    {...register(name, { required: `${label} is required` })}
                    label={label}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    error={errors[name]?.message}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-dark-500">
              <Button type="button" onClick={() => navigate("/master/variant-structure")}>
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </Card>
        </form>

        <KYCForm />
      </div>
    </Page>
  );
}