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
import { CashReceipt } from "../shared/types";
import { DatePicker } from "@/components/shared/form/Datepicker";
import {
  AccountListbox,
  AccountOption,
} from "@/components/shared/form/AccountListbox";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

// ✅ CHANGED — workorder hata diya, salesinvoice add kiya
type FormCashReceipt = Omit<CashReceipt, "receiptMode"> & {
  receiptMode: "manual" | "salesorder" | "salesinvoice";
  salesOrderNo?: any[];
  salesInvoiceNo?: any[];
};

interface CashReceiptDrawerProps {
  isOpen: boolean;
  close: () => void;
  cashReceipt: CashReceipt | null;
  onSaved: () => void;
}

interface AccountListItem {
  id: string;
  label: string;
}

// pending Sales Invoice / Sales Order option
interface PendingDocOption extends AccountListItem {
  accountId: string;
  pendingAmount: number;
}

// Sales order API helper
// invoice bana hua SO nahi aata + pending advance (totalAmount − mile advances) aata hai
const salesOrderApi = {
  list: (financialYearId: string) =>
    Get("salesorder/pending-advance-list", { financialYearId }, false),
};

// ✅ NEW — sales invoice API helper
// sirf Credit terms + pending amount > 0 wale invoices aate hain
const salesInvoiceApi = {
  list: (financialYearId: string) =>
    Get("sales/pending-credit-list", { financialYearId }, false),
};

// Payment API helpers
const paymentApi = {
  nextVoucherNo: (financialYearId: string) =>
    Get(
      "payment/next-voucher-no",
      { financialYearId, voucherType: "CASH RECEIPT" },
      false,
    ),
  create: (payload: Record<string, any>) =>
    Post("payment/cash-receipt/create", payload, false),
};

