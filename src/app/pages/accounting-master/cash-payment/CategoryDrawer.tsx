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
import { CashPayment } from "../shared/types";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { AccountListbox, AccountOption } from "@/components/shared/form/AccountListbox";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

interface CashPaymentDrawerProps {
  isOpen: boolean;
  close: () => void;
  onSaved: () => void; // save hone ke baad list refresh trigger karne ke liye
}

const paymentApi = {
  nextVoucherNo: (financialYearId: string) =>
    Get("payment/next-voucher-no", { financialYearId, voucherType: "CASH PAYMENT" }, false),
  create: (payload: Record<string, any>) => Post("payment/cash/create", payload, false),
};

const accountApi = {
  cashList: () => Get("master/account/cash/list", {}, false),
  oppList: () => Get("master/account/opposite/list", {}, false),
};

export function CashPaymentDrawer({ isOpen, close, onSaved }: CashPaymentDrawerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [cashAccountOptions, setCashAccountOptions] = useState<{ id: string; label: string }[]>([]);
  const [oppAccountOptions, setOppAccountOptions] = useState<AccountOption[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CashPayment & { paymentMode: "manual" | "bom" }>({
    defaultValues: { paymentMode: "manual", date: "" },
  });

  const paymentMode = watch("paymentMode");

  // Drawer open hote hi: cash accounts, opp accounts, aur next voucher no fetch karo
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const financialYearId = sessionStorage.getItem("financialYearId") || "";

        const [cashRes, oppRes, voucherRes] = await Promise.all([
          accountApi.cashList(),
          accountApi.oppList(),
          paymentApi.nextVoucherNo(financialYearId),
        ]);

        const cashList = cashRes?.data?.data || [];
        setCashAccountOptions(
          cashList.map((a: any) => ({ id: String(a.id), label: a.accountName })),
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
        setValue("date", new Date().toISOString().slice(0, 10));
      } catch (err) {
        toasterrormsg("Failed to load form data");
      }
    })();
  }, [isOpen, setValue]);

  const handleClose = () => {
    reset({ paymentMode: "manual" });
    close();
  };

  const onSubmit = async (data: any) => {
    // BOM abhi save nahi hota — extra safety guard
    if (data.paymentMode === "bom") {
      toasterrormsg("BOM payment is not available yet.");
      return;
    }

    try {
      setSubmitting(true);
      const financialYearId = sessionStorage.getItem("financialYearId");

      const res = await paymentApi.create({
        cashAccountId: Number(data.cashAccount),
        voucherNo: data.voucherNo,
        date: data.date,
        oppAccountId: Number(data.oppAccount),
        amount: Number(data.amount),
        narration: data.narration || "",
        financialYearId: financialYearId ? Number(financialYearId) : undefined,
      });

      if (res?.data?.status === 400 || res?.data?.success === false) {
        toasterrormsg(res?.data?.message || "Something went wrong.");
        return;
      }

      toastsuccessmsg(res?.data?.message || "Cash payment saved successfully");
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="text-lg font-semibold text-white">Add Cash Payment</h3>
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
                defaultValue="manual"
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

              {/* Cash Account / Voucher No / Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  control={control}
                  name="cashAccount"
                  rules={{ required: "Cash account is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={cashAccountOptions}
                      value={cashAccountOptions.find((item) => item.id === value) || null}
                      onChange={(item) => onChange(item.id)}
                      label="Cash Account"
                      placeholder="Select Cash Account"
                      displayField="label"
                      error={errors.cashAccount?.message as string}
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
                        if (!picked) return onChange("");
                        const yyyy = picked.getFullYear();
                        const mm = String(picked.getMonth() + 1).padStart(2, "0");
                        const dd = String(picked.getDate()).padStart(2, "0");
                        onChange(`${yyyy}-${mm}-${dd}`);
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
                {submitting ? "Saving..." : "Add Cash Payment"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}