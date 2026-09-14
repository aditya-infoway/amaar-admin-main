import { XMarkIcon } from "@heroicons/react/24/solid";
import { Transition } from "@headlessui/react"; // optional – remove if you don't use headlessui

type IndentItem = {
  id?: string | number;
  itemCode?: string | number;
  itemName?: string;
  unit?: string;
  hsnCode?: string;
  tax?: number | string | null;
  requiredQty?: number | string | null;
};

type IndentData = {
  indentNo?: string | number;
  workOrderNo?: string | number;
  workOrderId?: string | number;
  modelName?: string;
  date?: string;
  items?: IndentItem[];
};

interface Props {
  isOpen: boolean;
  close: () => void;
  indent: IndentData | null;
}

const formatDate = (value?: string) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}-${month}-${year}`;
};

export default function IndentDrawer({ isOpen, close, indent }: Props) {
  if (!indent) return null;

  const items = indent.items || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 opacity-0 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      {/* Right Side Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-4xl transform flex-col bg-white text-gray-900 shadow-xl transition-transform duration-300 ease-in-out dark:bg-dark-750 dark:text-gray-100 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-600">
          <h2 className="text-lg font-semibold">
            Indent Details – {indent.indentNo || "-"}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-muted-foreground dark:hover:bg-dark-600 cursor-pointer"
            aria-label="Close"
          >
            <XMarkIcon className="size-5 dark:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary Info */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-muted-foreground">
                Work Order ID:
              </span>{" "}
              <strong>
                {indent.workOrderNo || indent.workOrderId || "-"}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 dark:text-muted-foreground">
                Model Name:
              </span>{" "}
              <strong>{indent.modelName || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-500 dark:text-muted-foreground">
                Date:
              </span>{" "}
              <strong>{formatDate(indent.date)}</strong>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-md border border-gray-200 overflow-hidden dark:border-dark-600">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 whitespace-nowrap dark:bg-dark-700">
                <tr className="border-b border-gray-200 text-left dark:border-dark-600">
                  <th className="w-12 p-3">Sr. No.</th>
                  <th className="p-3">Item Code</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">HSN Code</th>
                  <th className="p-3">Tax</th>
                  <th className="p-3 text-right">Required Qty</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="h-24 text-center text-gray-500 dark:text-muted-foreground"
                    >
                      No items found
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="border-b border-gray-200 last:border-0 dark:border-dark-600"
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">
                        {item.itemCode || "-"}
                      </td>
                      <td className="p-3">{item.itemName || "-"}</td>
                      <td className="p-3">{item.unit || "-"}</td>
                      <td className="p-3">{item.hsnCode || "-"}</td>
                      <td className="p-3">{item.tax ?? "-"}</td>
                      <td className="p-3 text-right">
                        {item.requiredQty ?? "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}