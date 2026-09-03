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
    Get,
    Post,
    Put,
    toasterrormsg,
    toastsuccessmsg,
} from "@/ApiHelper";
import type { SalesOrder } from "../shared/types";

interface SalesOrderDrawerProps {
    isOpen: boolean;
    close: () => void;
    salesOrder: SalesOrder | null;
    onSave: (salesOrder: SalesOrder) => void;
}

interface QuotationOption {
    id: number;
    qNo: string;
    leadId: number;
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

export function SalesOrderDrawer({
    isOpen,
    close,
    salesOrder,
    onSave,
}: SalesOrderDrawerProps) {
    const isEditing = Boolean(salesOrder?.id);

    const [soNo, setSoNo] = useState("");
    const [quotationOptions, setQuotationOptions] = useState<QuotationOption[]>(
        [],
    );
    const [selectedQuotation, setSelectedQuotation] = useState<
        QuotationOption[]
    >([]);

    // "asIs" = fields locked from quotation, "manual" = user can override
    const [mode, setMode] = useState<"asIs" | "manual">("asIs");

    const [leadId, setLeadId] = useState("");
    const [city, setCity] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [model, setModel] = useState("");
    const [remark, setRemark] = useState("");

    const [qty, setQty] = useState("1");
    const [unitPrice, setUnitPrice] = useState(0);

    // KYC — each doc independent, upload only appears once its number is typed
    const [kyc, setKyc] = useState<Record<KycKey, KycState>>({
        aadhar: emptyKyc(),
        pan: emptyKyc(),
        gst: emptyKyc(),
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // All fields remain editable in both modes.
    // "As Its" only prefills quotation data.
    const fieldsDisabled = false;


    const [quotationAmount, setQuotationAmount] = useState(0);

    const totalAmount = useMemo(() => {
        const quantity = Number(qty) || 0;

        return quotationAmount * quantity;
    }, [qty, quotationAmount]);
    // Fetch quotations to populate "Select Quotation"
    useEffect(() => {
        if (!isOpen) return;

        const fetchQuotations = async () => {
            try {
                const financialYearId = sessionStorage.getItem("financialYearId");
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

    // Auto-fill Lead ID / City / customer block whenever a quotation is picked
    useEffect(() => {
        const q = selectedQuotation?.[0];

        if (!q) {
            setLeadId("");
            setCity("");
            setCustomerName("");
            setMobile("");
            setEmail("");
            setAddress("");
            setModel("");
            setRemark("");
            setQty("1");
            setUnitPrice(0);
            return;
        }

        // Auto fill from quotation
        setLeadId(String(q.leadId));
        setCity(q.city || "");
        setCustomerName(q.customerName || "");
        setMobile(q.mobile || "");
        setEmail(q.email || "");
        setAddress(q.address || "");
        setModel(q.model || "");
        setRemark(q.remark || "");

        // Qty default 1
        setQty("1");

        // Amount from quotation
        setQuotationAmount(Number(q.finalPrice) || 0);
    }, [selectedQuotation]);

    // Prefill on edit / reset on add
    useEffect(() => {
        if (!isOpen) return;

        if (salesOrder && salesOrder.id) {
            setSoNo((salesOrder as any).soNo || "");
            const q = quotationOptions.find(
                (item) => String(item.id) === String((salesOrder as any).quotationId),
            );
            setSelectedQuotation(q ? [q] : []);
            setMode(((salesOrder as any).mode as "asIs" | "manual") || "asIs");
            setCustomerName((salesOrder as any).customerName || "");
            setMobile((salesOrder as any).mobile || "");
            setEmail((salesOrder as any).email || "");
            setAddress((salesOrder as any).address || "");
            setCity((salesOrder as any).city || "");
            setModel((salesOrder as any).model || "");
            setRemark((salesOrder as any).remark || "");
            setQty(String((salesOrder as any).qty ?? "1"));
            setKyc({
                aadhar: {
                    number: (salesOrder as any).aadharNumber || "",
                    file: null,
                    existingUrl: (salesOrder as any).aadharImage || "",
                },
                pan: {
                    number: (salesOrder as any).panNumber || "",
                    file: null,
                    existingUrl: (salesOrder as any).panImage || "",
                },
                gst: {
                    number: (salesOrder as any).gstNumber || "",
                    file: null,
                    existingUrl: (salesOrder as any).gstImage || "",
                },
            });
        } else {
            setSoNo("");
            setSelectedQuotation([]);
            setMode("asIs");
            setQty("1");
            setKyc({ aadhar: emptyKyc(), pan: emptyKyc(), gst: emptyKyc() });
        }
        setErrors({});
    }, [salesOrder, isOpen, quotationOptions]);

    // Generate next SO number, same pattern as quotation/next-number
    useEffect(() => {
        if (!isOpen || isEditing) return;

        const fetchNextSoNo = async () => {
            try {
                const financialYearId = sessionStorage.getItem("financialYearId");
                if (!financialYearId) return;

                const response = await Get(
                    "salesorder/next-number",
                    { financialYearId },
                    false,
                );

                if (response?.data?.success || response?.data?.status === 200) {
                    setSoNo(response.data.data.soNo);
                }
            } catch (error) {
                console.error("SO number generation error:", error);
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
        const financialYearId = sessionStorage.getItem("financialYearId");

        if (!financialYearId) {
            toasterrormsg("Financial Year not found. Please select a company year.");
            return;
        }

        // FormData because Aadhar/PAN/GST images are optional file uploads
        const formData = new FormData();
        formData.append("financialYearId", financialYearId);
        formData.append("quotationId", String(q?.id ?? ""));
        formData.append("leadId", leadId);
        formData.append("mode", mode);
        formData.append("customerName", customerName);
        formData.append("mobile", mobile);
        formData.append("email", email || "");
        formData.append("address", address || "");
        formData.append("city", city || "");
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
                    <div className="w-[68%]">
                        <input
                            type="text"
                            placeholder={`Enter ${label}`}
                            value={entry.number}
                            onChange={(e) =>
                                updateKycNumber(key, e.target.value)
                            }
                            className="w-full rounded-l-lg rounded-r-none border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary dark:border-gray-600 dark:bg-dark-800"
                        />
                    </div>

                    {/* Upload */}
                    <label className="w-[32%] cursor-pointer rounded-r-lg rounded-l-none border border-l-0 border-dashed border-primary bg-primary/5 px-2 py-2 text-center text-xs text-primary flex items-center justify-center gap-1">
                        <PaperClipIcon className="size-4" />

                        {entry.file
                            ? "Change"
                            : entry.existingUrl
                                ? "Replace"
                                : "Upload"}

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                                updateKycFile(
                                    key,
                                    e.target.files?.[0] || null
                                )
                            }
                        />
                    </label>
                </div>

                {/* Selected filename */}
                {entry.file && (
                    <p className="mt-1 truncate text-xs text-green-600">
                        {entry.file.name}
                    </p>
                )}

                {/* Existing Image */}
                {entry.existingUrl && !entry.file && (
                    <a
                        href={entry.existingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-blue-600 underline"
                    >
                        View Current Image
                    </a>
                )}

                {errors[key] && (
                    <p className="mt-1 text-xs text-red-600">
                        {errors[key]}
                    </p>
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
                            {isEditing ? "Edit Sales Order" : "Add Sales Order"}
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
                                    />
                                    {errors.quotation && (
                                        <p className="text-error mt-1 text-xs">
                                            {errors.quotation}
                                        </p>
                                    )}
                                </div>
                                {/* <Input
                  label="Sales Order No"
                  value={soNo || "Generating..."}
                  disabled
                  onChange={() => {}}
                /> */}
                            </div>

                            {/* Lead ID + City auto-fill */}
                            {/* Lead ID + City */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input label="Lead ID" value={leadId} disabled onChange={() => { }} />
                                <Input
                                    label="City"
                                    value={city}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            {/* Client Details */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input
                                    label="Client Name"
                                    value={customerName}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                                <Input
                                    label="Address"
                                    value={address}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                <Input
                                    label="Client Number"
                                    value={mobile}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setMobile(e.target.value)}
                                />
                                <Input
                                    label="Model"
                                    value={model}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setModel(e.target.value)}
                                />
                                <Input
                                    label="Email ID"
                                    value={email}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Input
                                    label="Remark"
                                    value={remark}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setRemark(e.target.value)}
                                />
                            </div>

                            {/* As Its / Manual */}
                            <div>
                                <p className="dark:text-dark-100 mb-2 text-sm font-medium text-gray-800">
                                    Details Mode
                                </p>

                                <div className="flex gap-5">
                                    <Radio
                                        label="As Its"
                                        checked={mode === "asIs"}
                                        onChange={() => {
                                            setMode("asIs");

                                            const q = selectedQuotation?.[0];
                                            if (!q) return;

                                            // Refill quotation values.
                                            setCustomerName(q.customerName || "");
                                            setMobile(q.mobile || "");
                                            setEmail(q.email || "");
                                            setAddress(q.address || "");
                                            setCity(q.city || "");
                                            setModel(q.model || "");
                                            setRemark(q.remark || "");
                                            setQty("1");
                                            setUnitPrice(Number(q.finalPrice) || 0);
                                        }}
                                    />

                                    <Radio
                                        label="Manual"
                                        checked={mode === "manual"}
                                        onChange={() => {
                                            setMode("manual");
                                        }}
                                    />
                                </div>

                                <p className="mt-2 text-xs text-gray-500">
                                    As Its automatically fills quotation details, but you can still edit them.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input
                                    label="Client Name"
                                    value={customerName}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                                <Input
                                    label="Client Number"
                                    value={mobile}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setMobile(e.target.value)}
                                />
                                <Input
                                    label="Email ID"
                                    value={email}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Input
                                    label="Address"
                                    value={address}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                                {/* Replace Model with City */}
                                <Input
                                    label="City"
                                    value={city}
                                    disabled={fieldsDisabled}
                                    onChange={(e) => setCity(e.target.value)}
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
                                        value={model}
                                        disabled
                                        onChange={() => { }}
                                    />

                                    <Input
                                        type="number"
                                        label="Qty"
                                        value={qty}
                                        min={1}
                                        onChange={(e) => {
                                            setQty(e.target.value);
                                        }}
                                    />

                                    <Input
                                        label="Total Amount"
                                        value={`₹ ${totalAmount.toLocaleString("en-IN")}`}
                                        disabled
                                        onChange={() => { }}
                                    />
                                </div>
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Note: Amount is inclusive of GST 18%
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
                            <Button type="button" onClick={close}>
                                Cancel
                            </Button>
                            <Button type="button" color="primary" onClick={handleSubmit}>
                                {isEditing ? "Update" : "Submit"}
                            </Button>
                        </div>
                    </div>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}