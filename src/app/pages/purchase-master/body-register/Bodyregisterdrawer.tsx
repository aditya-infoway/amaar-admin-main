// src/pages/body-register/BodyRegisterDrawer.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { Button, Input } from "@/components/ui";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { WorkOrderRow } from "./data";

// ----------------------------------------------------------------------

interface BodyRegisterDrawerProps {
  open: boolean;
  row: WorkOrderRow | null;
  onClose: () => void;
  onSaved: () => void;
}

interface AutoData {
  companyName: string;
  bodyNumber: string;
  mfgMonthYear: string;
}

interface FormState {
  engineNo: string;
  noOfCylinder: string;
  fuelUsed: string;
  bodyColour: string;
  grossVehicleWeight: string;
}

const emptyForm = (): FormState => ({
  engineNo: "",
  noOfCylinder: "",
  fuelUsed: "",
  bodyColour: "",
  grossVehicleWeight: "",
});

// ----------------------------------------------------------------------

export function BodyRegisterDrawer({
  open,
  row,
  onClose,
  onSaved,
}: BodyRegisterDrawerProps) {
  const [auto, setAuto] = useState<AutoData | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !row) return;

    setForm(emptyForm());
    setErrors({});
    setAuto(null);

    const loadAuto = async () => {
      setLoadingAuto(true);
      try {
        const companyDetailsId = localStorage.getItem("companyDetailsId");
        const res = await Get("bodyregister/next", { companyDetailsId }, false);
        if (res.data?.success) {
          setAuto(res.data.data);
        } else {
          toasterrormsg(
            res.data?.message || "Failed to load body register details.",
          );
        }
      } catch {
        toasterrormsg("Something went wrong while loading details.");
      } finally {
        setLoadingAuto(false);
      }
    };

    loadAuto();
  }, [open, row?.id]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.engineNo.trim()) next.engineNo = "Engine No is required";
    if (!form.noOfCylinder.trim())
      next.noOfCylinder = "No. of Cylinder is required";
    if (!form.fuelUsed.trim()) next.fuelUsed = "Fuel Used is required";
    if (!form.bodyColour.trim()) next.bodyColour = "Body Colour is required";
    if (!form.grossVehicleWeight.trim())
      next.grossVehicleWeight = "Gross Vehicle Weight is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!row || !auto) return;
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await Post(
        "bodyregister/create",
        {
          workOrderId: row.id,
          companyDetailsId: localStorage.getItem("companyDetailsId"),
          vehicleType: row.type,
          classOfVehicle: row.model,
          typeOfBody: row.model,
          ...form,
        },
        false,
      );

      if (res.data?.success) {
        toastsuccessmsg(res.data?.message || "Body register saved.");
        onSaved();
      } else {
        toasterrormsg(res.data?.message || "Failed to save body register.");
      }
    } catch {
      toasterrormsg("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

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
          {/* Header */}
          <div className="bg-primary-600 flex shrink-0 items-center justify-between px-6 py-4 text-white">
            <div>
              <h2 className="text-lg font-semibold">Add Body Register</h2>
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Work-order chips */}
            {row && (
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="dark:bg-dark-600 dark:text-dark-100 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  WO: {row.workOrderNo}
                </span>
                <span className="dark:bg-dark-600 dark:text-dark-100 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {row.workOrderDate}
                </span>
                <span className="dark:bg-dark-600 dark:text-dark-100 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {row.partyName}
                </span>
                <span className="bg-primary-600/15 text-primary-600 dark:text-primary-400 rounded-full px-3 py-1 text-xs font-medium">
                  {row.type}
                </span>
              </div>
            )}

            {/* All fields in handwritten order — 2 columns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* 1 */}
              <Input
                label="Class of Vehicle"
                value={row?.model || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              {/* 2 */}
              <Input
                label="Maker's Name"
                value={loadingAuto ? "Loading..." : auto?.companyName || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              {/* 3 */}
              <Input
                label="Body Number"
                value={loadingAuto ? "Loading..." : auto?.bodyNumber || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50 font-mono"
              />
              {/* 4 */}
              <Input
                label="Engine No"
                placeholder="Enter engine number"
                value={form.engineNo}
                onChange={(e) => handleChange("engineNo", e.target.value)}
                error={errors.engineNo}
                className="rounded-xl"
              />
              {/* 5 */}
              <Input
                label="No. of Cylinder"
                placeholder="Enter number of cylinders"
                value={form.noOfCylinder}
                onChange={(e) => handleChange("noOfCylinder", e.target.value)}
                error={errors.noOfCylinder}
                className="rounded-xl"
              />
              {/* 6 */}
              <Input
                label="Fuel Used"
                placeholder="e.g. Diesel"
                value={form.fuelUsed}
                onChange={(e) => handleChange("fuelUsed", e.target.value)}
                error={errors.fuelUsed}
                className="rounded-xl"
              />
              {/* 7 (was 8 in note — Month & Year of Mfg) */}
              <Input
                label="Month & Year of Mfg."
                value={loadingAuto ? "Loading..." : auto?.mfgMonthYear || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
              {/* 8 */}
              <Input
                label="Body Colour"
                placeholder="Enter body colour"
                value={form.bodyColour}
                onChange={(e) => handleChange("bodyColour", e.target.value)}
                error={errors.bodyColour}
                className="rounded-xl"
              />
              {/* 9 */}
              <Input
                label="Gross Vehicle Weight"
                placeholder="Enter gross vehicle weight"
                value={form.grossVehicleWeight}
                onChange={(e) =>
                  handleChange("grossVehicleWeight", e.target.value)
                }
                error={errors.grossVehicleWeight}
                className="rounded-xl"
              />
              {/* 10 */}
              <Input
                label="Type of Body"
                value={row?.model || ""}
                readOnly
                className="dark:bg-dark-700 rounded-xl bg-gray-50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="dark:border-dark-500 dark:bg-dark-750 flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Button
              type="button"
              variant="soft"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={handleSave}
              disabled={saving || loadingAuto || !auto}
            >
              {saving ? "Saving..." : "Save Body Register"}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
