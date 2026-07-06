
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
import { cashAccountOptions, oppAccountOptions } from "./data";
import { CashReceipt } from "../shared/types";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { AccountListbox, AccountOption } from "@/components/shared/form/AccountListbox";

// 1. Create a local type to align React Hook Form with the new state fields
type FormCashReceipt = Omit<CashReceipt, "receiptMode"> & {
  receiptMode: "manual" | "bom";
  bomNo?: any[]; 
};

interface CashReceiptDrawerProps {
  isOpen: boolean;
  close: () => void;
  cashReceipt: CashReceipt | null;
  onSave: (cashReceipt: CashReceipt) => void;
}

const bomOptions = [
  { id: "bom-1", label: "BOM/26-27/001" },
  { id: "bom-2", label: "BOM/26-27/002" },
  { id: "bom-3", label: "BOM/26-27/003" },
  { id: "bom-4", label: "BOM/26-27/004" },
  { id: "bom-5", label: "BOM/26-27/005" },
];

export function CashReceiptDrawer({
  isOpen,
  close,
  cashReceipt,
  onSave,
}: CashReceiptDrawerProps) {
  const isEdit = Boolean(cashReceipt?.id);

  // 2. Pass our local extended type straight into useForm
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormCashReceipt>({
    defaultValues: {
      receiptMode: "manual",
      bomNo: [],
    },
    // Safely cast standard CashReceipt data into our local structure
    values: (cashReceipt as unknown as FormCashReceipt) || undefined,
  });

  const receiptMode = watch("receiptMode");

  const handleClose = () => {
    reset();
    close();
  };

  // 3. Cast the matching submitted form properties back to onSave expectations
  const onSubmit = (data: FormCashReceipt) => {
    onSave({
      ...data,
      id: cashReceipt?.id || crypto.randomUUID(),
      createdAt: cashReceipt?.createdAt || new Date().toISOString(),
    } as unknown as CashReceipt);
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
                        cashAccountOptions.find((item) => item.id === value) || null
                      }
                      onChange={(item) => onChange(item.id)}
                      label="Cash Account"
                      placeholder="Select Cash Account"
                      displayField="label"
                      error={errors.cashAccount?.message}
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
                {isEdit ? "Update Cash Receipt" : "Add Cash Receipt"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

