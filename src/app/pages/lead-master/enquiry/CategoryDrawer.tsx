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
import { masterStorage } from "../shared/storage";
import { Enquiry } from "./data";
import { DatePicker } from "@/components/shared/form/Datepicker";

interface EnquiryDrawerProps {
  isOpen: boolean;
  close: () => void;
  enquiry: Enquiry | null;
  onSave: (enquiry: Enquiry) => void;
}

interface EnquiryFormValues {
  leadId: string;
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
  leadId: "",
  name: "",
  number: "",
  email: "",
  address: "",
  city: "",
  model: "",
  remark: "",
  nextFollowupDate: "",
};

type DrawerStep = "form" | "otp";

export function EnquiryDrawer({
  isOpen,
  close,
  enquiry,
  onSave,
}: EnquiryDrawerProps) {
  const isEditing = Boolean(enquiry?.id);

  const [step, setStep] = useState<DrawerStep>("form");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [pendingValues, setPendingValues] = useState<EnquiryFormValues | null>(
    null,
  );

  const modelOptions = useMemo(() => {
    return masterStorage.getModels().map((item) => ({
      id: item.id,
      label: item.modelName,
    }));
  }, []);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    if (enquiry && enquiry.id) {
      reset({
        leadId: enquiry.leadId || "",
        name: enquiry.name || "",
        number: enquiry.number || "",
        email: enquiry.email || "",
        address: enquiry.address || "",
        city: enquiry.city || "",
        model: enquiry.model || "",
        remark: enquiry.remark || "",
        nextFollowupDate: enquiry.nextFollowupDate || "",
      });
    } else {
      reset(emptyFormValues);
    }
    setStep("form");
    setOtpValue("");
    setOtpError("");
    setPendingValues(null);
  }, [enquiry, reset, isOpen]);

  const handleClose = () => {
    reset();
    setStep("form");
    setOtpValue("");
    setOtpError("");
    setPendingValues(null);
    close();
  };

  // Stage 1: validate the form, generate an OTP, move to the OTP step
  const onSubmitForm = handleSubmit((values) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setPendingValues(values);
    setOtpValue("");
    setOtpError("");
    setStep("otp");
    // In production, replace this with an actual SMS/email OTP send call.
    // eslint-disable-next-line no-console
    console.log("Generated OTP (dev only):", otp);
  });

  // Stage 2: verify OTP, then actually persist the record
  const handleVerifyOtp = () => {
    if (!otpValue || otpValue.length !== 4) {
      setOtpError("Enter the 4 digit OTP");
      return;
    }
    if (otpValue !== generatedOtp) {
      setOtpError("Invalid OTP, please try again");
      return;
    }
    if (!pendingValues) return;

    onSave({
      id: enquiry?.id || crypto.randomUUID(),
      leadId: pendingValues.leadId,
      name: pendingValues.name,
      number: pendingValues.number,
      email: pendingValues.email,
      address: pendingValues.address,
      city: pendingValues.city,
      model: pendingValues.model,
      remark: pendingValues.remark,
      nextFollowupDate: pendingValues.nextFollowupDate,
      createdBy: enquiry?.createdBy || "Admin",
      createdType: enquiry?.createdType || "Manual",
      createdAt: enquiry?.createdAt || new Date().toISOString(),
    });
    handleClose();
  };

  const handleResendOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setOtpValue("");
    setOtpError("");
    // eslint-disable-next-line no-console
    console.log("Resent OTP (dev only):", otp);
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="text-lg font-semibold text-white">
              {step === "form"
                ? isEditing
                  ? "Edit Enquiry"
                  : "Add Enquiry"
                : "Verify OTP"}
            </h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          {step === "form" ? (
            <form
              onSubmit={onSubmitForm}
              className="flex grow flex-col overflow-hidden"
            >
              <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                <Input
                  label="Lead Id"
                  required
                  placeholder="Enter Lead Id"
                  error={errors.leadId?.message}
                  {...register("leadId", { required: "Lead Id is required" })}
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
                  })}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter Email"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Textarea
                  label="Address"
                  rows={5}
                  placeholder="Enter Address"
                  error={errors.address?.message}
                  {...register("address")}
                />

                <Input
                  label="City"
                  placeholder="Enter City"
                  error={errors.city?.message}
                  {...register("city")}
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
                      value={
                        modelOptions.find((item) => item.id === field.value) ||
                        null
                      }
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
                        field.onChange(
                          selected ? selected.toISOString().slice(0, 10) : "",
                        );
                      }}
                      placeholder="Select Date"
                    />
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
                <Button type="button" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  Submit
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex grow flex-col overflow-hidden">
              <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
                <p className="text-sm text-gray-600 dark:text-dark-200">
                  Enter the 4 digit OTP sent to{" "}
                  <span className="font-medium">
                    {pendingValues?.number || "your registered number"}
                  </span>{" "}
                  to confirm this enquiry.
                </p>

                <Input
                  label="OTP"
                  required
                  placeholder="Enter OTP"
                  value={otpValue}
                  maxLength={4}
                  error={otpError}
                  onChange={(e) =>
                    setOtpValue(e.target.value.replace(/\D/g, ""))
                  }
                />

                <Button
                  type="button"
                  variant="flat"
                  onClick={handleResendOtp}
                  className="text-primary"
                >
                  Resend OTP
                </Button>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
                <Button type="button" onClick={handleBackToForm}>
                  Back
                </Button>
                <Button type="button" color="primary" onClick={handleVerifyOtp}>
                  Verify & Save
                </Button>
              </div>
            </div>
          )}
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}