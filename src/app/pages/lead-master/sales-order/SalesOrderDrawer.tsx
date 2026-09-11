import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, PaperClipIcon } from "@heroicons/react/24/solid";

import { Button, Input, Radio } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import {
  URL,
  Get,
  Post,
  Put,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";
import type { SalesOrder } from "../shared/types";
import { Download, ExternalLink } from "lucide-react";

interface SalesOrderDrawerProps {
  isOpen: boolean;
  close: () => void;
  salesOrder: SalesOrder | null;
  onSave: (salesOrder: SalesOrder) => void;
  readOnly?: boolean;
}

interface QuotationOption {
  id: number;
  qNo: string;
  leadId: number;
    leadCode?: string; 
  customerName: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  model?: string;
  remark?: string;
  finalPrice?: number;
  label: string;
}

// One doc = one optional field + its own conditional upload
type KycKey = "aadhar" | "pan" | "gst";

interface KycState {
  number: string;
  file: File | null;
  // when editing, backend may already have an uploaded file url
  existingUrl?: string;
}

const emptyKyc = (): KycState => ({ number: "", file: null, existingUrl: "" });

const getFileUrl = (path?: string) => {
  if (!path) return "";

  return /^https?:\/\//i.test(path)
    ? path
    : `${URL.localurl}${path.replace(/^\/+/, "")}`;
};

export function SalesOrderDrawer({
  isOpen,
  close,
  salesOrder,
  onSave,
  readOnly = false,
}: SalesOrderDrawerProps) {
  const isEditing = Boolean(salesOrder?.id);

  const [soNo, setSoNo] = useState("");
  const [quotationOptions, setQuotationOptions] = useState<QuotationOption[]>(
    [],
  );
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationOption[]>(
    [],
  );

  // "asIs" = bottom detail fields mirror the quotation, "manual" = user fills them in
  const [mode, setMode] = useState<"asIs" | "manual">("asIs");

  // ---- TOP BLOCK: read-only snapshot of the selected quotation ----
  // Set ONLY when a quotation is selected (or on edit-prefill).
  // Never touched by the As Its / Manual toggle.
  const [leadCode, setLeadCode] = useState("");   // renamed from leadId
  const [city, setCity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [model, setModel] = useState("");
  const [remark, setRemark] = useState("");

  // ---- BOTTOM BLOCK: editable details, actually submitted ----
  // In "As Its" mode these mirror the quotation. In "Manual" mode
  // they start blank and the user fills them in.
  const [detailCustomerName, setDetailCustomerName] = useState("");
  const [detailMobile, setDetailMobile] = useState("");
  const [detailEmail, setDetailEmail] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [detailCity, setDetailCity] = useState("");
const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [qty, setQty] = useState("1");

  // KYC — each doc independent, upload only appears once its number is typed
  const [kyc, setKyc] = useState<Record<KycKey, KycState>>({
    aadhar: emptyKyc(),
    pan: emptyKyc(),
    gst: emptyKyc(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bottom block fields are always editable; top block is always read-only.
  const fieldsDisabled = readOnly;

  const [quotationAmount, setQuotationAmount] = useState(0);

  const totalAmount = useMemo(() => {
    const quantity = Number(qty) || 0;

    return quotationAmount * quantity;
  }, [qty, quotationAmount]);


  interface ModelOption {
  id: string;
  label: string;
}



useEffect(() => {
  const fetchModels = async () => {
    try {
      const response = await Get(
        "master/itemmaster/finished-goods/list",
        {},
        false,
      );

      if (response?.data?.success || response?.data?.status === 200) {
        const models = response.data.data || [];

        setModelOptions(
          models.map((item: any) => ({
            id: String(item.itemId),
            label: item.itemName,
          })),
        );
      }
    } catch (error) {
      console.error("Model list error:", error);
    }
  };

  fetchModels();
}, []);

const modelLabel = useMemo(() => {
  return modelOptions.find((item) => item.id === model)?.label || model || "-";
}, [modelOptions, model]);

  // Fetch quotations to populate "Select Quotation"
  useEffect(() => {
    if (!isOpen) return;

    const fetchQuotations = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        const response = await Get(
          "quotation/list",
          financialYearId ? { financialYearId } : {},
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          const list = response.data.data || [];

          setQuotationOptions(
            list.map((q: any) => ({
              id: Number(q.id ?? q.quotationId),
              qNo: q.qNo,
              leadId: Number(q.leadId),
              leadCode: q.leadCode || "",   
              customerName: q.customerName,
              mobile: q.mobile,
              email: q.email || "",
              address: q.address || "",
              city: q.city || "",
              model: q.model || "",
              remark: q.remark || "",
              finalPrice: Number(q.finalPrice) || 0,
              label: `${q.qNo} - ${q.customerName}`,
            })),
          );
        }
      } catch (error) {
        console.error("Quotation list error:", error);
        toasterrormsg("Unable to load quotations.");
      }
    };

    fetchQuotations();
  }, [isOpen]);

  // Auto-fill Lead ID / City / customer block whenever a quotation is picked.
  // TOP block always mirrors the quotation, regardless of mode.
  // BOTTOM (detail) block only mirrors it when mode === "asIs".
  useEffect(() => {
    const q = selectedQuotation?.[0];

    queueMicrotask(() => {
    if (!q) {
      // Nothing selected — clear everything.
      setLeadCode("");
      setCity("");
      setCustomerName("");
      setMobile("");
      setEmail("");
      setAddress("");
      setModel("");
      setRemark("");

      setDetailCustomerName("");
      setDetailMobile("");
      setDetailEmail("");
      setDetailAddress("");
      setDetailCity("");

      setQty("1");
      setQuotationAmount(0);
      return;
    }

    // TOP — always set from the quotation, read-only.
    setLeadCode(q.leadCode || "");
    setCity(q.city || "");
    setCustomerName(q.customerName || "");
    setMobile(q.mobile || "");
    setEmail(q.email || "");
    setAddress(q.address || "");
    setModel(q.model || "");
    setRemark(q.remark || "");

    // BOTTOM — only auto-fill in "As Its" mode.
    if (mode === "asIs") {
      setDetailCustomerName(q.customerName || "");
      setDetailMobile(q.mobile || "");
      setDetailEmail(q.email || "");
      setDetailAddress(q.address || "");
      setDetailCity(q.city || "");
      setQty("1");
      setQuotationAmount(Number(q.finalPrice) || 0);
    }
    });
  }, [selectedQuotation]);

  // Prefill on edit / reset on add
 // Prefill on edit / reset on add
useEffect(() => {
  if (!isOpen) return;

  queueMicrotask(() => {
  if (salesOrder && salesOrder.id) {
    setSoNo((salesOrder as any).soNo || "");
    const q = quotationOptions.find(
      (item) => String(item.id) === String((salesOrder as any).quotationId),
    );
    setSelectedQuotation(q ? [q] : []);
    setMode(((salesOrder as any).mode as "asIs" | "manual") || "asIs");

   setLeadCode(q?.leadCode || (salesOrder as any).leadCode || "");
    setCity(q?.city || (salesOrder as any).city || "");
    setCustomerName(q?.customerName || (salesOrder as any).customerName || "");
    setMobile(q?.mobile || (salesOrder as any).mobile || "");
    setEmail(q?.email || (salesOrder as any).email || "");
    setAddress(q?.address || (salesOrder as any).address || "");
    setModel(q?.model || (salesOrder as any).model || "");
    setRemark(q?.remark || (salesOrder as any).remark || "");

    setDetailCustomerName((salesOrder as any).customerName || "");
    setDetailMobile((salesOrder as any).mobile || "");
    setDetailEmail((salesOrder as any).email || "");
    setDetailAddress((salesOrder as any).address || "");
    setDetailCity((salesOrder as any).city || "");

    setQty(String((salesOrder as any).qty ?? "1"));
    setKyc({
      aadhar: { number: (salesOrder as any).aadharNumber || "", file: null, existingUrl: (salesOrder as any).aadharImage || "" },
      pan: { number: (salesOrder as any).panNumber || "", file: null, existingUrl: (salesOrder as any).panImage || "" },
      gst: { number: (salesOrder as any).gstNumber || "", file: null, existingUrl: (salesOrder as any).gstImage || "" },
    });
  }
  // NOTE: no "else" branch here anymore — the reset-for-add-mode
  // now happens only once per drawer open, in the effect below.

  setErrors({});
  });
}, [salesOrder, quotationOptions]); // isOpen removed from here on purpose, see below

// Reset form for "Add" mode — runs once per drawer open, not on every quotationOptions change
useEffect(() => {
  if (!isOpen) return;
  if (salesOrder && salesOrder.id) return; // editing — handled by the effect above

  queueMicrotask(() => {
    setSoNo("");
    setSelectedQuotation([]);
    setMode("asIs");
    setQty("1");
    setKyc({ aadhar: emptyKyc(), pan: emptyKyc(), gst: emptyKyc() });
    setErrors({});
  });
}, [isOpen]); // ← only isOpen, nothing else

  // Generate next SO number, same pattern as quotation/next-number
  useEffect(() => {
    if (!isOpen || isEditing) return;

    const fetchNextSoNo = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");
        if (!financialYearId) return;

        const response = await Get(
          "salesorder/next-number",
          { financialYearId },
          false,
        );
if (response?.data?.success || response?.data?.status === 200) {
  setSoNo(response.data.data.soNo);
} else {
  console.error("Unexpected next-number response:", response?.data);
  toasterrormsg(response?.data?.message || "Failed to generate SO number. Please retry.");
}
    } catch (error) {
  console.error("SO number generation error:", error);
  toasterrormsg("Failed to generate SO number. Please retry.");
}
    };

    fetchNextSoNo();
  }, [isOpen, isEditing]);

  const updateKycNumber = (key: KycKey, value: string) => {
    setKyc((prev) => ({
      ...prev,
      [key]: { ...prev[key], number: value },
    }));
  };

  const updateKycFile = (key: KycKey, file: File | null) => {
    setKyc((prev) => ({
      ...prev,
      [key]: { ...prev[key], file },
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!selectedQuotation?.[0]) nextErrors.quotation = "Select a Quotation";

    // Any KYC field that has text but no image (new or existing) is incomplete
    (Object.keys(kyc) as KycKey[]).forEach((key) => {
      const entry = kyc[key];
      if (entry.number.trim() && !entry.file && !entry.existingUrl) {
        nextErrors[key] = `Upload ${key.toUpperCase()} card image`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const q = selectedQuotation?.[0];
    const financialYearId = localStorage.getItem("financialYearId");

    if (!financialYearId) {
      toasterrormsg("Financial Year not found. Please select a company year.");
      return;
    }

    // FormData because Aadhar/PAN/GST images are optional file uploads
    const formData = new FormData();
    formData.append("financialYearId", financialYearId);
    formData.append("quotationId", String(q?.id ?? ""));
   formData.append("leadId", String(q?.leadId ?? ""));
    formData.append("mode", mode);

    // Actual saved contact info comes from the editable (bottom) fields
    formData.append("customerName", detailCustomerName);
    formData.append("mobile", detailMobile);
    formData.append("email", detailEmail || "");
    formData.append("address", detailAddress || "");
    formData.append("city", detailCity || "");

    formData.append("model", model || "");
    formData.append("remark", remark || "");
    formData.append("qty", qty);
    formData.append("unitPrice", String(quotationAmount));
    formData.append("totalAmount", String(totalAmount));

    formData.append("aadharNumber", kyc.aadhar.number);
    formData.append("panNumber", kyc.pan.number);
    formData.append("gstNumber", kyc.gst.number);
    if (kyc.aadhar.file) formData.append("aadharImage", kyc.aadhar.file);
    if (kyc.pan.file) formData.append("panImage", kyc.pan.file);
    if (kyc.gst.file) formData.append("gstImage", kyc.gst.file);

    try {
      const response =
        isEditing && salesOrder?.id
          ? await Put(`salesorder/${salesOrder.id}`, formData, true)
          : await Post("salesorder/create", formData, true);

      const responseData = response?.data;

      if (responseData?.success || responseData?.status === 200) {
        toastsuccessmsg(
          responseData?.message ||
            (isEditing ? "Sales Order updated" : "Sales Order saved"),
        );
        onSave({
          ...(salesOrder || {}),
          id: String(responseData?.data?.salesOrderId || salesOrder?.id),
          soNo: responseData?.data?.soNo || soNo,
        } as SalesOrder);
        close();
      } else {
        toasterrormsg(responseData?.message || "Failed to save sales order.");
      }
    } catch (error: any) {
      console.error("Sales Order save error:", error);
      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving sales order.",
      );
    }
  };

  // Small reusable block: number input + its own conditional upload
  const renderKycField = (key: KycKey, label: string) => {
    const entry = kyc[key];

    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>

        <div className="flex items-stretch">
          {/* Number Input */}
          <div className={readOnly ? "w-full" : "w-[68%]"}>
            <input
              type="text"
              placeholder={`Enter ${label}`}
              value={entry.number}
              disabled={readOnly}
              onChange={(e) => updateKycNumber(key, e.target.value)}
              className="focus:border-primary dark:bg-dark-800 w-full rounded-l-lg rounded-r-none border border-gray-300 px-3 py-2 text-sm outline-none disabled:opacity-60 dark:border-gray-600"
            />
          </div>

          {/* Upload or Download */}
          {!readOnly ? (
            <label className="border-primary bg-primary/5 text-primary flex w-[32%] cursor-pointer items-center justify-center gap-1 rounded-l-none rounded-r-lg border border-l-0 border-dashed px-2 py-2 text-center text-xs">
              <PaperClipIcon className="size-4" />
              {entry.file ? "Change" : entry.existingUrl ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  updateKycFile(key, e.target.files?.[0] || null)
                }
              />
            </label>
          ) : (
            entry.existingUrl && (
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = entry.existingUrl!;
                  link.download = `${label}_${entry.number || "document"}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="border-primary bg-primary/5 text-primary hover:bg-primary/10 flex w-[32%] cursor-pointer items-center justify-center gap-1 rounded-l-none rounded-r-lg border border-l-0 px-2 py-2 text-center text-xs transition-colors"
                title="Download"
              >
                <Download className="size-4" />
                Download
              </button>
            )
          )}
        </div>

        {/* Selected filename */}
        {entry.file && (
          <p className="mt-1 truncate text-xs text-green-600">
            {entry.file.name}
          </p>
        )}

        {/* Existing Image - Direct display in view mode */}
        {entry.existingUrl && !entry.file && (
          <div className="mt-2">
            <img
              src={getFileUrl(entry.existingUrl)}
              alt={`${label} image`}
              className="max-h-48 w-auto rounded-lg border border-gray-200 object-contain dark:border-gray-600"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {readOnly && (
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = getFileUrl(entry.existingUrl);
                  link.download = `${label}_${entry.number || "document"}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="mt-1 inline-flex cursor-pointer items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Download className="size-3" />
                View Image
              </button>
            )}
          </div>
        )}

        {errors[key] && (
          <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
        )}
      </div>
    );
  };

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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-4xl transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="dark:border-dark-500 bg-primary flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-white">
              {readOnly
                ? "View Sales Order"
                : isEditing
                  ? "Edit Sales Order"
                  : "Add Sales Order"}
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
              {/* Select Quotation + SO No */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Combobox
                    data={quotationOptions}
                    displayField="label"
                    value={selectedQuotation[0] ?? null}
                    onChange={(val: any) =>
                      setSelectedQuotation(
                        val ? (Array.isArray(val) ? val : [val]) : [],
                      )
                    }
                    placeholder="Select Quotation"
                    label="Select Quotation"
                    searchFields={["qNo", "customerName"]}
                    disabled={readOnly}
                  />
                  {errors.quotation && (
                    <p className="text-error mt-1 text-xs">
                      {errors.quotation}
                    </p>
                  )}
                </div>
                <Input
                  label="Sales Order No"
                  value={soNo || "Generating..."}
                  disabled
                  onChange={() => {}}
                />
              </div>

              {/* TOP BLOCK — read-only snapshot of the selected quotation.
    Never changed by the As Its / Manual toggle. */}
              {/* TOP BLOCK — read-only snapshot of the selected quotation.
    Never changed by the As Its / Manual toggle. */}
              <div className="dark:border-dark-500 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700">
                    <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                      Lead ID
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
  {leadCode || "-"}
</span>
                  </div>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 sm:border-l dark:border-gray-700">
                    <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                      City
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {city || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700">
                    <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                      Client Name
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {customerName || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 sm:border-l dark:border-gray-700">
                    <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                      Address
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {address || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-gray-700">
                    <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                      Client Number
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {mobile || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 sm:border-l dark:border-gray-700">
                    <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                      Model
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                       {modelLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                      Email ID
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {email || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2.5 sm:border-l dark:border-gray-700">
                    <span className="min-w-28 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                      Remark
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {remark || "-"}
                    </span>
                  </div>
                </div>
              </div>
              {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Client Name"
                  value={customerName}
                  disabled
                  onChange={() => {}}
                />
                <Input
                  label="Address"
                  value={address}
                  disabled
                  onChange={() => {}}
                />
                <Input
                  label="Client Number"
                  value={mobile}
                  disabled
                  onChange={() => {}}
                />
                <Input
                  label="Model"
                  value={model}
                  disabled
                  onChange={() => {}}
                />
                <Input
                  label="Email ID"
                  value={email}
                  disabled
                  onChange={() => {}}
                />
                <Input
                  label="Remark"
                  value={remark}
                  disabled
                  onChange={() => {}}
                />
              </div> */}

              {/* As Its / Manual */}
              <div>
                <p className="dark:text-dark-100 mb-2 text-sm font-medium text-gray-800">
                  Details Mode
                </p>

                <div className="flex gap-5">
                  <Radio
                    label="As Its"
                    checked={mode === "asIs"}
                    disabled={readOnly}
                    onChange={() => {
                      if (readOnly) return;
                      setMode("asIs");

                      const q = selectedQuotation?.[0];
                      if (!q) return;

                      // Refill ONLY the bottom (editable) block.
                      setDetailCustomerName(q.customerName || "");
                      setDetailMobile(q.mobile || "");
                      setDetailEmail(q.email || "");
                      setDetailAddress(q.address || "");
                      setDetailCity(q.city || "");
                      setQty("1");
                      setQuotationAmount(Number(q.finalPrice) || 0);
                    }}
                  />

                  <Radio
                    label="Manual"
                    checked={mode === "manual"}
                    disabled={readOnly}
                    onChange={() => {
                      if (readOnly) return;
                      setMode("manual");

                      // ONLY the bottom (editable) block resets.
                      // Top block (Lead ID, City, Client Name, Address,
                      // Client Number, Model, Email ID, Remark) stays as-is.
                      setDetailCustomerName("");
                      setDetailMobile("");
                      setDetailEmail("");
                      setDetailAddress("");
                      setDetailCity("");
                      setQty("1");
                      setQuotationAmount(0);
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  As Its automatically fills the details below from the
                  quotation, but you can still edit them.
                </p>
              </div>

              {/* BOTTOM BLOCK — editable, actually submitted. Auto-filled from
                                the quotation in "As Its" mode, blank in "Manual" mode. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Client Name"
                  value={detailCustomerName}
                  disabled={fieldsDisabled}
                  onChange={(e) => setDetailCustomerName(e.target.value)}
                />
                <Input
                  label="Client Number"
                  value={detailMobile}
                  disabled={fieldsDisabled}
                  onChange={(e) => setDetailMobile(e.target.value)}
                />
                <Input
                  label="Email ID"
                  value={detailEmail}
                  disabled={fieldsDisabled}
                  onChange={(e) => setDetailEmail(e.target.value)}
                />
                <Input
                  label="Address"
                  value={detailAddress}
                  disabled={fieldsDisabled}
                  onChange={(e) => setDetailAddress(e.target.value)}
                />
                <Input
                  label="City"
                  value={detailCity}
                  disabled={fieldsDisabled}
                  onChange={(e) => setDetailCity(e.target.value)}
                />
              </div>

              {/* KYC */}
              <div className="dark:border-dark-500 border-t border-dashed border-gray-300 pt-4">
                <p className="dark:text-dark-100 mb-2 text-sm font-medium text-gray-800">
                  KYC Details (optional)
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {renderKycField("aadhar", "Aadhar Card")}
                  {renderKycField("pan", "PAN Card")}
                  {renderKycField("gst", "GST")}
                </div>
              </div>

              {/* Model / Qty / Amount + GST note */}
              <div className="dark:border-dark-500 border-t border-dashed border-gray-300 pt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                 <Input
  label="Model"
  value={modelLabel === "-" ? "" : modelLabel}
  disabled
  onChange={() => {}}
/>

                  <Input
                    type="number"
                    label="Qty"
                    value={qty}
                    min={1}
                    disabled={readOnly}
                    onChange={(e) => {
                      setQty(e.target.value);
                    }}
                  />

                  <Input
                    label="Total Amount"
                    value={`₹ ${totalAmount.toLocaleString("en-IN")}`}
                    disabled
                    onChange={() => {}}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Note: Amount is inclusive of GST 18%
                </p>
              </div>
            </div>

            {/* Footer */}
            {/* Footer */}
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
                    {isEditing ? "Update" : "Submit"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
