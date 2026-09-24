import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Controller, useForm } from "react-hook-form";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Button, Input, Radio, Textarea } from "@/components/ui";
import { BankReceipt } from "../shared/types";
import { DatePicker } from "@/components/shared/form/Datepicker";
import {
  AccountListbox,
  AccountOption,
} from "@/components/shared/form/AccountListbox";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

// 1. Create a safe local structural type matching the dynamic states of this specific form
type FormBankReceipt = Omit<BankReceipt, "receiptMode"> & {
  receiptMode: "manual" | "workorder";
  transactionMode?: string;
  workOrderNo?: any[];
  chequeNumber?: string;
  chequeDate?: string;
  chequeClearDate?: string;
};

interface BankReceiptDrawerProps {
  isOpen: boolean;
  close: () => void;
  bankReceipt: BankReceipt | null;
  onSaved: () => void; // ✅ CHANGED — ab list refresh trigger karega
}

interface AccountListItem {
  id: string;
  label: string;
}

// ✅ NEW — work order API helper
const workOrderApi = {
  list: () => Get("workorder/list", {}, false),
};

// ✅ NEW — bank receipt payment API helpers
const paymentApi = {
  nextVoucherNo: (financialYearId: string) =>
    Get(
      "payment/next-voucher-no",
      { financialYearId, voucherType: "BANK RECEIPT" },
      false,
    ),
  create: (payload: Record<string, any>) =>
    Post("payment/bank-receipt/create", payload, false),
};

