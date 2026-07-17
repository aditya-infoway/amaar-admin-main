import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { XMarkIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { Fragment, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { BarcodePreview } from "./BarcodePreview";
import { BarcodeItem } from "./data";

interface LabelSize {
  id: string;
  label: string;
  labelWidth: number; // mm
  labelHeight: number; // mm
  cols: number;
}

const LABEL_SIZES: LabelSize[] = [
  { id: "38x25-2", label: "38×25 mm (2/row)", labelWidth: 38, labelHeight: 25, cols: 2 },
  { id: "50x25-2", label: "50×25 mm (2/row)", labelWidth: 50, labelHeight: 25, cols: 2 },
  { id: "50x30-2", label: "50×30 mm (2/row)", labelWidth: 50, labelHeight: 30, cols: 2 },
  { id: "40x25-2", label: "40×25 mm (2/row)", labelWidth: 40, labelHeight: 25, cols: 2 },
  { id: "100x50-1", label: "100×50 mm (1/row)", labelWidth: 100, labelHeight: 50, cols: 1 },
  { id: "100x30-1", label: "100×30 mm (1/row)", labelWidth: 100, labelHeight: 30, cols: 1 },
  { id: "58x40-1", label: "58×40 mm (1/row)", labelWidth: 58, labelHeight: 40, cols: 1 },
];

interface PrintLabelModalProps {
  isOpen: boolean;
  close: () => void;
  items: { item: BarcodeItem; copies: number }[];
}

export function PrintLabelModal({ isOpen, close, items }: PrintLabelModalProps) {
  const [selectedSizeId, setSelectedSizeId] = useState<string>("50x25-2");
  const selectedSize = LABEL_SIZES.find((s) => s.id === selectedSizeId)!;

  const pageWidth = useMemo(
    () => selectedSize.labelWidth * selectedSize.cols + (selectedSize.cols - 1) * 2,
    [selectedSize],
  );

  const totalLabels = items.reduce((sum, i) => sum + (i.copies || 1), 0);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const labelsHtml = items
      .flatMap(({ item, copies }) =>
        Array.from({ length: copies || 1 }).map(
          () => `
            <div class="label">
              <div class="label-name">${item.itemName}</div>
              <div class="label-sub">HSN: — &nbsp; ₹${item.salesPrice} &nbsp; MRP:₹${item.mrp}</div>
              <svg class="barcode" data-value="${item.barcode}"></svg>
            </div>`,
        ),
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Labels</title>
          <style>
            @page { size: ${pageWidth}mm ${selectedSize.labelHeight}mm; margin: 0; }
            body { margin: 0; font-family: sans-serif; }
            .sheet {
              display: grid;
              grid-template-columns: repeat(${selectedSize.cols}, ${selectedSize.labelWidth}mm);
              gap: 2mm;
            }
            .label {
              width: ${selectedSize.labelWidth}mm;
              height: ${selectedSize.labelHeight}mm;
              border: 1px dashed #999;
              box-sizing: border-box;
              padding: 1mm;
              text-align: center;
              overflow: hidden;
              page-break-inside: avoid;
            }
            .label-name { font-weight: bold; font-size: 8px; }
            .label-sub { font-size: 6px; }
            svg.barcode { width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class="sheet">${labelsHtml}</div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"></script>
          <script>
            document.querySelectorAll('.barcode').forEach(function (el) {
              try {
                JsBarcode(el, el.getAttribute('data-value'), { format: 'CODE128', height: 30, width: 1.2, fontSize: 8, margin: 2 });
              } catch (e) {}
            });
            window.onload = function () {
              setTimeout(function () { window.print(); window.close(); }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
        <TransitionChild
          as="div"
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm dark:bg-black/40"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={DialogPanel}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="dark:bg-dark-700 w-full max-w-lg rounded-lg bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-dark-500">
              <h3 className="dark:text-dark-100 flex items-center gap-2 text-base font-semibold text-gray-800">
                <PrinterIcon className="size-5" />
                Print — {totalLabels} label{totalLabels !== 1 ? "s" : ""}
              </h3>
              <Button onClick={close} isIcon variant="flat" className="size-7 rounded-full">
                <XMarkIcon className="size-4" />
              </Button>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div>
                <p className="dark:text-dark-100 mb-2 text-sm font-medium text-gray-700">
                  Select Label Size
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LABEL_SIZES.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSizeId(size.id)}
                      className={`rounded-md border px-3 py-2 text-left text-sm ${
                        selectedSizeId === size.id
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "dark:border-dark-450 border-gray-300"
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
                <div className="bg-primary-50 dark:bg-dark-600 mt-2 rounded-md px-3 py-2 text-xs">
                  Page: <strong>{pageWidth}×{selectedSize.labelHeight}mm</strong>
                  {"  "}Label: <strong>{selectedSize.labelWidth}×{selectedSize.labelHeight}mm</strong>
                  {"  "}Cols: <strong>{selectedSize.cols}</strong>
                </div>
              </div>

              {items[0] && (
                <div>
                  <p className="mb-1 text-xs text-gray-400">Preview (screen approximation)</p>
                  <div
                    className="dark:border-dark-450 flex items-center justify-center border border-dashed border-gray-300 p-2 text-center"
                    style={{ width: `${selectedSize.labelWidth * 3}px`, height: `${selectedSize.labelHeight * 3}px` }}
                  >
                    <div>
                      <div className="text-xs font-bold">{items[0].item.itemName}</div>
                      <div className="text-[10px]">
                        ₹{items[0].item.salesPrice} MRP:₹{items[0].item.mrp}
                      </div>
                      <BarcodePreview value={items[0].item.barcode} height={30} width={1.2} fontSize={8} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-200 px-4 py-3 dark:border-dark-500">
              <Button color="primary" onClick={handlePrint} className="gap-2">
                <PrinterIcon className="size-4" />
                Print Now
              </Button>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}