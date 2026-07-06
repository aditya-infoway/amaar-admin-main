import { Fragment } from "react";
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
import { bankAccountOptions, oppAccountOptions } from "./data";
import { BankReceipt } from "../shared/types";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { AccountListbox, AccountOption } from "@/components/shared/form/AccountListbox";

// 1. Create a safe local structural type matching the dynamic states of this specific form
type FormBankReceipt = Omit<BankReceipt, "receiptMode"> & {
  receiptMode: "manual" | "bom";
  transactionMode?: string;
  bomNo?: any[];
  chequeNumber?: string;
};

interface BankReceiptDrawerProps {
  isOpen: boolean;
  close: () => void;
  bankReceipt: BankReceipt | null;
  onSave: (bankReceipt: BankReceipt) => void;
}

const bomOptions = [
  { id: "bom-1", label: "BOM/26-27/001" },
  { id: "bom-2", label: "BOM/26-27/002" },
  { id: "bom-3", label: "BOM/26-27/003" },
  { id: "bom-4", label: "BOM/26-27/004" },
  { id: "bom-5", label: "BOM/26-27/005" },
];

export function BankReceiptDrawer({
  isOpen,
  close,
  bankReceipt,
  onSave,
}: BankReceiptDrawerProps) {
  const isEdit = Boolean(bankReceipt?.id);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormBankReceipt>({
    defaultValues: {
      receiptMode: "manual",
      transactionMode: "neft",
      bomNo: [],
    },
    values: (bankReceipt as unknown as FormBankReceipt) || undefined,
  });

  const receiptMode = watch("receiptMode");
  const transactionMode = watch("transactionMode");

  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = (data: FormBankReceipt) => {
    onSave({
      ...data,
      id: bankReceipt?.id || crypto.randomUUID(),
      createdAt: bankReceipt?.createdAt || new Date().toISOString(),
    } as unknown as BankReceipt);
    handleClose();
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
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                      <Radio
                        checked={field.value === "manual"}
                        onChange={() => field.onChange("manual")}
                      />
                      Manual
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                      <Radio
                        checked={field.value === "bom"}
                        onChange={() => field.onChange("bom")}
                      />
                      BOM - Cancel
                    </label>
                  </div>
                )}
              />

              {/* BOM No — only shown when BOM is selected */}
              {receiptMode === "bom" && (
                <Controller
                  control={control}
                  name="bomNo"
                  rules={{ required: "BOM No is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      data={bomOptions}
                      displayField="label"
                      value={value}
                      onChange={onChange}
                      placeholder="Select BOM No."
                      label="BOM No."
                      searchFields={["label"]}
                      error={errors.bomNo?.message}
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
                        bankAccountOptions.find((item) => item.id === value) || null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Bank Account"
                      placeholder="Select"
                      displayField="label"
                      error={errors.bankAccount?.message}
                      {...rest}
                    />
                  )}
                />

                <Input
                  {...register("voucherNo", {
                    required: "Voucher no is required",
                  })}
                  label="Voucher No."
                  placeholder="Voucher No."
                  error={errors.voucherNo?.message}
                />

                <DatePicker
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
                  label="Date"
                />
              </div>

              {/* Divider */}
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
                defaultValue="neft"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-dark-100">
                      Mode:
                    </label>
                    <div className="flex flex-wrap items-center gap-6">
                      {["neft", "rtgs", "imps", "cheque", "upi"].map((mode) => (
                        <label
                          key={mode}
                          className="flex cursor-pointer items-center gap-2 text-sm font-medium uppercase text-gray-700 dark:text-dark-100"
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

                  <DatePicker
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
                    label="Cheque Date"
                  />

                  <DatePicker
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
                    label="Cheque Clear Date"
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
            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isEdit ? "Update Bank Receipt" : "Add Bank Receipt"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}