export function BankReceiptDrawer({
  isOpen,
  close,
  bankReceipt,
  onSaved,
}: BankReceiptDrawerProps) {
  const isEdit = Boolean(bankReceipt?.id);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormBankReceipt>({
    defaultValues: {
      receiptMode: "manual",
      transactionMode: "upi",
      workOrderNo: [],
    },
    values: (bankReceipt as unknown as FormBankReceipt) || undefined,
  });

  const receiptMode = watch("receiptMode");
  const transactionMode = watch("transactionMode");

  // ✅ NEW — dynamic option states
  const [bankAccountOptions, setBankAccountOptions] = useState<
    AccountListItem[]
  >([]);
  const [bankLoading, setBankLoading] = useState(false);

  const [oppAccountOptions, setOppAccountOptions] = useState<AccountOption[]>(
    [],
  );
  const [oppLoading, setOppLoading] = useState(false);

  const [voucherLoading, setVoucherLoading] = useState(false);

  const [workOrderOptions, setWorkOrderOptions] = useState<AccountListItem[]>(
    [],
  );
  const [workOrderLoading, setWorkOrderLoading] = useState(false);

  // Drawer open hote hi current date + voucher no set (naya add karte waqt)
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) return;

    setValue("date", new Date().toISOString().slice(0, 10));

    const fetchVoucherNo = async () => {
      setVoucherLoading(true);
      try {
        const financialYearId = localStorage.getItem("financialYearId") || "";
        const res = await paymentApi.nextVoucherNo(financialYearId);
        const voucherNo = res?.data?.data?.voucherNo || "";
        setValue("voucherNo", voucherNo);
      } catch (err: any) {
        toasterrormsg(
          err?.response?.data?.message || "Failed to fetch voucher number.",
        );
      } finally {
        setVoucherLoading(false);
      }
    };

    fetchVoucherNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ✅ NEW — bank accounts fetch
  useEffect(() => {
    if (!isOpen) return;

    const fetchBankAccounts = async () => {
      setBankLoading(true);
      try {
        const res = await Get("master/account/bank/list", {}, false);
        if (res.data?.success) {
          const mapped: AccountListItem[] = (res.data.data || []).map(
            (item: any) => ({
              id: String(item.id),
              label: item.accountName || "",
            }),
          );
          setBankAccountOptions(mapped);
        } else {
          setBankAccountOptions([]);
          toasterrormsg(res.data?.message || "Failed to load bank accounts.");
        }
      } catch (err: any) {
        setBankAccountOptions([]);
        toasterrormsg(
          err?.response?.data?.message ||
            "Something went wrong while loading bank accounts.",
        );
      } finally {
        setBankLoading(false);
      }
    };

    fetchBankAccounts();
  }, [isOpen]);

  // ✅ NEW — opp accounts fetch
  useEffect(() => {
    if (!isOpen) return;

    const fetchOppAccounts = async () => {
      setOppLoading(true);
      try {
        const res = await Get("master/account/customer/list", {}, false);
        if (res.data?.success) {
          const mapped: AccountOption[] = (res.data.data || []).map(
            (item: any) => ({
              id: String(item.id),
              name: item.accountName || "",
              number: item.mobileNo || "",
              balance: Number(item.currentBalance ?? 0),
            }),
          );
          setOppAccountOptions(mapped);
        } else {
          setOppAccountOptions([]);
          toasterrormsg(
            res.data?.message || "Failed to load opposite accounts.",
          );
        }
      } catch (err: any) {
        setOppAccountOptions([]);
        toasterrormsg(
          err?.response?.data?.message ||
            "Something went wrong while loading opposite accounts.",
        );
      } finally {
        setOppLoading(false);
      }
    };

    fetchOppAccounts();
  }, [isOpen]);

  // ✅ NEW — work order fetch (BOM mode selected hone par)
  useEffect(() => {
    if (!isOpen) return;
     if (receiptMode !== "workorder") return;
    if (workOrderOptions.length > 0) return; // already loaded, dobara call na ho

    const fetchWorkOrders = async () => {
      setWorkOrderLoading(true);
      try {
        const res = await workOrderApi.list();
        if (res.data?.success) {
          const mapped: AccountListItem[] = (res.data.data || []).map(
            (item: any) => ({
              id: String(item.id),
              label: item.workOrderNo || item.number || "", // ⚠️ API response field name check kar lena
            }),
          );
          setWorkOrderOptions(mapped);
        } else {
          setWorkOrderOptions([]);
          toasterrormsg(res.data?.message || "Failed to load work orders.");
        }
      } catch (err: any) {
        setWorkOrderOptions([]);
        toasterrormsg(
          err?.response?.data?.message ||
            "Something went wrong while loading work orders.",
        );
      } finally {
        setWorkOrderLoading(false);
      }
    };

    fetchWorkOrders();
  }, [isOpen, receiptMode]);

  const handleClose = () => {
    reset();
    close();
  };

  // ✅ CHANGED — ab real API call hoga
  const onSubmit = async (data: FormBankReceipt) => {
    if (data.receiptMode === "workorder") {
      toasterrormsg("work order bank receipt is not available yet.");
      return;
    }

    try {
      setSubmitting(true);
      const financialYearId = localStorage.getItem("financialYearId");
      const companyId = localStorage.getItem("companyId");

      const res = await paymentApi.create({
        bankAccountId: Number(data.bankAccount),
        voucherNo: data.voucherNo,
        date: data.date,
        oppAccountId: Number(data.oppAccount),
        amount: Number(data.amount),
        transactionMode: data.transactionMode?.toUpperCase(),
        chequeNo:
          data.transactionMode === "cheque" ? data.chequeNumber : undefined,
        chequeDate:
          data.transactionMode === "cheque" ? data.chequeDate : undefined,
        chequeClearDate:
          data.transactionMode === "cheque" ? data.chequeClearDate : undefined,
        narration: data.narration || "",
        financialYearId: financialYearId ? Number(financialYearId) : undefined,
        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",
      });

      if (res?.data?.status === 400 || res?.data?.success === false) {
        toasterrormsg(res?.data?.message || "Something went wrong.");
        return;
      }

      toastsuccessmsg(res?.data?.message || "Bank receipt saved successfully");
      onSaved();
      handleClose();
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full transform-gpu flex-col bg-white transition-transform duration-200 lg:max-w-[50%]"
        >
          {/* Header */}
          <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-white">
              {isEdit ? "Edit Bank Receipt" : "Add Bank Receipt"}
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {/* Receipt Mode Radio */}
              <Controller
                control={control}
                name="receiptMode"
                defaultValue="manual"
                render={({ field }) => (
                  <div className="flex items-center gap-6 py-2">
                    <label className="dark:text-dark-100 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                      <Radio
                        checked={field.value === "manual"}
                        onChange={() => field.onChange("manual")}
                      />
                      Manual
                    </label>

                    <label className="dark:text-dark-100 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                      <Radio
                        checked={field.value === "workorder"}
                        onChange={() => field.onChange("workorder")}
                      />
                      Work Order
                    </label>
                  </div>
                )}
              />

              {/* Work Order No — only shown when Work Order is selected */}
              {receiptMode === "workorder" && (
                <Controller
                  control={control}
                  name="workOrderNo"
                  rules={{ required: "Work Order No is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      data={workOrderOptions}
                      displayField="label"
                      value={value}
                      onChange={onChange}
                      placeholder={
                        workOrderLoading
                          ? "Loading..."
                          : "Select Work Order No."
                      }
                      label="Work Order No."
                      searchFields={["label"]}
                      error={errors.workOrderNo?.message}
                    />
                  )}
                />
              )}

              {/* Bank Account / Voucher No / Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  control={control}
                  name="bankAccount"
                  rules={{ required: "Bank account is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={bankAccountOptions}
                      value={
                        bankAccountOptions.find((item) => item.id === value) ||
                        null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Bank Account"
                      placeholder={
                        bankLoading ? "Loading..." : "Select Bank Account"
                      }
                      displayField="label"
                      error={errors.bankAccount?.message}
                      disabled={bankLoading}
                      {...rest}
                    />
                  )}
                />

                <Input
                  {...register("voucherNo", {
                    required: "Voucher no is required",
                  })}
                  label="Voucher No."
                  placeholder={voucherLoading ? "Loading..." : "Auto generated"}
                  readOnly
                  error={errors.voucherNo?.message}
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
                        const mm = String(picked.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const dd = String(picked.getDate()).padStart(2, "0");
                        onChange(`${yyyy}-${mm}-${dd}`);
                      }}
                      options={{
                        disable: [
                          function (date) {
                            return date.getDay() === 0 || date.getDay() === 6;
                          },
                        ],
                        locale: {
                          firstDayOfWeek: 1,
                        },
                      }}
                      placeholder="Choose date..."
                      error={errors.date?.message}
                    />
                  )}
                />
              </div>

              {/* Divider */}
              <div className="border-primary my-8 border-t-3 border-dotted" />

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
                        value={oppAccountOptions.find(
                          (item) => item.id === value,
                        )}
                        onChange={(item: AccountOption) => onChange(item.id)}
                        label="Opp. Account"
                        placeholder={
                          oppLoading ? "Loading..." : "Select Opp. Account"
                        }
                        error={errors.oppAccount?.message}
                      />
                    )}
                  />
                </div>

                <Input
                  {...register("amount", {
                    required: "Amount is required",
                  })}
                  label="Amount"
                  placeholder="Amount"
                  type="number"
                  error={errors.amount?.message}
                />
              </div>

              {/* Transaction Mode Radio */}
              <Controller
                control={control}
                name="transactionMode"
                defaultValue="upi"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="dark:text-dark-100 block text-sm font-semibold text-gray-700">
                      Mode:
                    </label>
                    <div className="flex flex-wrap items-center gap-6">
                      {["neft", "rtgs", "imps", "cheque", "upi"].map((mode) => (
                        <label
                          key={mode}
                          className="dark:text-dark-100 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 uppercase"
                        >
                          <Radio
                            checked={field.value === mode}
                            onChange={() => field.onChange(mode)}
                          />
                          {mode}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              />

              {/* Cheque Fields — only shown when Cheque mode is selected */}
              {/* Cheque Fields — only shown when Cheque mode is selected */}
              {transactionMode === "cheque" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input
                    {...register("chequeNumber", {
                      required: "Cheque number is required",
                    })}
                    label="Cheque Number"
                    placeholder="Enter cheque number"
                    error={errors.chequeNumber?.message}
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
                          if (!picked) return onChange("");
                          const yyyy = picked.getFullYear();
                          const mm = String(picked.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const dd = String(picked.getDate()).padStart(2, "0");
                          onChange(`${yyyy}-${mm}-${dd}`);
                        }}
                        options={{
                          disable: [
                            function (date) {
                              return date.getDay() === 0 || date.getDay() === 6;
                            },
                          ],
                          locale: {
                            firstDayOfWeek: 1,
                          },
                        }}
                        placeholder="Choose date..."
                        error={errors.chequeDate?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="chequeClearDate"
                    rules={{ required: "Cheque clear date is required" }}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        label="Cheque Clear Date"
                        value={value}
                        onChange={(dates: Date[]) => {
                          const picked = dates?.[0];
                          if (!picked) return onChange("");
                          const yyyy = picked.getFullYear();
                          const mm = String(picked.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const dd = String(picked.getDate()).padStart(2, "0");
                          onChange(`${yyyy}-${mm}-${dd}`);
                        }}
                        options={{
                          disable: [
                            function (date) {
                              return date.getDay() === 0 || date.getDay() === 6;
                            },
                          ],
                          locale: {
                            firstDayOfWeek: 1,
                          },
                        }}
                        placeholder="Choose date..."
                        error={errors.chequeClearDate?.message}
                      />
                    )}
                  />
                </div>
              )}

              {/* Narration */}
              <Textarea
                {...register("narration")}
                rows={5}
                label="Narration"
                placeholder="Enter Narration"
                error={errors.narration?.message}
              />
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : isEdit
                    ? "Update Bank Receipt"
                    : "Add Bank Receipt"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
