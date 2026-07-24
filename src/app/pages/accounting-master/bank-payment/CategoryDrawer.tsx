import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input, Radio, Textarea } from "@/components/ui";
import { BankPayment } from "../shared/types";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { AccountListbox, AccountOption } from "@/components/shared/form/AccountListbox";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

interface BankPaymentDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void;
}

const paymentApi = {
  nextVoucherNo: (financialYearId: string) =>
    Get("payment/next-voucher-no", { financialYearId, voucherType: "BANK PAYMENT" }, false),
  create: (payload: Record<string, any>) => Post("payment/bank/create", payload, false),
};

const accountApi = {
  bankList: () => Get("master/account/bank/list", {}, false),
  oppList: () => Get("master/account/opposite/list", {}, false),
};

const emptyDefaults = {
  paymentMode: "manual",
  bankAccount: "",
  voucherNo: "",
  date: "",
  oppAccount: "",
  amount: "",
  transactionMode: "neft",
  chequeNumber: "",
  chequeDate: "",
  chequeClearDate: "",
  narration: "",
} as const; 

const formatDateForApi = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function BankPaymentDrawer({ isOpen, close, onSaved }: BankPaymentDrawerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [bankAccountOptions, setBankAccountOptions] = useState<{ id: string; label: string }[]>([]);
  const [oppAccountOptions, setOppAccountOptions] = useState<AccountOption[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BankPayment & { paymentMode: "manual" | "bom" }>({
    defaultValues: emptyDefaults,
  });

  const paymentMode = watch("paymentMode");
  const transactionMode = watch("transactionMode");

  useEffect(() => {
    if (!isOpen) return;

    reset(emptyDefaults);
    setBankAccountOptions([]);
    setOppAccountOptions([]);

    (async () => {
      try {
        const financialYearId = sessionStorage.getItem("financialYearId") || "";

        const [bankRes, oppRes, voucherRes] = await Promise.all([
          accountApi.bankList(),
          accountApi.oppList(),
          paymentApi.nextVoucherNo(financialYearId),
        ]);

        const bankList = bankRes?.data?.data || [];
        setBankAccountOptions(
          bankList.map((a: any) => ({ id: String(a.id), label: a.accountName })),
        );

        const oppList = oppRes?.data?.data || [];
        setOppAccountOptions(
          oppList.map((a: any) => ({
            id: String(a.id),
            name: a.accountName,
            number: a.mobileNo || "",
            balance: Number(a.currentBalance || 0),
          })),
        );

        const voucherNo = voucherRes?.data?.data?.voucherNo || "";
        setValue("voucherNo", voucherNo);
        setValue("date", formatDateForApi(new Date()));
      } catch (err) {
        toasterrormsg("Failed to load form data");
      }
    })();
  }, [isOpen, reset, setValue]);

  const handleClose = () => {
    reset(emptyDefaults);
    close();
  };

  const onSubmit = async (data: any) => {
    if (data.paymentMode === "bom") {
      toasterrormsg("BOM payment is not available yet.");
      return;
    }

    // Cheque mode client-side guard
    if (data.transactionMode === "cheque" && (!data.chequeNumber || !data.chequeDate)) {
      toasterrormsg("Cheque number and cheque date are required for cheque mode.");
      return;
    }

    try {
      setSubmitting(true);
      const financialYearId = sessionStorage.getItem("financialYearId");
      const companyId = sessionStorage.getItem("companyId");

      const res = await paymentApi.create({
        bankAccountId: Number(data.bankAccount),
        voucherNo: data.voucherNo,
        date: data.date,
        oppAccountId: Number(data.oppAccount),
        amount: Number(data.amount),
        transactionMode: String(data.transactionMode).toUpperCase(),
        chequeNo: data.transactionMode === "cheque" ? data.chequeNumber : "",
        chequeDate: data.transactionMode === "cheque" ? data.chequeDate : "",
        chequeClearDate: data.transactionMode === "cheque" ? data.chequeClearDate : "",
        narration: data.narration || "",
        financialYearId: financialYearId ? Number(financialYearId) : undefined,
        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",
      });

      if (res?.data?.status === 400 || res?.data?.success === false) {
        toasterrormsg(res?.data?.message || "Something went wrong.");
        return;
      }

      toastsuccessmsg(res?.data?.message || "Bank payment saved successfully");
      onSaved();
      handleClose();
    } catch (err: any) {
      toasterrormsg(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full lg:max-w-[50%] transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="text-lg font-semibold text-white">Add Bank Payment</h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {/* Payment Mode Radio */}
              <Controller
                control={control}
                name="paymentMode"
                render={({ field }) => (
                  <div className="flex items-center gap-6 py-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                      <Radio checked={field.value === "manual"} onChange={() => field.onChange("manual")} />
                      Manual
                    </label>
                    <label className="flex cursor-not-allowed items-center gap-2 text-sm font-medium text-gray-400">
                      <Radio checked={field.value === "bom"} disabled onChange={() => field.onChange("bom")} />
                      BOM (Coming Soon)
                    </label>
                  </div>
                )}
              />

              {/* Bank Account / Voucher No / Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  control={control}
                  name="bankAccount"
                  rules={{ required: "Bank account is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={bankAccountOptions}
                      value={bankAccountOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="Bank Account"
                      placeholder="Select Bank Account"
                      displayField="label"
                      error={errors.bankAccount?.message as string}
                      {...rest}
                    />
                  )}
                />

                <Input
                  {...register("voucherNo", { required: "Voucher no is required" })}
                  label="Voucher No."
                  placeholder="Auto generated"
                  readOnly
                  error={errors.voucherNo?.message as string}
                />

                <Controller
                  control={control}
                  name="date"
                  rules={{ required: "Date is required" }}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Date"
                      value={value}
                      onChange={(dates: Date[]) => {
                        const picked = dates?.[0];
                        onChange(picked ? formatDateForApi(picked) : "");
                      }}
                      placeholder="Choose date..."
                      error={errors.date?.message as string}
                    />
                  )}
                />
              </div>

              <div className="border-t-3 border-dotted border-primary my-8" />

              {/* Opp Account / Amount */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Controller
                    control={control}
                    name="oppAccount"
                    rules={{ required: "Opp account is required" }}
                    render={({ field: { value, onChange } }) => (
                      <AccountListbox
                        data={oppAccountOptions}
                        value={oppAccountOptions.find((item) => item.id === value)}
                        onChange={(item: AccountOption) => onChange(item.id)}
                        label="Opp. Account"
                        placeholder="Select Opp. Account"
                        error={errors.oppAccount?.message as string}
                      />
                    )}
                  />
                </div>

                <Input
                  {...register("amount", { required: "Amount is required" })}
                  label="Amount"
                  placeholder="Amount"
                  type="number"
                  error={errors.amount?.message as string}
                />
              </div>

              {/* Transaction Mode Radio */}
              <Controller
                control={control}
                name="transactionMode"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-dark-100">Mode:</label>
                    <div className="flex flex-wrap items-center gap-6">
                      {["neft", "rtgs", "imps", "cheque", "upi"].map((mode) => (
                        <label key={mode} className="flex cursor-pointer items-center gap-2 text-sm font-medium uppercase text-gray-700 dark:text-dark-100">
                          <Radio checked={field.value === mode} onChange={() => field.onChange(mode)} />
                          {mode}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              />

              {/* Cheque Fields — only shown when Cheque mode is selected */}
              {transactionMode === "cheque" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input
                    {...register("chequeNumber", { required: "Cheque number is required" })}
                    label="Cheque Number"
                    placeholder="Enter cheque number"
                    error={errors.chequeNumber?.message as string}
                  />

                  <Controller
                    control={control}
                    name="chequeDate"
                    rules={{ required: "Cheque date is required" }}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        label="Cheque Date"
                        value={value}
                        onChange={(dates: Date[]) => {
                          const picked = dates?.[0];
                          onChange(picked ? formatDateForApi(picked) : "");
                        }}
                        placeholder="Choose date..."
                        error={errors.chequeDate?.message as string}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="chequeClearDate"
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        label="Cheque Clear Date"
                        value={value}
                        onChange={(dates: Date[]) => {
                          const picked = dates?.[0];
                          onChange(picked ? formatDateForApi(picked) : "");
                        }}
                        placeholder="Choose date..."
                      />
                    )}
                  />
                </div>
              )}

              <Textarea
                {...register("narration")}
                rows={5}
                label="Narration"
                placeholder="Enter Narration"
                error={errors.narration?.message as string}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                disabled={submitting || paymentMode === "bom"}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {submitting ? "Saving..." : "Add Bank Payment"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}