import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { Download } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { URL as ApiUrl, Get, toasterrormsg } from "@/ApiHelper";
import type { PartyOption } from "./data";
import type {
  ContractorEmployee,
  ContractorEmployeeFiles,
  ContractorEmployeeInput,
} from "./types";

interface ContractorEmployeeDrawerProps {
  isOpen: boolean;
  close: () => void;
  employee: ContractorEmployee | null;
  onSave: (
    values: ContractorEmployeeInput,
    files: ContractorEmployeeFiles,
  ) => void;
  readOnly?: boolean;
}

type KycKey = "aadhar" | "pan";

interface KycState {
  number: string;
  file: File | null;
  // saved image path (edit/view) or a local preview URL for a newly picked file
  url: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AADHAR_RE = /^\d{12}$/;
const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;

const resolveFileUrl = (path: string) => {
  if (!path) return "";

  return /^(https?:|blob:|data:)/i.test(path)
    ? path
    : `${ApiUrl.localurl}${path.replace(/^\/+/, "")}`;
};

export function ContractorEmployeeDrawer({
  isOpen,
  close,
  employee,
  onSave,
  readOnly = false,
}: ContractorEmployeeDrawerProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={close}>
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-2xl transform-gpu flex-col bg-white transition-transform duration-200"
        >
          {/* Transition unmounts this when closed, so every open starts with fresh form state */}
          <DrawerForm
            close={close}
            employee={employee}
            onSave={onSave}
            readOnly={readOnly}
          />
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

function DrawerForm({
  close,
  employee,
  onSave,
  readOnly,
}: Omit<ContractorEmployeeDrawerProps, "isOpen">) {
  const isEditing = Boolean(employee?.id);

  // in DrawerForm: replace the `const [party, setParty] = useState...` block with
  const [partyId, setPartyId] = useState(employee?.partyId ?? "");
  const [partyOptions, setPartyOptions] = useState<PartyOption[]>([]);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await Get("contractoremployee/party/list", {}, false);

        if (response?.data?.success || response?.data?.status === 200) {
          setPartyOptions(
            (response.data.data || []).map((a: any) => ({
              id: String(a.id),
              label: a.accountName,
            })),
          );
        }
      } catch (error) {
        console.error("Party list error:", error);
        toasterrormsg("Unable to load parties.");
      }
    };

