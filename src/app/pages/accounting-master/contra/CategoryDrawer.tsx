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
import { Button, Input, Radio, Textarea } from "@/components/ui";
import { Contra } from "../shared/types";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { AccountListbox, AccountOption } from "@/components/shared/form/AccountListbox";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";

interface ContraDrawerProps {
  isOpen: boolean;
  close: () => void;
  contra: Contra | null;
  onSaved: () => void; // ✅ CHANGED — ab list refresh trigger karega, object return nahi
}

interface AccountListItem {
  id: string;
  label: string;
}

// ✅ NEW — payment API helpers
const paymentApi = {
  nextVoucherNo: (financialYearId: string) =>
    Get("payment/next-voucher-no", { financialYearId, voucherType: "CONTRA" }, false),
  create: (payload: Record<string, any>) => Post("payment/contra/create", payload, false),
};

export function ContraDrawer({
  isOpen,
  close,
  contra,
  onSaved,
}: ContraDrawerProps) {
  const isEdit = Boolean(contra?.id);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Contra>({
    defaultValues: {
      type: "deposit",
    },
    values: contra || undefined,
  });

  const currentType = watch("type");
  const selectedAccount = watch("account");

  const [accountOptions, setAccountOptions] = useState<AccountListItem[]>([]);
  const [accountLoading, setAccountLoading] = useState(false);

  const [oppAccountOptions, setOppAccountOptions] = useState<AccountOption[]>([]);
  const [oppLoading, setOppLoading] = useState(false);

  const [voucherLoading, setVoucherLoading] = useState(false);

  const getAccountLabel = () => {
    switch (currentType) {
      case "deposit":
        return "Cash Account";
      case "withdrawal":
        return "Bank Account";
      case "transfer":
        return "Bank Account (From)";
      default:
        return "Cash/Bank Account";
    }
  };

  const getOppAccountLabel = () => {
    switch (currentType) {
      case "deposit":
        return "Opp. Bank Account";
      case "withdrawal":
        return "Opp. Cash Account";
      case "transfer":
        return "Bank Account (To)";
      default:
        return "Opp. Account";
    }
  };

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

  useEffect(() => {
    if (!isOpen) return;

    const fetchAccounts = async () => {
      setAccountLoading(true);
      try {
        const endpoint =
          currentType === "deposit"
            ? "master/account/cash/list"
            : "master/account/bank/list";

        const res = await Get(endpoint, {}, false);
        if (res.data?.success) {
          const mapped: AccountListItem[] = (res.data.data || []).map(
            (item: any) => ({
              id: String(item.id),
              label: item.accountName || item.name || item.label || "",
            }),
          );
          setAccountOptions(mapped);
        } else {
          setAccountOptions([]);
          toasterrormsg(res.data?.message || "Failed to load accounts.");
        }
      } catch (err: any) {
        setAccountOptions([]);
        toasterrormsg(
          err?.response?.data?.message ||
            "Something went wrong while loading accounts.",
        );
      } finally {
        setAccountLoading(false);
      }
    };

    fetchAccounts();
    if (!isEdit) {
      setValue("account", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOppAccounts = async () => {
      setOppLoading(true);
      try {
        const endpoint =
          currentType === "withdrawal"
            ? "master/account/cash/list"
            : "master/account/bank/list";

        const res = await Get(endpoint, {}, false);
        if (res.data?.success) {
          const mapped: AccountOption[] = (res.data.data || []).map(
            (item: any) => ({
              id: String(item.id),
              name: item.accountName || item.name || "",
              number: item.mobileNo || item.mobile || "",
              balance: Number(item.openingBalance ?? item.currentBalance ?? 0),
            }),
          );
          setOppAccountOptions(mapped);
        } else {
          setOppAccountOptions([]);
          toasterrormsg(res.data?.message || "Failed to load opposite accounts.");
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
    if (!isEdit) {
      setValue("oppAccount", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentType, isOpen]);

  const filteredOppAccountOptions =
    currentType === "transfer" && selectedAccount
      ? oppAccountOptions.filter((item) => item.id !== selectedAccount)
      : oppAccountOptions;

  const handleClose = () => {
    reset();
    close();
  };

  // ✅ CHANGED — ab real API call hoga, local state manage nahi
  const onSubmit = async (data: Contra) => {
    try {
      setSubmitting(true);
      const financialYearId = localStorage.getItem("financialYearId");
      const companyId = localStorage.getItem("companyId");

      const res = await paymentApi.create({
        type: data.type,
        accountId: Number(data.account),
        voucherNo: data.voucherNo,
        date: data.date,
        oppAccountId: Number(data.oppAccount),
        amount: Number(data.amount),
        narration: data.narration || "",
        financialYearId: financialYearId ? Number(financialYearId) : undefined,
        createdBy: companyId ? Number(companyId) : undefined,
        createdType: "Super Admin",
      });

      if (res?.data?.status === 400 || res?.data?.success === false) {
        toasterrormsg(res?.data?.message || "Something went wrong.");
        return;
      }

      toastsuccessmsg(res?.data?.message || "Contra saved successfully");
      onSaved();
      handleClose();
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message || "Something went wrong. Please try again.",
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-[50%] transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary-600">
            <h3 className="text-lg font-semibold text-white">
              {isEdit ? "Edit Contra" : "Add Contra"}
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

              <Controller
                control={control}
                name="type"
                defaultValue="deposit"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-dark-100">
                      Type:
                    </label>
                    <div className="flex flex-wrap items-center gap-6 py-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                        <Radio
                          checked={field.value === "deposit"}
                          onChange={() => field.onChange("deposit")}
                        />
                        Cash Deposit
                      </label>

                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                        <Radio
                          checked={field.value === "withdrawal"}
                          onChange={() => field.onChange("withdrawal")}
                        />
                        Cash Withdrawal
                      </label>

                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                        <Radio
                          checked={field.value === "transfer"}
                          onChange={() => field.onChange("transfer")}
                        />
                        Bank Transfer
                      </label>
                    </div>
                  </div>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  control={control}
                  name="account"
                  rules={{ required: "Account is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={accountOptions}
                      value={
                        accountOptions.find((item) => item.id === value) || null
                      }
                      onChange={(item) => onChange(item.id)}
                      label={getAccountLabel()}
                      placeholder={accountLoading ? "Loading..." : "Select"}
                      displayField="label"
                      error={errors.account?.message}
                      disabled={accountLoading}
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
                        const mm = String(picked.getMonth() + 1).padStart(2, "0");
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

              <div className="border-t-3 border-dotted border-primary my-8" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Controller
                    control={control}
                    name="oppAccount"
                    rules={{ required: "Opp account is required" }}
                    render={({ field: { value, onChange } }) => (
                      <AccountListbox
                        data={filteredOppAccountOptions}
                        value={filteredOppAccountOptions.find((item) => item.id === value)}
                        onChange={(item: AccountOption) => onChange(item.id)}
                        label={getOppAccountLabel()}
                        placeholder={oppLoading ? "Loading..." : "Select Account"}
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

              <Textarea
                {...register("narration")}
                rows={5}
                label="Narration"
                placeholder="Enter Narration"
                error={errors.narration?.message}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : isEdit ? "Update Contra" : "Add Contra"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}