import { XMarkIcon } from "@heroicons/react/24/solid";

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
        className={`fixed inset-0 z-40 bg-gray-900/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      {/* Right Side Drawer */}
      <div
        className={`dark:bg-dark-750 fixed inset-y-0 right-0 z-40 flex w-full max-w-4xl transform flex-col bg-white text-gray-900 shadow-xl transition-transform duration-300 ease-in-out dark:text-gray-100 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="dark:border-dark-600 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            Indent Details – {indent.indentNo || "-"}
          </h2>
          <button
            type="button"
            onClick={close}
            className="hover:text-primary-600 dark:text-muted-foreground dark:hover:bg-dark-600 cursor-pointer rounded-md p-2 text-white hover:bg-white"
            aria-label="Close"
          >
            <XMarkIcon className="size-5 dark:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary Info */}
          <div className="mb-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <span className="dark:text-muted-foreground text-gray-500">
                Work Order ID:
              </span>{" "}
              <strong>{indent.workOrderNo || indent.workOrderId || "-"}</strong>
            </div>
            <div>
              <span className="dark:text-muted-foreground text-gray-500">
                Model Name:
              </span>{" "}
              <strong>{indent.modelName || "-"}</strong>
            </div>
            <div>
              <span className="dark:text-muted-foreground text-gray-500">
                Date:
              </span>{" "}
              <strong>{formatDate(indent.date)}</strong>
            </div>
          </div>

          {/* Items Table */}
          <div className="dark:border-dark-600 overflow-hidden rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="dark:bg-dark-700 bg-gray-50 whitespace-nowrap">
                <tr className="dark:border-dark-600 border-b border-gray-200 text-left">
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
                      className="dark:text-muted-foreground h-24 text-center text-gray-500"
                    >
                      No items found
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id || index}
                      className="dark:border-dark-600 border-b border-gray-200 last:border-0"
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
