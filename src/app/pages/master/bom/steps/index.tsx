// Import Dependencies
import React, { useState } from "react";
import clsx from "clsx";

// Local Imports
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";
import { KYCFormProvider } from "./KYCFormProvider.tsx";
import { Stepper } from "./Stepper.tsx";
import { UnderReview } from "./UnderReview";
import { AddressInfo } from "./steps/AddressInfo.tsx";
import { Declaration } from "./steps/Declaration.tsx";
import { Idenfication } from "./steps/Idenfication.tsx";
import { PersonalInfo } from "./steps/PersonalInfo.tsx";
import { Chassis } from "./steps/Chassis.tsx";
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
    label: "Tyre",
    description: "Body dimensions, axle, suspension, brakes and chassis details",
  },
  {
    key: "addressInfo",
    component: AddressInfo,
    label: "Excell",
    description: "Tool box, water tank, mud guard and other standard features",
  },
  {
    key: "identifyDocument",
    component: Idenfication,
    label: "Box",
    description: "Hydraulic jack, GPS, camera, ABS and other optional accessories",
  },
  {
    key: "declaration",
    component: Declaration,
    label: "Hydraulic",
    description: "Product image, brochure PDF, drawing PDF and spec sheet",
  },
  {
    key: "chassis",
    component: Chassis,
    label: "Chassis",
    description: "Chassis specifications and configuration details",
  },
];

const KYCForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const ActiveForm = steps[currentStep].component;

  const stepsNode = (
    <>
      {/* Stepper Node: Full 12-columns on mobile/tablet, 3-columns on desktop */}
      <div className="col-span-12 lg:col-span-3 w-full">
        <div className="sticky top-24 lg:mt-3 w-full">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>
      
      {/* Form Content Node: Full 12-columns on mobile/tablet, 9-columns on desktop */}
      <div className="col-span-12 lg:col-span-9 w-full">
        <Card className="w-full h-full p-4 sm:p-6 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl shadow-sm">
          <div className="mb-4">
            <h5 className="dark:text-dark-100 text-lg sm:text-xl font-bold text-gray-800">
              {steps[currentStep].label}
            </h5>
            <p className="dark:text-dark-200 text-xs sm:text-sm text-gray-500 mt-1">
              {steps[currentStep].description}
            </p>
          </div>
          
          <div className="w-full block">
            {!finished && (
              <ActiveForm
                setCurrentStep={setCurrentStep}
                setFinished={setFinished}
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <Page title="eKYC Form">
      <div className="transition-content w-full pb-8 mt-6 sm:mt-10 px-2 sm:px-4">
        <KYCFormProvider>
          <div
            className={clsx(
              "grid grid-cols-12 gap-4 sm:gap-6 w-full items-start",
              !finished && "grid-rows-[auto_1fr] lg:grid-rows-none",
            )}
          >
            {finished ? (
              <div className="col-span-12 place-self-center w-full">
                <UnderReview />
              </div>
            ) : (
              stepsNode
            )}
          </div>
        </KYCFormProvider>
      </div>
    </Page>
  );
};

export default KYCForm;