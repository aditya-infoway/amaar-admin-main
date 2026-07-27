import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Fragment, useEffect, useState } from "react";

import { Button, Select } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";

interface LedgerReportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: { fromDate: string; toDate: string; displayType: string }) => void;
}

const DISPLAY_TYPE_OPTIONS = [
  { value: "", label: "Select Display Type" },
  { value: "1", label: "Type 1" },
  { value: "2", label: "Type 2" },
  { value: "3", label: "Type 3" },
];

// Current financial year: 01-04 se aaj tak (April se pehle ke months me pichle saal ka April)
function getDefaultFYDates() {
  const today = new Date();
  const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  const fromDate = `${fyStartYear}-04-01`;
  const toDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  return { fromDate, toDate };
}

const toDateInputValue = (dates: Date[]) => {
  const picked = dates?.[0];
  if (!picked) return "";
  const yyyy = picked.getFullYear();
  const mm = String(picked.getMonth() + 1).padStart(2, "0");
  const dd = String(picked.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export function LedgerReportModal({ open, onClose, onConfirm }: LedgerReportModalProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [displayType, setDisplayType] = useState("");

  useEffect(() => {
    if (open) {
      const defaults = getDefaultFYDates();
      setFromDate(defaults.fromDate);
      setToDate(defaults.toDate);
      setDisplayType("");
    }
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm({ fromDate, toDate, displayType });
  };

  return (
    <Transition appear show={open} as={Fragment}>
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full transform-gpu flex-col bg-white transition-transform duration-200 sm:max-w-md lg:max-w-lg"
        >
          <div className="flex items-center justify-between border-b border-gray-200 bg-primary px-4 py-4 dark:border-dark-500 sm:px-5">
            <h3 className="text-lg font-semibold text-white">Ledger Report</h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full text-white">
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(dates: Date[]) => setFromDate(toDateInputValue(dates))}
              placeholder="Choose date..."
            />

            <DatePicker
              label="To Date"
              value={toDate}
              onChange={(dates: Date[]) => setToDate(toDateInputValue(dates))}
              placeholder="Choose date..."
            />

            <Select
              label="Display Type"
              value={displayType}
              onChange={(e) => setDisplayType(e.target.value)}
            >
              {DISPLAY_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
            <Button type="button" onClick={handleClose}>Cancel</Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              OK
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}