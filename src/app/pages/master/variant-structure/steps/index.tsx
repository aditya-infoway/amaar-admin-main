// Import Dependencies
import React, { useEffect, useState } from "react";
import clsx from "clsx";

// Local Imports
import { Card, GhostSpinner } from "@/components/ui";
import { Get, toasterrormsg } from "@/ApiHelper";
import { KYCFormProvider } from "./KYCFormProvider.tsx";
import { Stepper } from "./Stepper.tsx";
import { UnderReview } from "./UnderReview";
import { AddressInfo } from "./steps/AddressInfo.tsx";
import { Declaration } from "./steps/Declaration.tsx";
import { Idenfication } from "./steps/Idenfication.tsx";
import { PersonalInfo } from "./steps/PersonalInfo.tsx";
import { FormState } from "./KYCFormContext.ts";
// ----------------------------------------------------------------------

export interface Step {
  key: keyof FormState["formData"];
  component: React.ComponentType<any>;
  label: string;
  description: string;
}

const steps: Step[] = [
  {
    key: "personalInfo",
    component: PersonalInfo,
    label: "Technical Spec",
    description: "Body dimensions, axle, suspension, brakes and chassis details",
  },
  {
    key: "addressInfo",
    component: AddressInfo,
    label: "Standard Features",
    description: "Tool box, water tank, mud guard and other standard features",
  },
  {
    key: "identifyDocument",
    component: Idenfication,
    label: "Optional Accessories",
    description: "Hydraulic jack, GPS, camera, ABS and other optional accessories",
  },
  {
    key: "declaration",
    component: Declaration,
    label: "Documents",
    description: "Product image, brochure PDF, drawing PDF and spec sheet",
  },
];

interface KYCFormProps {
  variantId: string;
  variantStructureId?: string;
}

const KYCForm = ({ variantId, variantStructureId }: KYCFormProps) => {
  const isEditMode = Boolean(variantStructureId);

  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [preset, setPreset] = useState<Partial<FormState> | undefined>(undefined);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) {
      setPreset({ variantId });
      return;
    }

    const loadExisting = async () => {
      setLoading(true);
      try {
        const response = await Get(`master/variantstructure/${variantStructureId}`, {}, false);
        if (response.data?.success) {
          const row = response.data.data;
          setPreset({
            variantStructureId,
            variantId,
            formData: {
              personalInfo: {
                bodyLength: row.bodyLength || "",
                bodyWidth: row.bodyWidth || "",
                bodyHeight: row.bodyHeight || "",
                capacity: row.capacity || "",
                axleCount: row.axleCount || "",
                suspensionType: row.suspensionType || "",
                tyreSize: row.tyreSize || "",
                kingPin: row.kingPin || "",
                brakeSystem: row.brakeSystem || "",
                hydraulicDetails: row.hydraulicDetails || "",
                paintType: row.paintType || "",
                floorPlateThk: row.floorPlateThk || "",
                sidePlateThk: row.sidePlateThk || "",
                chassisType: row.chassisType || "",
                etc: row.etc || "",
              },
              addressInfo: row.standardFeatures || {},
              identifyDocument: row.optionalAccessories || {},
              declaration: { productImage: null, brochurePdf: null, drawingPdf: null, specSheet: null },
            },
            stepStatus: {
              personalInfo: { isDone: true },
              addressInfo: { isDone: true },
              identifyDocument: { isDone: true },
              declaration: { isDone: false },
            },
          });
        } else {
          toasterrormsg(response.data?.message || "Failed to load variant structure.");
        }
      } catch (error) {
        toasterrormsg("Something went wrong while loading the variant structure.");
      } finally {
        setLoading(false);
      }
    };

    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId, variantStructureId, isEditMode]);

  const ActiveForm = steps[currentStep].component;

  if (loading || !preset) {
    return (
      <div className="mt-6 flex h-40 w-full items-center justify-center">
        <GhostSpinner className="size-8 border-4" />
      </div>
    );
  }

  const stepsNode = (
    <>
      <div className="col-span-12 sm:col-span-4 lg:col-span-3">
        <div className="sticky top-24 sm:mt-3">
          <Stepper steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />
        </div>
      </div>
      <div className="col-span-12 sm:col-span-8 lg:col-span-9">
        <Card className="h-full p-4 sm:p-5">
          <h5 className="dark:text-dark-100 text-lg font-medium text-gray-800">
            {steps[currentStep].label}
          </h5>
          <p className="dark:text-dark-200 text-sm text-gray-500">
            {steps[currentStep].description}
          </p>
          {!finished && <ActiveForm setCurrentStep={setCurrentStep} setFinished={setFinished} />}
        </Card>
      </div>
    </>
  );

  return (
    <div className="mt-6">
      <KYCFormProvider preset={preset}>
        <div
          className={clsx(
            "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
            !finished && "grid-rows-[auto_1fr] sm:grid-rows-none",
          )}
        >
          {finished ? (
            <div className="col-span-12 place-self-center">
              <UnderReview />
            </div>
          ) : (
            stepsNode
          )}
        </div>
      </KYCFormProvider>
    </div>
  );
};

export default KYCForm;