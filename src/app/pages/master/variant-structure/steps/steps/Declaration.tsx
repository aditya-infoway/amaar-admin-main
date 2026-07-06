// Import Dependencies
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";

// Local Imports
import { Button, GhostSpinner } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { DocumentUpload } from "../components/DocumentUpload";

// ----------------------------------------------------------------------

type DocumentsType = {
  productImage?: File | null;
  brochurePdf?: File | null;
  drawingPdf?: File | null;
  specSheet?: File | null;
};

const documentFields = [
  { name: "productImage" as const, label: "Product Image" },
  { name: "brochurePdf" as const, label: "Brochure PDF" },
  { name: "drawingPdf" as const, label: "Drawing PDF" },
  { name: "specSheet" as const, label: "Spec Sheet" },
];

export function Declaration({
  setCurrentStep,
  setFinished,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const kycFormCtx = useKYCFormContext();
  const [loading, setLoading] = useState(false);

  const { handleSubmit, control } = useForm<DocumentsType>({
    defaultValues: kycFormCtx.state.formData.declaration as DocumentsType,
  });

  const onSubmit = (data: DocumentsType) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      kycFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { declaration: data as never },
      });
      kycFormCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: { declaration: { isDone: true } },
      });
      setFinished(true);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6">
        <p className="mb-4 text-sm font-medium text-gray-700 dark:text-dark-200">
          Documents
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {documentFields.map((doc) => (
            <div key={doc.name}>
              <p className="mb-1.5 text-xs font-medium text-gray-600 dark:text-dark-300">
                {doc.label}

              </p>
              <Controller
                control={control}
                name={doc.name}
                render={({ field }) => (
                  <DocumentUpload
                    {...field}
                    value={field.value ?? null}
                    classNames={{ box: "mt-0" }}
                  />
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button className="min-w-[7rem]" onClick={() => setCurrentStep(2)}>
          Back
        </Button>
        <Button
          type="submit"
          className="min-w-[7rem] space-x-2"
          color="primary"
          disabled={loading}
        >
          {loading && <GhostSpinner className="size-4 border-2" />}
          <span>Finish</span>
        </Button>
      </div>
    </form>
  );
}