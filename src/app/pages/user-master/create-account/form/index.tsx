import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { Account } from "../../shared/types";
import {
  countryOptions,
  groupOptions,
  stateOptions,
  talukaOptions,
  drCrOptions,
  districtOptions,
  cityOptions,
} from "../../shared/constants";
import { masterStorage } from "../../shared/storage";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { GroupCombobox } from "../groupCombobox";

interface AccountFormValues {
  accountName: string;
  printName: string;
  openingBalance: string;
  drCr: string;
  country: string;
  state: string;
  stateCode: string;
  district: string;
  taluka: string;
  city: string;
  area: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  phone: string;
  email: string;
  contactPerson: string;
  mobile: string;
  group: string;
  birthdayOn: string;
  anniversary: string;
  bankAccountNo: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  gstNo: string;
  panCard: string;
  aadharCardNo: string;
  addressCardNo: string;
  status: string;
}

const emptyFormValues: AccountFormValues = {
  accountName: "",
  printName: "",
  openingBalance: "0.00",
  drCr: "DR",
  country: "",
  state: "",
  stateCode: "",
  district: "",
  taluka: "",
  city: "",
  area: "",
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  phone: "",
  email: "",
  contactPerson: "",
  mobile: "",
  group: "",
  birthdayOn: "",
  anniversary: "",
  bankAccountNo: "",
  bankName: "",
  ifscCode: "",
  branchName: "",
  gstNo: "",
  panCard: "",
  aadharCardNo: "",
  addressCardNo: "",
  status: "active",
};

