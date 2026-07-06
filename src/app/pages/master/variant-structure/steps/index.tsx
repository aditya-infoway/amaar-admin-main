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

const KYCForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const ActiveForm = steps[currentStep].component;

  const stepsNode = (
    <>
      <div className="col-span-12  sm:col-span-4 lg:col-span-3">
        <div className="sticky top-24 sm:mt-3">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
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
          {!finished && (
            <ActiveForm
              setCurrentStep={setCurrentStep}
              setFinished={setFinished}
            />
          )}
        </Card>
      </div>
    </>
  );

  return (
    <Page title="eKYC Form">
      <div className="transition-content grid w-full grid-rows-[auto_1fr]  pb-8 mt-10">


        <KYCFormProvider>
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
    </Page>
  );
};

export default KYCForm;
