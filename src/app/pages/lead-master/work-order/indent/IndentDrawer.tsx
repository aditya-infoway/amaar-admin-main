
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

function formatDate(date?: string) {
  if (!date) return "-";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString();
}

export default function IndentDrawer({ isOpen, close, indent }: Props) {
  if (!isOpen || !indent) return null;

  const items = indent.items || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center  p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="indent-drawer-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="indent-drawer-title" className="text-lg font-semibold">
            Indent Details – {indent.indentNo || "-"}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
           <XMarkIcon className="size-4.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="text-muted-foreground">Work Order ID:</span>{" "}
            <strong>{indent.workOrderNo || indent.workOrderId || "-"}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Model Name:</span>{" "}
            <strong>{indent.modelName || "-"}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>{" "}
            <strong>{formatDate(indent.date)}</strong>
          </div>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
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
                  <td colSpan={7} className="h-24 text-center">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id || index}>
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
  );
}