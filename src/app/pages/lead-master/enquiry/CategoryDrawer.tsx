import { Fragment, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Input, Textarea } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { City } from "country-state-city";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Get, Post, Put, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { Enquiry } from "./data";

interface ModelOption {
  id: string;
  label: string;
}

interface EnquiryDrawerProps {
  isOpen: boolean;
  close: () => void;
  enquiry: Enquiry | null;
  financialYearId: string; // TODO: apne FY context/selector se pass karo (Purchase page jaisa)
  onSaved: () => void; // save/update hone ke baad list refresh
}

interface EnquiryFormValues {
  leadCode: string;
  name: string;
  number: string;
  email: string;
  address: string;
  city: string;
  model: string;
  remark: string;
  nextFollowupDate: string;
}

const emptyFormValues: EnquiryFormValues = {
  leadCode: "",
  name: "",
  number: "",
  email: "",
  address: "",
  city: "",
  model: "",
  remark: "",
  nextFollowupDate: "",
};

// ===== Naye enquiry create karte waqt default creator type =====
const DEFAULT_CREATED_TYPE = "Super Admin";

type DrawerStep = "form" | "otp";

export function EnquiryDrawer({
  isOpen,
  close,
  enquiry,
  financialYearId,
  onSaved,
}: EnquiryDrawerProps) {
  const isEditing = Boolean(enquiry?.id);

  const [step, setStep] = useState<DrawerStep>("form");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [pendingValues, setPendingValues] = useState<EnquiryFormValues | null>(null);
  const [saving, setSaving] = useState(false);

  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [leadIdLoading, setLeadIdLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    defaultValues: emptyFormValues,
  });

  const cityOptions = useMemo(() => {
  const rawList = City.getCitiesOfCountry("IN") || [];
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];

  for (const c of rawList) {
    if (!seen.has(c.name)) {
      seen.add(c.name);
      options.push({ value: c.name, label: c.name });
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label));
}, []);

  // ===== Model list ab dynamic API se aayegi =====
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const response = await Get("master/model/list", {}, false);
        if (response.data?.success) {
          const options: ModelOption[] = (response.data.data || []).map(
            (item: any) => ({
              id: String(item.modelId ?? item.id),
              label: item.modelName ?? item.label,
            }),
          );
          setModelOptions(options);
        }
      } catch (error) {
        toasterrormsg("Model list load nahi ho payi.");
      }
    })();
  }, [isOpen]);

  // ===== Naye enquiry ka Lead Code purchase ke bill-no ki tarah generate hoga =====
  const fetchNextLeadId = async () => {
    setLeadIdLoading(true);
    try {
      const response = await Get(
        `lead/next-lead-id?financialYearId=${financialYearId}`,
        {},
        false,
      );
      if (response.data?.success) {
        setValue("leadCode", response.data.data.leadCode);
      } else {
        toasterrormsg(response.data?.message || "Lead Id generate nahi ho payi.");
      }
    } catch (error) {
      toasterrormsg("Lead Id generate karte waqt kuch galat ho gaya.");
    } finally {
      setLeadIdLoading(false);
    }
  };

  useEffect(() => {
    if (enquiry && enquiry.id) {
      reset({
        leadCode: enquiry.leadCode || "",
        name: enquiry.name || "",
        number: enquiry.number || "",
        email: enquiry.email || "",
        address: enquiry.address || "",
        city: enquiry.city || "",
        model: enquiry.model || "",
        remark: enquiry.remark || "",
        nextFollowupDate: enquiry.nextFollowupDate || "",
      });
    } else if (isOpen) {
      reset(emptyFormValues);
      fetchNextLeadId();
    }
    setStep("form");
    setOtpValue("");
    setOtpError("");
    setPendingValues(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiry, reset, isOpen]);

  const handleClose = () => {
    reset();
    setStep("form");
    setOtpValue("");
    setOtpError("");
    setPendingValues(null);
    close();
  };

  // Stage 1: form validate karo, static OTP generate karo, OTP step pe jao
  const onSubmitForm = handleSubmit((values) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setPendingValues(values);
    setOtpValue("");
    setOtpError("");
    setStep("otp");
  });

  // Stage 2: OTP verify karo, tabhi actual create/update API call ho
  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length !== 4) {
      setOtpError("Enter the 4 digit OTP");
      return;
    }
    if (otpValue !== generatedOtp) {
      setOtpError("Invalid OTP, please try again");
      return;
    }
    if (!pendingValues) return;

    setSaving(true);
    try {
      if (isEditing && enquiry?.id) {
        const response = await Put(
          "lead/update",
          { leadId: Number(enquiry.id), ...pendingValues },
          false,
        );
        if (response.data?.success) {
          onSaved();
          handleClose();
          toastsuccessmsg(response.data?.message);
        } else {
          toasterrormsg(response.data?.message || "Enquiry update nahi ho payi.");
        }
      } else {
        // ===== companyId sessionStorage se, createdType default "Super Admin" =====
        const companyId = sessionStorage.getItem("companyId") || "";

        const response = await Post(
          "lead/create",
          {
            financialYearId: Number(financialYearId),
            ...pendingValues,
            createdBy: Number(companyId),
            createdType: DEFAULT_CREATED_TYPE,
          },
          false,
        );
        if (response.data?.success) {
          onSaved();
          handleClose();
          toastsuccessmsg(response.data?.message);
        } else {
          toasterrormsg(response.data?.message || "Enquiry create nahi ho payi.");
        }
      }
    } catch (error) {
      toasterrormsg("Kuch galat ho gaya, dobara try karein.");
    } finally {
      setSaving(false);
    }
  };

  const handleResendOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setOtpValue("");
    setOtpError("");
  };

  const handleBackToForm = () => {
    setStep("form");
    setOtpValue("");
    setOtpError("");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40"
        />

        <TransitionChild
          as={DialogPanel}
          enter="ease-out transform-gpu transition-transform duration-200"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="ease-in transform-gpu transition-transform duration-200"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="text-lg font-semibold text-white">
              {step === "form" ? (isEditing ? "Edit Enquiry" : "Add Enquiry") : "Verify OTP"}
            </h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {step === "form" ? (
            <form onSubmit={onSubmitForm} className="flex grow flex-col overflow-hidden">
              <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                <Input
                  label="Lead Id"
                  required
                  readOnly
                  placeholder={leadIdLoading ? "Generating..." : "Lead Id"}
                  error={errors.leadCode?.message}
                  {...register("leadCode", { required: "Lead Id is required" })}
                />

                <Input
                  label="Name"
                  required
                  placeholder="Enter Name"
                  error={errors.name?.message}
                  {...register("name", { required: "Name is required" })}
                />

                <Input
                  label="Number"
                  required
                  placeholder="Enter Number"
                  error={errors.number?.message}
                  {...register("number", {
                    required: "Number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10 digit mobile number",
                    },
                  })}
                />

                <Input
                  label="Email"
                  type="email"
                  required
                  placeholder="Enter Email"
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />

                <Textarea
                  label="Address"
                  rows={5}
                  required
                  placeholder="Enter Address"
                  error={errors.address?.message}
                  {...register("address", { required: "Address is required" })}
                />

                <Controller
                  name="city"
                  control={control}
                  rules={{ required: "City is required" }}
                  render={({ field }) => (
                    <Combobox
                      label="City"
                      error={errors.city?.message}
                      data={cityOptions}
                      searchFields={["label"]}
                      highlight
                      value={cityOptions.find((item) => item.value === field.value) || null}
                      onChange={(item: { value: string; label: string } | null) =>
                        field.onChange(item?.value ?? "")
                      }
                      placeholder="Select City"
                      displayField="label"
                    />
                  )}
                />

                <Controller
                  name="model"
                  control={control}
                  rules={{ required: "Model is required" }}
                  render={({ field }) => (
                    <Listbox
                      label="Select Model"
                      error={errors.model?.message}
                      data={modelOptions}
                      value={modelOptions.find((item) => item.id === field.value) || null}
                      onChange={(item) => field.onChange(item.id)}
                      placeholder="Select Model"
                      displayField="label"
                    />
                  )}
                />

                <Textarea
                  label="Remark"
                  rows={5}
                  placeholder="Enter Remark"
                  error={errors.remark?.message}
                  {...register("remark")}
                />

                <Controller
                  name="nextFollowupDate"
                  control={control}
                  rules={{ required: "Next Followup Date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      label="Next Followup Date"
                      error={errors.nextFollowupDate?.message}
                      value={field.value}
                      onChange={(date: Date[]) => {
                        const selected = date?.[0];
                        field.onChange(selected ? selected.toISOString().slice(0, 10) : "");
                      }}
                      placeholder="Select Date"
                    />
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
                <Button type="button" onClick={handleClose}>Cancel</Button>
                <Button type="submit" color="primary">Submit</Button>
              </div>
            </form>
          ) : (
            <div className="flex grow flex-col overflow-hidden">
              <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                <p className="text-sm text-gray-600 dark:text-dark-200">
                  Enter the 4 digit OTP sent to{" "}
                  <span className="font-medium">{pendingValues?.number || "your registered number"}</span> to confirm this enquiry.
                </p>

                {/* Static/demo OTP flow — isliye OTP yahi screen pe dikha diya */}
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Demo OTP: {generatedOtp}
                </p>

                <Input
                  label="OTP"
                  required
                  placeholder="Enter OTP"
                  value={otpValue}
                  maxLength={4}
                  error={otpError}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                />

                <Button type="button" variant="flat" onClick={handleResendOtp} className="text-primary">
                  Resend OTP
                </Button>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
                <Button type="button" onClick={handleBackToForm}>Back</Button>
                <Button type="button" color="primary" disabled={saving} onClick={handleVerifyOtp}>
                  {saving ? "Saving..." : "Verify & Save"}
                </Button>
              </div>
            </div>
          )}
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}