    fetchParties();
  }, []);

  // Keeps the saved party visible when editing, even if it's no longer in the list
  const savedPartyName = employee?.partyName;
  const comboOptions = useMemo(() => {
    if (
      partyId &&
      savedPartyName &&
      !partyOptions.some((p) => p.id === partyId)
    ) {
      return [...partyOptions, { id: partyId, label: savedPartyName }];
    }
    return partyOptions;
  }, [partyOptions, partyId, savedPartyName]);

  const party = useMemo(
    () => comboOptions.find((p) => p.id === partyId) ?? null,
    [comboOptions, partyId],
  );
  const [form, setForm] = useState({
    employeeName: employee?.employeeName ?? "",
    employeeNo: employee?.employeeNo ?? "",
    email: employee?.email ?? "",
    address: employee?.address ?? "",
  });

  const [kyc, setKyc] = useState<Record<KycKey, KycState>>({
    aadhar: {
      number: employee?.aadharNumber ?? "",
      file: null,
      url: employee?.aadharImage ?? "",
    },
    pan: {
      number: employee?.panNumber ?? "",
      file: null,
      url: employee?.panImage ?? "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateKycNumber = (key: KycKey, number: string) =>
    setKyc((prev) => ({ ...prev, [key]: { ...prev[key], number } }));

  const updateKycFile = (key: KycKey, file: File | null) => {
    if (!file) return;

    setKyc((prev) => ({
      ...prev,
      [key]: { ...prev[key], file, url: window.URL.createObjectURL(file) },
    }));
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!party) next.party = "Select a Party";
    if (!form.employeeName.trim()) next.employeeName = "Enter Employee Name";
    if (!form.employeeNo.trim()) next.employeeNo = "Enter Employee Number";

    if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) {
      next.email = "Enter a valid email address";
    }

    if (kyc.aadhar.number) {
      if (!AADHAR_RE.test(kyc.aadhar.number)) {
        next.aadhar = "Aadhar number must be 12 digits";
      } else if (!kyc.aadhar.url) {
        next.aadhar = "Upload Aadhar card image";
      }
    }

    if (kyc.pan.number) {
      if (!PAN_RE.test(kyc.pan.number)) {
        next.pan = "Enter a valid PAN (e.g. ABCDE1234F)";
      } else if (!kyc.pan.url) {
        next.pan = "Upload PAN card image";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !party) return;

    onSave(
      {
        partyId: party.id,
        partyName: party.label,
        employeeName: form.employeeName.trim(),
        employeeNo: form.employeeNo.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        aadharNumber: kyc.aadhar.number,
        aadharImage: kyc.aadhar.url,
        panNumber: kyc.pan.number,
        panImage: kyc.pan.url,
      },
      { aadhar: kyc.aadhar.file, pan: kyc.pan.file },
    );
  };

  // Number input + upload button (or download when viewing)
  const renderKycField = (
    key: KycKey,
    label: string,
    options: { maxLength: number; format: (v: string) => string },
  ) => {
    const entry = kyc[key];
    const fileUrl = resolveFileUrl(entry.url);
    const hasAction = !readOnly || Boolean(fileUrl);

    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>

        <div className="flex items-stretch">
          <div className={hasAction ? "w-[68%]" : "w-full"}>
            <input
              type="text"
              placeholder="Number"
              value={entry.number}
              maxLength={options.maxLength}
              disabled={readOnly}
              onChange={(e) =>
                updateKycNumber(key, options.format(e.target.value))
              }
              className={`focus:border-primary dark:bg-dark-800 w-full border border-gray-300 px-3 py-2 text-sm outline-none disabled:opacity-60 dark:border-gray-600 ${
                hasAction ? "rounded-l-lg rounded-r-none" : "rounded-lg"
              }`}
            />
          </div>

          {!readOnly ? (
            <label className="border-primary bg-primary/5 text-primary flex w-[32%] cursor-pointer items-center justify-center gap-1 rounded-l-none rounded-r-lg border border-l-0 border-dashed px-2 py-2 text-center text-xs">
              <PaperClipIcon className="size-4" />
              {entry.file ? "Change" : entry.url ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  updateKycFile(key, e.target.files?.[0] || null);
                  e.target.value = "";
                }}
              />
            </label>
          ) : (
            fileUrl && (
              <a
                href={fileUrl}
                download={`${label}_${entry.number || "document"}`}
                target="_blank"
                rel="noreferrer"
                className="border-primary bg-primary/5 text-primary hover:bg-primary/10 flex w-[32%] items-center justify-center gap-1 rounded-l-none rounded-r-lg border border-l-0 px-2 py-2 text-center text-xs transition-colors"
              >
                <Download className="size-4" />
                Download
              </a>
            )
          )}
        </div>

        {entry.file && (
          <p className="mt-1 truncate text-xs text-green-600">
            {entry.file.name}
          </p>
        )}

        {fileUrl && (
          <img
            src={fileUrl}
            alt={`${label} image`}
            className="mt-2 max-h-40 w-auto rounded-lg border border-gray-200 object-contain dark:border-gray-600"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {errors[key] && (
          <p className="text-error mt-1 text-xs">{errors[key]}</p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
        <h3 className="text-lg font-semibold text-white">
          {readOnly
            ? "View Employee"
            : isEditing
              ? "Edit Employee"
              : "Add Employee"}
        </h3>
        <Button
          onClick={close}
          variant="flat"
          isIcon
          className="size-6 rounded-full text-white"
        >
          <XMarkIcon className="size-4.5" />
        </Button>
      </div>

      <div className="flex grow flex-col overflow-hidden">
        <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Combobox
                data={comboOptions}
                value={party}
                onChange={(val: any) => {
                  const picked = Array.isArray(val) ? val[0] : val;
                  setPartyId(picked?.id ?? "");
                }}
                placeholder="Select Party"
                label="Select Party"
                searchFields={["label"]}
                disabled={readOnly}
              />
              {errors.party && (
                <p className="text-error mt-1 text-xs">{errors.party}</p>
              )}
            </div>

            <div>
              <Input
                label="Employee Name"
                placeholder="Enter employee name"
                value={form.employeeName}
                disabled={readOnly}
                onChange={(e) => setField("employeeName", e.target.value)}
              />
              {errors.employeeName && (
                <p className="text-error mt-1 text-xs">{errors.employeeName}</p>
              )}
            </div>

            <div>
              <Input
                label="Employee Number"
                placeholder="Enter employee number"
                value={form.employeeNo}
                disabled={readOnly}
                onChange={(e) => setField("employeeNo", e.target.value)}
              />
              {errors.employeeNo && (
                <p className="text-error mt-1 text-xs">{errors.employeeNo}</p>
              )}
            </div>

            <div>
              <Input
                type="email"
                label="Email ID"
                placeholder="Enter email address"
                value={form.email}
                disabled={readOnly}
                onChange={(e) => setField("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-error mt-1 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Employee Address"
                placeholder="Enter employee address"
                value={form.address}
                disabled={readOnly}
                onChange={(e) => setField("address", e.target.value)}
              />
            </div>
          </div>

          <div className="dark:border-dark-500 border-t border-dashed border-gray-300 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderKycField("aadhar", "Employee Aadhar Card", {
                maxLength: 12,
                format: (v) => v.replace(/\D/g, "").slice(0, 12),
              })}
              {renderKycField("pan", "Employee PAN Card", {
                maxLength: 10,
                format: (v) =>
                  v
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 10),
              })}
            </div>
          </div>
        </div>

        <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
          {readOnly ? (
            <Button type="button" onClick={close}>
              Close
            </Button>
          ) : (
            <>
              <Button type="button" onClick={close}>
                Cancel
              </Button>
              <Button type="button" color="primary" onClick={handleSubmit}>
                {isEditing ? "Update" : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