export function CashReceiptDrawer({
  isOpen,
  close,
  cashReceipt,
  onSaved,
}: CashReceiptDrawerProps) {
  const isEdit = Boolean(cashReceipt?.id);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormCashReceipt>({
    defaultValues: {
      receiptMode: "manual",
      salesOrderNo: [],
      salesInvoiceNo: [],
    },
    values: (cashReceipt as unknown as FormCashReceipt) || undefined,
  });

  const receiptMode = watch("receiptMode");

  const [cashAccountOptions, setCashAccountOptions] = useState<
    AccountListItem[]
  >([]);
  const [cashLoading, setCashLoading] = useState(false);

  const [oppAccountOptions, setOppAccountOptions] = useState<AccountOption[]>(
    [],
  );
  const [oppLoading, setOppLoading] = useState(false);

  const [voucherLoading, setVoucherLoading] = useState(false);

  // Sales Order options
  const [salesOrderOptions, setSalesOrderOptions] = useState<
    PendingDocOption[]
  >([]);
  const [salesOrderLoading, setSalesOrderLoading] = useState(false);

  // ✅ NEW — Sales Invoice options
  const [salesInvoiceOptions, setSalesInvoiceOptions] = useState<
    PendingDocOption[]
  >([]);
  const [salesInvoiceLoading, setSalesInvoiceLoading] = useState(false);
// selected Invoice / Sales Order ka pending amount (sirf display + max limit ke liye)
const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  // Drawer open hote hi current date + voucher no set (naya add karte waqt)
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) return;

    const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  setValue("date", today, { shouldValidate: true });
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

  // Sales Order list — sirf jab "Sales Order" mode select ho
  useEffect(() => {
    if (!isOpen) return;
    if (receiptMode !== "salesorder") return;
    if (salesOrderOptions.length > 0) return; // already loaded, dobara call na ho

    const fetchSalesOrders = async () => {
      setSalesOrderLoading(true);
      try {
        const financialYearId = localStorage.getItem("financialYearId") || "";
        const res = await salesOrderApi.list(financialYearId);
        if (res.data?.success) {
          const mapped: PendingDocOption[] = (res.data.data || []).map(
            (item: any) => ({
              id: String(item.id),
              label: item.soNo || "",
              accountId: String(item.accountId ?? ""),
              pendingAmount: Number(item.pendingAmount ?? 0),
            }),
          );
          setSalesOrderOptions(mapped);
        } else {
          setSalesOrderOptions([]);
          toasterrormsg(res.data?.message || "Failed to load sales orders.");
        }
      } catch (err: any) {
        setSalesOrderOptions([]);
        toasterrormsg(
          err?.response?.data?.message ||
            "Something went wrong while loading sales orders.",
        );
      } finally {
        setSalesOrderLoading(false);
      }
    };

    fetchSalesOrders();
  }, [isOpen, receiptMode]);

  // ✅ NEW — Sales Invoice list — sirf jab "Sales Invoice" mode select ho
  useEffect(() => {
    if (!isOpen) return;
    if (receiptMode !== "salesinvoice") return;
    if (salesInvoiceOptions.length > 0) return; // already loaded, dobara call na ho

    const fetchSalesInvoices = async () => {
      setSalesInvoiceLoading(true);
      try {
        const financialYearId = localStorage.getItem("financialYearId") || "";
        const res = await salesInvoiceApi.list(financialYearId);
        if (res.data?.success) {
        const mapped: PendingDocOption[] = (res.data.data || []).map(
  (item: any) => ({
    id: String(item.id),
    // ✅ Invoice No + (SO No) — SO na ho to sirf invoice no
   label: item.salesOrderNo
  ? `${item.salesInvoiceNo}  |  SO: (${item.salesOrderNo})`
  : item.salesInvoiceNo || "",
    accountId: String(item.accountId ?? ""),
    pendingAmount: Number(item.pendingAmount ?? 0),
  }),
);
          setSalesInvoiceOptions(mapped);
        } else {
          setSalesInvoiceOptions([]);
          toasterrormsg(res.data?.message || "Failed to load sales invoices.");
        }
      } catch (err: any) {
        setSalesInvoiceOptions([]);
        toasterrormsg(
          err?.response?.data?.message ||
            "Something went wrong while loading sales invoices.",
        );
      } finally {
        setSalesInvoiceLoading(false);
      }
    };

    fetchSalesInvoices();
  }, [isOpen, receiptMode]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCashAccounts = async () => {
      setCashLoading(true);
      try {
        const res = await Get("master/account/cash/list", {}, false);
        if (res.data?.success) {
          const mapped: AccountListItem[] = (res.data.data || []).map(
            (item: any) => ({
              id: String(item.id),
              label: item.accountName || "",
            }),
          );
          setCashAccountOptions(mapped);
        } else {
          setCashAccountOptions([]);
          toasterrormsg(res.data?.message || "Failed to load cash accounts.");
        }
      } catch (err: any) {
        setCashAccountOptions([]);
        toasterrormsg(
          err?.response?.data?.message ||
            "Something went wrong while loading cash accounts.",
        );
      } finally {
        setCashLoading(false);
      }
    };

    fetchCashAccounts();
  }, [isOpen]);

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

  // ✅ NEW — invoice select hone par Opp. Account + Amount auto-fill
  const handleDocSelect = (
  value: any,
  onChange: (v: any) => void,
  options: PendingDocOption[],
) => {
  onChange(value);
  const picked = Array.isArray(value) ? value[0] : value;
  const pickedId = String(picked?.id ?? picked ?? "");
  const doc = options.find((o) => o.id === pickedId);
  if (!doc) return;
  setValue("oppAccount", doc.accountId as any);
  setValue("amount", "" as any);          // ✅ user khud enter karega
  setPendingAmount(doc.pendingAmount);    // ✅ label ke right me dikhega
};
useEffect(() => {
  setPendingAmount(null);
  setValue("amount", "" as any);
}, [receiptMode]);
  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = async (data: FormCashReceipt) => {
    // ✅ salesorder mode — advance receipt (salesOrderId ke saath)
    let salesOrderId: number | undefined;
    if (data.receiptMode === "salesorder") {
      const picked: any = Array.isArray(data.salesOrderNo)
        ? data.salesOrderNo[0]
        : data.salesOrderNo;
      salesOrderId = Number(picked?.id ?? picked) || undefined;
      if (!salesOrderId) {
        toasterrormsg("Please select a Sales Order.");
        return;
      }
      const so = salesOrderOptions.find((o) => o.id === String(salesOrderId));
      if (so && Number(data.amount) > so.pendingAmount) {
        toasterrormsg(
          `Advance cannot exceed pending amount (${so.pendingAmount}).`,
        );
        return;
      }
    }

    // ✅ salesinvoice mode ab real save hoga (salesId ke saath)
    let salesId: number | undefined;
    if (data.receiptMode === "salesinvoice") {
      const picked: any = Array.isArray(data.salesInvoiceNo)
        ? data.salesInvoiceNo[0]
        : data.salesInvoiceNo;
      salesId = Number(picked?.id ?? picked) || undefined;
      if (!salesId) {
        toasterrormsg("Please select a Sales Invoice.");
        return;
      }
      const inv = salesInvoiceOptions.find((o) => o.id === String(salesId));
      if (inv && Number(data.amount) > inv.pendingAmount) {
        toasterrormsg(
          `Amount cannot exceed pending amount (${inv.pendingAmount}).`,
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      const financialYearId = localStorage.getItem("financialYearId");
      const companyId = localStorage.getItem("companyId");

      const res = await paymentApi.create({
        cashAccountId: Number(data.cashAccount),
        voucherNo: data.voucherNo,
        date: data.date,
        oppAccountId: Number(data.oppAccount),
        amount: Number(data.amount),
        narration: data.narration || "",
        salesId, // invoice se link (manual me undefined)
        salesOrderId, // ✅ NEW — SO advance link
        financialYearId: financialYearId ? Number(financialYearId) : undefined,
        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",
      });

      if (res?.data?.status === 400 || res?.data?.success === false) {
        toasterrormsg(res?.data?.message || "Something went wrong.");
        return;
      }

      toastsuccessmsg(res?.data?.message || "Cash receipt saved successfully");
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
              {isEdit ? "Edit Cash Receipt" : "Add Cash Receipt"}
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
                        checked={field.value === "salesorder"}
                        onChange={() => field.onChange("salesorder")}
                      />
                      Sales Order
                    </label>

                    {/* ✅ NEW — Sales Invoice */}
                    <label className="dark:text-dark-100 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                      <Radio
                        checked={field.value === "salesinvoice"}
                        onChange={() => field.onChange("salesinvoice")}
                      />
                      Sales Invoice
                    </label>
                  </div>
                )}
              />

              {/* Sales Order No — only shown when Sales Order is selected */}
              {receiptMode === "salesorder" && (
                <Controller
                  control={control}
                  name="salesOrderNo"
                  rules={{ required: "Sales Order No is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      data={salesOrderOptions}
                      displayField="label"
                      value={value}
                      onChange={(v: any) =>
                        handleDocSelect(v, onChange, salesOrderOptions)
                      }
                      placeholder={
                        salesOrderLoading
                          ? "Loading..."
                          : "Select Sales Order No."
                      }
                      label="Sales Order No."
                      searchFields={["label"]}
                      error={errors.salesOrderNo?.message}
                    />
                  )}
                />
              )}

              {/* ✅ NEW — Sales Invoice No — only shown when Sales Invoice is selected */}
              {receiptMode === "salesinvoice" && (
                <Controller
                  control={control}
                  name="salesInvoiceNo"
                  rules={{ required: "Sales Invoice No is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      data={salesInvoiceOptions}
                      displayField="label"
                      value={value}
                      onChange={(v: any) =>
                        handleDocSelect(v, onChange, salesInvoiceOptions)
                      }
                      placeholder={
                        salesInvoiceLoading
                          ? "Loading..."
                          : "Select Sales Invoice No."
                      }
                      label="Sales Invoice No."
                      searchFields={["label"]}
                      error={errors.salesInvoiceNo?.message}
                    />
                  )}
                />
              )}

              {/* Cash Account / Voucher No / Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  control={control}
                  name="cashAccount"
                  rules={{ required: "Cash account is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={cashAccountOptions}
                      value={
                        cashAccountOptions.find((item) => item.id === value) ||
                        null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Cash Account"
                      placeholder={
                        cashLoading ? "Loading..." : "Select Cash Account"
                      }
                      displayField="label"
                      error={errors.cashAccount?.message}
                      disabled={cashLoading}
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
<div>
  {/* Label row: left me "Amount", right me pending amount */}
  <div className="mb-1 flex items-center justify-between">
    <span className="dark:text-dark-100 text-sm font-medium text-gray-800">
      Amount
    </span>
    {pendingAmount !== null && (
      <span className="text-xs font-medium text-red-600">
        Pending: ₹
        {pendingAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    )}
  </div>

  <Input
    {...register("amount", {
      required: "Amount is required",
      validate: (v) =>
        pendingAmount === null ||
        Number(v) <= pendingAmount ||
        `Amount cannot exceed ₹${pendingAmount}`,
    })}
    placeholder="Enter amount"
    type="number"
    error={errors.amount?.message}
  />
</div>
              </div>

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
                    ? "Update Cash Receipt"
                    : "Add Cash Receipt"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}