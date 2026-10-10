import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "@/components/ui";
import { WorkOrderRow } from "./data";

interface Props {
  open: boolean;
  row: WorkOrderRow | null;
  onClose: () => void;
}

export function BodyRegisterViewDrawer({ open, row, onClose }: Props) {
  const br = row?.bodyRegister;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[100]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          transition
          className="dark:bg-dark-800 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl duration-200 ease-out data-[closed]:translate-x-full"
        >
          <div className="bg-primary-600 flex shrink-0 items-center justify-between px-6 py-4 text-white">
            <div>
              <h2 className="text-lg font-semibold">View Body Register</h2>
              {row && (
                <p className="mt-0.5 text-sm text-white/80">
                  {row.workOrderNo} · {row.partyName} · {row.type}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {row && (
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="dark:bg-dark-600 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  WO: {row.workOrderNo}
                </span>
                <span className="dark:bg-dark-600 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  {row.workOrderDate}
                </span>
                <span className="dark:bg-dark-600 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  {row.partyName}
                </span>
                <span className="bg-primary-600/15 text-primary-600 rounded-full px-3 py-1 text-xs font-medium">
                  {row.type}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Class of Vehicle"
                value={br?.classOfVehicle || row?.model || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              <Input
                label="Maker's Name"
                value={br?.makerName || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              <Input
                label="Body Number"
                value={br?.bodyNumber || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50 font-mono"
              />
              <Input
                label="Engine No"
                value={br?.engineNo || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              <Input
                label="No. of Cylinder"
                value={br?.noOfCylinder || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              <Input
                label="Fuel Used"
                value={br?.fuelUsed || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              <Input
                label="Month & Year of Mfg."
                value={br?.mfgMonthYear || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              <Input
                label="Body Colour"
                value={br?.bodyColour || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              <Input
                label="Gross Vehicle Weight"
                value={br?.grossVehicleWeight || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              <Input
                label="Type of Body"
                value={br?.typeOfBody || row?.model || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
            </div>
          </div>

          <div className="dark:border-dark-500 dark:bg-dark-750 flex shrink-0 justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Button type="button" variant="soft" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
