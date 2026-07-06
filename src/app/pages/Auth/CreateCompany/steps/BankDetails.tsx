import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Textarea } from "@/components/ui";
import { useCreateCompanyFormContext } from "../CreateCompanyFormContext";
import { bankDetailsSchema, BankDetailsType } from "../schema";
import { StepActions } from "../components/StepActions";

export function BankDetails({
  setCurrentStep,
  onCancel,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { state, dispatch } = useCreateCompanyFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BankDetailsType>({
    resolver: yupResolver(bankDetailsSchema),
    defaultValues: state.formData.bankDetails,
  });

  const onSubmit = (data: BankDetailsType) => {
    dispatch({ type: "SET_FORM_DATA", payload: { bankDetails: data } });
    dispatch({
      type: "SET_STEP_STATUS",
      payload: { bankDetails: { isDone: true } },
    });
    setCurrentStep(6);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="flex grow flex-col"
    >
      <div className="grow space-y-4">
        <Textarea
          {...register("bankDetails")}
          label="Bank Details"
          placeholder="Enter bank name, account number, IFSC, branch, etc."
          rows={5}
          error={errors.bankDetails?.message}
        />
      </div>
      <StepActions
        showPrevious
        onPrevious={() => setCurrentStep(4)}
        onCancel={onCancel}
        submitLabel="Next"
      />
    </form>
  );
}
