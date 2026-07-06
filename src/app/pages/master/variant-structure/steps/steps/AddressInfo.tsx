// Import Dependencies
import { useForm } from "react-hook-form";

// Local Imports
import { Button, Checkbox } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";

// ----------------------------------------------------------------------

const standardFeatures = [
  { name: "toolBox",           label: "Tool Box" },
  { name: "waterTank",         label: "Water Tank" },
  { name: "spareWheelCarrier", label: "Spare Wheel Carrier" },
  { name: "mudGuard",          label: "Mud Guard" },
  { name: "reflectorTape",     label: "Reflector Tape" },
  { name: "sideProtection",    label: "Side Protection" },
  { name: "rearBumper",        label: "Rear Bumper" },
  { name: "ladder",            label: "Ladder" },
  { name: "safetyChain",       label: "Safety Chain" },
] as const;

type FeatureKey = (typeof standardFeatures)[number]["name"];

type StandardFeaturesType = {
  [K in FeatureKey]?: boolean;
};

export function AddressInfo({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const kycFormCtx = useKYCFormContext();

  const { register, handleSubmit } = useForm<StandardFeaturesType>({
    defaultValues: kycFormCtx.state.formData.addressInfo as StandardFeaturesType,
  });

  const onSubmit = (data: StandardFeaturesType) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { addressInfo: data as never },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { addressInfo: { isDone: true } },
    });
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6">
        <p className="mb-4 text-sm font-medium text-gray-700 dark:text-dark-200">
          Standard Features
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {standardFeatures.map((feature) => (
            <div
              key={feature.name}
              className="flex items-center rounded-lg border border-gray-200 px-4 py-3 dark:border-dark-500"
            >
              <Checkbox
                {...register(feature.name)}
                label={feature.label}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(0)}>
          Back
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}