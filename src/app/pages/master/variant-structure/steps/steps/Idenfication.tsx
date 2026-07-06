// Import Dependencies
import { useForm } from "react-hook-form";

// Local Imports
import { Button, Checkbox } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";

// ----------------------------------------------------------------------

const optionalAccessories = [
  { name: "hydraulicJack",    label: "Hydraulic Jack" },
  { name: "gps",              label: "GPS" },
  { name: "camera",           label: "Camera" },
  { name: "abs",              label: "ABS" },
  { name: "airSuspension",    label: "Air Suspension" },
  { name: "extraTyre",        label: "Extra Tyre" },
  { name: "fireExtinguisher", label: "Fire Extinguisher" },
  { name: "etc",              label: "Etc." },
] as const;

type AccessoryKey = (typeof optionalAccessories)[number]["name"];

type OptionalAccessoriesType = {
  [K in AccessoryKey]?: boolean;
};

interface IdenficationProps {
  setCurrentStep: (step: number) => void;
}

export function Idenfication({ setCurrentStep }: IdenficationProps) {
  const kycFormCtx = useKYCFormContext();

  const { register, handleSubmit } = useForm<OptionalAccessoriesType>({
    defaultValues: kycFormCtx.state.formData.identifyDocument as OptionalAccessoriesType,
  });

  const onSubmit = (data: OptionalAccessoriesType) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { identifyDocument: data as never },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { identifyDocument: { isDone: true } },
    });
    setCurrentStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6">
        <p className="mb-4 text-sm font-medium text-gray-700 dark:text-dark-200">
          Optional Accessories
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {optionalAccessories.map((accessory) => (
            <div
              key={accessory.name}
              className="flex items-center rounded-lg border border-gray-200 px-4 py-3 dark:border-dark-500"
            >
              <Checkbox
                {...register(accessory.name)}
                label={accessory.label}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(1)}>
          Back
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}