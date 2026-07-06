import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import { useCreateCompanyFormContext } from "../CreateCompanyFormContext";
import { saveCompany, StoredCompany } from "@/utils/companyStorage";
import { superUserSchema, SuperUserType } from "../schema";
import { StepActions } from "../components/StepActions";

export function SuperUser({
  setCurrentStep,
  onCancel,
  onSuccess,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { state, dispatch } = useCreateCompanyFormContext();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SuperUserType>({
    resolver: yupResolver(superUserSchema),
    defaultValues: state.formData.superUser,
  });

  const onSubmit = (data: SuperUserType) => {
    setLoading(true);
    dispatch({ type: "SET_FORM_DATA", payload: { superUser: data } });
    dispatch({
      type: "SET_STEP_STATUS",
      payload: { superUser: { isDone: true } },
    });

    const { formData } = state;
    const company: StoredCompany = {
      id: crypto.randomUUID(),
      companyName: formData.companyInfo.companyName,
      natureOfBusiness: formData.companyInfo.natureOfBusiness,
      taxSystem: formData.companyInfo.taxSystem,
      addressLine1: formData.basicDetails.addressLine1,
      addressLine2: formData.basicDetails.addressLine2 ?? "",
      city: formData.basicDetails.city,
      pinCode: formData.basicDetails.pinCode,
      country: formData.basicDetails.country,
      state: formData.basicDetails.state,
      stateCode: formData.basicDetails.stateCode,
      district: formData.basicDetails.district,
      mobile: formData.basicDetails.mobile,
      phone: formData.basicDetails.phone ?? "",
      email: formData.basicDetails.email,
      website: formData.basicDetails.website ?? "",
      dateFormat: formData.basicDetails.dateFormat,
      gstNo: formData.registrationDetails.gstNo ?? "",
      vatNo: formData.registrationDetails.vatNo ?? "",
      panNo: formData.registrationDetails.panNo ?? "",
      tanNo: formData.registrationDetails.tanNo ?? "",
      dlNo1: formData.licensing.dlNo1 ?? "",
      dlNo2: formData.licensing.dlNo2 ?? "",
      dealsIn: formData.licensing.dealsIn ?? "",
      startDate: formData.financialYear.startDate,
      endDate: formData.financialYear.endDate,
      bankDetails: formData.bankDetails.bankDetails,
      username: data.username,
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    saveCompany(company);
    dispatch({ type: "RESET_FORM" });
    setLoading(false);
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="flex grow flex-col"
    >
      <div className="grow space-y-4">
        <Input
          {...register("username")}
          label="Username"
          placeholder="Enter username"
          prefix={<UserIcon className="size-5" strokeWidth="1" />}
          error={errors.username?.message}
        />
        <Input
          {...register("password")}
          label="Password"
          type="password"
          placeholder="Enter password"
          prefix={<LockClosedIcon className="size-5" strokeWidth="1" />}
          error={errors.password?.message}
        />
      </div>
      <StepActions
        showPrevious
        onPrevious={() => setCurrentStep(5)}
        onCancel={onCancel}
        submitLabel="Create Company"
        loading={loading}
      />
    </form>
  );
}
