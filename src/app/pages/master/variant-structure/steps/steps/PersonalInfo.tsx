// Import Dependencies
import { Controller, useForm } from "react-hook-form";

// Local Imports
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { TechnicalSpecType, useKYCFormContext } from "../KYCFormContext";

// ----------------------------------------------------------------------

const suspensionTypes = [
  { label: "Air Suspension", value: "air" },
  { label: "Leaf Spring", value: "leaf_spring" },
  { label: "Coil Spring", value: "coil_spring" },
  { label: "Hydraulic", value: "hydraulic" },
];

const brakeSystemOptions = [
  { label: "Air Brakes", value: "air" },
  { label: "Hydraulic Brakes", value: "hydraulic" },
  { label: "Drum Brakes", value: "drum" },
  { label: "Disc Brakes", value: "disc" },
];

const chassisTypes = [
  { label: "Ladder Frame", value: "ladder_frame" },
  { label: "Monocoque", value: "monocoque" },
  { label: "Space Frame", value: "space_frame" },
  { label: "Backbone", value: "backbone" },
];

const paintTypes = [
  { label: "Powder Coating", value: "powder_coating" },
  { label: "Liquid Paint", value: "liquid_paint" },
  { label: "Epoxy Coating", value: "epoxy" },
  { label: "Galvanized", value: "galvanized" },
];

// Reusable table row: label left, input right
function TableRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 border-b border-gray-100 py-2.5 last:border-0 dark:border-dark-500 sm:grid-cols-2 sm:gap-4">
      <p className="text-sm font-medium text-gray-700 dark:text-dark-200">
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}

export function PersonalInfo({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const kycFormCtx = useKYCFormContext();

  const { register, handleSubmit, control } = useForm<TechnicalSpecType>({
    defaultValues: kycFormCtx.state.formData.personalInfo,
  });

  const onSubmit = (data: TechnicalSpecType) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { personalInfo: { ...data } },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { personalInfo: { isDone: true } },
    });
    setCurrentStep(1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-4 h-[420px] overflow-y-auto rounded-lg border border-gray-200 px-4 dark:border-dark-500">

        <TableRow label="Body Length">
          <Input {...register("bodyLength")} placeholder="e.g. 7200 mm" />
        </TableRow>

        <TableRow label="Body Width">
          <Input {...register("bodyWidth")} placeholder="e.g. 2400 mm" />
        </TableRow>

        <TableRow label="Body Height">
          <Input {...register("bodyHeight")} placeholder="e.g. 1800 mm" />
        </TableRow>

        <TableRow label="Capacity">
          <Input {...register("capacity")} placeholder="e.g. 10 Ton" />
        </TableRow>

        <TableRow label="Axle Count">
          <Input {...register("axleCount")} placeholder="e.g. 2" />
        </TableRow>

        <TableRow label="Suspension Type">
          <Controller
            control={control}
            name="suspensionType"
            render={({ field }) => (
              <Listbox
                data={suspensionTypes}
                value={suspensionTypes.find((s) => s.value === field.value) || null}
                onChange={(val) => field.onChange(val.value)}
                name={field.name}
                placeholder="Select Suspension Type"
                displayField="label"
              />
            )}
          />
        </TableRow>

        <TableRow label="Tyre Size">
          <Input {...register("tyreSize")} placeholder="e.g. 295/80 R22.5" />
        </TableRow>

        <TableRow label="King Pin">
          <Input {...register("kingPin")} placeholder="e.g. 2 inch / 3.5 inch" />
        </TableRow>

        <TableRow label="Brake System">
          <Controller
            control={control}
            name="brakeSystem"
            render={({ field }) => (
              <Listbox
                data={brakeSystemOptions}
                value={brakeSystemOptions.find((b) => b.value === field.value) || null}
                onChange={(val) => field.onChange(val.value)}
                name={field.name}
                placeholder="Select Brake System"
                displayField="label"
              />
            )}
          />
        </TableRow>

        <TableRow label="Hydraulic Details">
          <Input
            {...register("hydraulicDetails")}
            placeholder="e.g. Double Acting Cylinder, 3 Stage"
          />
        </TableRow>

        <TableRow label="Paint Type">
          <Controller
            control={control}
            name="paintType"
            render={({ field }) => (
              <Listbox
                data={paintTypes}
                value={paintTypes.find((p) => p.value === field.value) || null}
                onChange={(val) => field.onChange(val.value)}
                name={field.name}
                placeholder="Select Paint Type"
                displayField="label"
              />
            )}
          />
        </TableRow>

        <TableRow label="Chassis Type">
          <Controller
            control={control}
            name="chassisType"
            render={({ field }) => (
              <Listbox
                data={chassisTypes}
                value={chassisTypes.find((c) => c.value === field.value) || null}
                onChange={(val) => field.onChange(val.value)}
                name={field.name}
                placeholder="Select Chassis Type"
                displayField="label"
              />
            )}
          />
        </TableRow>

        <TableRow label="Floor Plate Thk.">
          <Input {...register("floorPlateThk")} placeholder="e.g. 3 mm" />
        </TableRow>

        <TableRow label="Side Plate Thk.">
          <Input {...register("sidePlateThk")} placeholder="e.g. 2 mm" />
        </TableRow>

        <TableRow label="Etc.">
          <Input
            {...register("etc")}
            placeholder="Any additional technical details"
          />
        </TableRow>

      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button className="min-w-[7rem]">Cancel</Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}