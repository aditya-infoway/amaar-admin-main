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
import { Button, Input, Radio, Textarea } from "@/components/ui";
import { accountOptions } from "./data";
import { JournalEntry } from "../shared/types";
import { DatePicker } from "@/components/shared/form/Datepicker";

interface JournalEntryDrawerProps {
  isOpen: boolean;
  close: () => void;
  journalEntry: JournalEntry | null;
  onSave: (journalEntry: JournalEntry) => void;
}

export function JournalEntryDrawer({
  isOpen,
  close,
  journalEntry,
  onSave,
}: JournalEntryDrawerProps) {
  const isEdit = Boolean(journalEntry?.id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<JournalEntry>({
    defaultValues: {
      type: "general",
    },
    values: journalEntry || undefined,
  });

  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = (data: JournalEntry) => {
    onSave({
      ...data,
      id: journalEntry?.id || crypto.randomUUID(),
      createdAt: journalEntry?.createdAt || new Date().toISOString(),
    });
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
              {isEdit ? "Edit Journal Entry" : "Add Journal Entry"}
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

              {/* Type Radio */}
              <Controller
                control={control}
                name="type"
                defaultValue="general"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-dark-100">
                      Type:
                    </label>
                    <div className="flex flex-wrap items-center gap-6 py-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                        <Radio
                          checked={field.value === "general"}
                          onChange={() => field.onChange("general")}
                        />
                        General
                      </label>

                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                        <Radio
                          checked={field.value === "adjustment"}
                          onChange={() => field.onChange("adjustment")}
                        />
                        Adjustment
                      </label>

                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                        <Radio
                          checked={field.value === "rectification"}
                          onChange={() => field.onChange("rectification")}
                        />
                        Rectification
                      </label>

                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-100">
                        <Radio
                          checked={field.value === "closing"}
                          onChange={() => field.onChange("closing")}
                        />
                        Closing
                      </label>
                    </div>
                  </div>
                )}
              />

              {/* Voucher No / Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              {/* Dr Account */}
              <Controller
                control={control}
                name="drAccount"
                rules={{ required: "Debit account is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={accountOptions}
                    value={
                      accountOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Debit (Dr.) Account"
                    placeholder="Select Account to Debit"
                    displayField="label"
                    error={errors.drAccount?.message}
                    {...rest}
                  />
                )}
              />

              {/* Cr Account */}
              <Controller
                control={control}
                name="crAccount"
                rules={{ required: "Credit account is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={accountOptions}
                    value={
                      accountOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Credit (Cr.) Account"
                    placeholder="Select Account to Credit"
                    displayField="label"
                    error={errors.crAccount?.message}
                    {...rest}
                  />
                )}
              />

              {/* Amount */}
              <Input
                {...register("amount", {
                  required: "Amount is required",
                })}
                label="Amount"
                placeholder="Amount"
                type="number"
                error={errors.amount?.message}
              />

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
              <Button

                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isEdit ? "Update Journal Entry" : "Add Journal Entry"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}