export function AccountForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    defaultValues: emptyFormValues,
  });



  useEffect(() => {
    if (isEdit && id) {
      const accounts = masterStorage.getAccounts();
      const account = accounts.find((acc: any) => acc.id === id);
      if (account) {
        reset({
          accountName: account.accountName || "",
          printName: account.printName || "",
          openingBalance: account.openingBalance || "0.00",
          drCr: account.drCr || "DR",
          country: account.country || "",
          state: account.state || "",
          stateCode: account.stateCode || "",
          district: account.district || "",
          taluka: account.taluka || "",
          city: account.city || "",
          area: account.area || "",
          addressLine1: account.addressLine1 || "",
          addressLine2: account.addressLine2 || "",
          pincode: account.pincode || "",
          phone: account.phone || "",
          email: account.email || "",
          contactPerson: account.contactPerson || "",
          mobile: account.mobile || "",
          group: account.group || "",
          birthdayOn: account.birthdayOn || "",
          anniversary: account.anniversary || "",
          bankAccountNo: account.bankAccountNo || "",
          bankName: account.bankName || "",
          ifscCode: account.ifscCode || "",
          branchName: account.branchName || "",
          gstNo: account.gstNo || "",
          panCard: account.panCard || "",
          aadharCardNo: account.aadharCardNo || "",
          addressCardNo: account.addressCardNo || "",
          status: account.status || "active",
        });
      }
    }
  }, [id, isEdit, reset]);

  const handleVerifyGst = () => {
    // TODO: wire up actual GST verification API call
    console.log("Verify GST clicked");
  };

  const onSubmit = (data: AccountFormValues) => {
    const accounts = masterStorage.getAccounts();
    const newAccount: Account = {
      id: isEdit ? id! : crypto.randomUUID(),
      ...data,
      createdAt: isEdit
        ? accounts.find((a: any) => a.id === id)?.createdAt ||
        new Date().toISOString()
        : new Date().toISOString(),
      status: data.status as "active" | "inactive",
    };

    if (isEdit) {
      const updated = accounts.map((acc: any) =>
        acc.id === id ? newAccount : acc,
      );
      masterStorage.saveAccounts(updated);
    } else {
      masterStorage.saveAccounts([newAccount, ...accounts]);
    }

    navigate("/user-master/accounts");
  };

  return (
    <Page title={isEdit ? "Edit Account" : "Create Account"}>
      <div className="transition-content w-full pb-5">
        <div className="mb-6 flex items-center justify-between p-6 pb-0">
          <h1 className="text-2xl font-bold text-primary underline underline-offset-4">
            {isEdit ? "Edit Account" : "Create Account"}
          </h1>
          <Button
            type="button"
            onClick={() => navigate("/user-master/accounts")}
            className="gap-1.5"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg bg-white p-6 shadow-sm dark:bg-dark-800"
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2 lg:divide-x lg:divide-gray-200 dark:lg:divide-dark-500">
            {/* Left section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:pr-8">
              <div className="sm:col-span-2">
                <Input
                  {...register("accountName", {
                    required: "Account Name is required",
                  })}
                  label="Account Name"
                  placeholder="Enter Account Name"
                  error={errors.accountName?.message}
                />
              </div>

              <Input
                {...register("printName", {
                  required: "Print Name is required",
                })}
                label="Print Name"
                placeholder="Enter Print Name"
                error={errors.printName?.message}
              />

              <Controller
                name="group"
                control={control}
                rules={{ required: "Group is required" }}
                render={({ field }) => (
                  <GroupCombobox
                    data={groupOptions}
                    displayField="label"
                    searchFields={["label", "effect"]}
                    value={
                      groupOptions.find((item) => item.value === field.value) ||
                      null
                    }
                    onChange={(val: any) => field.onChange(val?.value || "")}
                    label="Group"
                    placeholder="Search Group"
                  />
                )}
              />
              <Input
                {...register("openingBalance")}
                label="Opening Balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.openingBalance?.message}
              />

              <Controller
                control={control}
                name="drCr"
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={drCrOptions}
                    value={
                      drCrOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Dr./Cr."
                    placeholder="Select"
                    displayField="label"
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="country"
                rules={{ required: "Country is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={countryOptions}
                    value={
                      countryOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Country"
                    placeholder="Select Country"
                    displayField="label"
                    error={errors.country?.message}
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="state"
                rules={{ required: "State is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={stateOptions}
                    value={
                      stateOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="State"
                    placeholder="Select State"
                    displayField="label"
                    error={errors.state?.message}
                    {...rest}
                  />
                )}
              />

              <Input
                {...register("stateCode")}
                label="State Code"
                placeholder="Enter State Code"
                error={errors.stateCode?.message}
              />

              <Controller
                control={control}
                name="district"
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={districtOptions}
                    value={
                      districtOptions.find((item) => item.id === value) ||
                      null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="District"
                    placeholder="Select"
                    displayField="label"
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="taluka"
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={talukaOptions}
                    value={
                      talukaOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Taluka"
                    placeholder="Select"
                    displayField="label"
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="city"
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={cityOptions}
                    value={
                      cityOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="City"
                    placeholder="Select City"
                    displayField="label"
                    {...rest}
                  />
                )}
              />

              <Input
                {...register("area")}
                label="Area"
                placeholder="Enter Area"
                error={errors.area?.message}
              />

              <Input
                {...register("addressLine1")}
                label="Address Line 1"
                placeholder="Enter Address"
                error={errors.addressLine1?.message}
              />

              <Input
                {...register("addressLine2")}
                label="Address Line 2"
                placeholder="Enter Address Line 2"
                error={errors.addressLine2?.message}
              />

              <Input
                {...register("pincode")}
                label="Pincode"
                placeholder="Pincode"
                error={errors.pincode?.message}
              />

              <Input
                {...register("phone")}
                label="Phone"
                placeholder="Phone"
                error={errors.phone?.message}
              />

              <Input
                {...register("mobile")}
                label="Mobile"
                placeholder="Mobile"
                error={errors.mobile?.message}
              />

              <Input
                {...register("email")}
                label="Email"
                type="email"
                placeholder="Enter Email"
                error={errors.email?.message}
              />

              <Input
                {...register("contactPerson")}
                label="Contact Person"
                placeholder="Contact Name"
                error={errors.contactPerson?.message}
              />
            </div>

            {/* Right section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:pl-8">
              <Controller
                control={control}
                name="birthdayOn"
                render={({ field: { value, onChange, ...rest } }) => (
                  <DatePicker
                    label="Birthday On"
                    value={value}
                    onChange={(date: any) => onChange(date)}
                    placeholder="Select Date"
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="anniversary"
                render={({ field: { value, onChange, ...rest } }) => (
                  <DatePicker
                    label="Anniversary"
                    value={value}
                    onChange={(date: any) => onChange(date)}
                    placeholder="Select Date"
                    {...rest}
                  />
                )}
              />

              <Input
                {...register("bankAccountNo")}
                label="Bank Account No."
                placeholder="Account Number"
                error={errors.bankAccountNo?.message}
              />

              <Input
                {...register("bankName")}
                label="Bank Name"
                placeholder="Bank Name"
                error={errors.bankName?.message}
              />

              <Input
                {...register("ifscCode")}
                label="IFSC Code"
                placeholder="IFSC Code"
                error={errors.ifscCode?.message}
              />

              <Input
                {...register("branchName")}
                label="Branch"
                placeholder="Branch Name"
                error={errors.branchName?.message}
              />

              <div className="relative">
                <Input
                  {...register("gstNo")}
                  label="GST No."
                  placeholder="GST Number"
                  error={errors.gstNo?.message}
                  className="pr-16"
                />
                <Button
                  type="button"
                  color="success"
                  onClick={handleVerifyGst}
                  className="absolute right-1 top-7 h-auto px-2 py-1 mt-1 text-xs font-medium"
                >
                  Verify
                </Button>
              </div>

              <Input
                {...register("panCard")}
                label="PAN Card"
                placeholder="PAN Card Number"
                error={errors.panCard?.message}
              />

              <div className="sm:col-span-2">
                <Input
                  {...register("aadharCardNo")}
                  label="Aadhar Card No"
                  placeholder="Aadhar Number"
                  error={errors.aadharCardNo?.message}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-dark-500">
            <Button type="submit">
              Cancel
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={() => navigate("/user-master/accounts")}
            >

              Save

            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}