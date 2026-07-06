import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { useCreateCompanyFormContext } from "../CreateCompanyFormContext";
import { financialYearSchema, FinancialYearType } from "../schema";
import { StepActions } from "../components/StepActions";

export function FinancialYear({
  setCurrentStep,
  onCancel,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { state, dispatch } = useCreateCompanyFormContext();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FinancialYearType>({
    resolver: yupResolver(financialYearSchema),
    defaultValues: state.formData.financialYear,
  });

  const onSubmit = (data: FinancialYearType) => {
    dispatch({ type: "SET_FORM_DATA", payload: { financialYear: data } });
    dispatch({
      type: "SET_STEP_STATUS",
      payload: { financialYear: { isDone: true } },
    });
    setCurrentStep(5);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="flex grow flex-col"
    >
      <div className="grow space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="startDate"
            render={({ field: { value, onChange, ...rest } }) => (
              <DatePicker
                value={value || ""}
                onChange={(_, dateStr) => onChange(dateStr)}
                options={{ dateFormat: "Y-m-d" }}
                label="Start Date"
                placeholder="Select start date"
                error={errors.startDate?.message}
                {...rest}
              />
            )}
          />
          <Controller
            control={control}
            name="endDate"
            render={({ field: { value, onChange, ...rest } }) => (
              <DatePicker
                value={value || ""}
                onChange={(_, dateStr) => onChange(dateStr)}
                options={{ dateFormat: "Y-m-d" }}
                label="End Date"
                placeholder="Select end date"
                error={errors.endDate?.message}
                {...rest}
              />
            )}
          />
        </div>
      </div>
      <StepActions
        showPrevious
        onPrevious={() => setCurrentStep(3)}
        onCancel={onCancel}
        submitLabel="Next"
      />
    </form>
  );
}
