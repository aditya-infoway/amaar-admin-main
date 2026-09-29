import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Get, Post, Put, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";
import type { SalesOrder } from "../shared/types";

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

// ---------------- Select Party — only Sundry Debtors / Customer group accounts ----------------
const PARTY_GROUP_NAMES = ["sundry debtors", "customer"];

interface PartyOption {
  id: string;
  label: string;
  accountName: string;
  mobileNo?: string;
  email?: string;
  addressLine1?: string;
  cityName?: string;
}

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
  const [usedQuotationIds, setUsedQuotationIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationOption[]>(
    [],
  );

  // ---- Select Party — replaces the earlier "Details Mode" (As Its / Manual) toggle ----
  const [partyOptions, setPartyOptions] = useState<PartyOption[]>([]);
  const [selectedParty, setSelectedParty] = useState<PartyOption[]>([]);

  // ---- TOP BLOCK: read-only snapshot of the selected quotation ----
  // Set ONLY when a quotation is selected (or on edit-prefill).
  const [leadCode, setLeadCode] = useState(""); // renamed from leadId
  const [city, setCity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [model, setModel] = useState("");
  const [remark, setRemark] = useState("");

  // ---- BOTTOM BLOCK: editable details, actually submitted ----
  // Auto-filled from the selected Party, but always editable afterwards.
  const [detailCustomerName, setDetailCustomerName] = useState("");
  const [detailMobile, setDetailMobile] = useState("");
  const [detailEmail, setDetailEmail] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [detailCity, setDetailCity] = useState("");
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [qty, setQty] = useState("1");

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
    return (
      modelOptions.find((item) => item.id === model)?.label || model || "-"
    );
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

  // Fetch Parties (accounts) — only Sundry Debtors / Customer group
  useEffect(() => {
    if (!isOpen) return;

    const fetchParties = async () => {
      try {
        const response = await Get("master/account/list", {}, false);

        if (response?.data?.success || response?.data?.status === 200) {
          const list = response.data.data || response.data || [];

          const filtered = list.filter((acc: any) => {
            const groupName = (
              acc.groupName ||
              acc.group?.groupName ||
              acc.Group?.groupName ||
              ""
            )
              .toString()
              .toLowerCase();

            return PARTY_GROUP_NAMES.some((g) => groupName.includes(g));
          });

          setPartyOptions(
            filtered.map((acc: any) => ({
              id: String(acc.id ?? acc.accountId),
              label: acc.accountName,
              accountName: acc.accountName,
              mobileNo: acc.mobileNo || acc.mobile || "",
              email: acc.email || "",
              addressLine1: acc.addressLine1 || acc.address || "",
              cityName: acc.cityName || acc.city || "",
            })),
          );
        }
      } catch (error) {
        console.error("Party list error:", error);
        toasterrormsg("Unable to load parties.");
      }
    };

    fetchParties();
  }, [isOpen]);

  // Fetch sales orders to know which quotations are already used
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsedQuotations = async () => {
      try {
        const financialYearId = localStorage.getItem("financialYearId");

        const response = await Get(
          "salesorder/list",
          financialYearId ? { financialYearId } : {},
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          const orders = response.data.data || [];

          setUsedQuotationIds(
            new Set(
              orders
                // don't exclude the quotation belonging to the SO currently being edited
                .filter(
                  (o: any) => String(o.id) !== String(salesOrder?.id || ""),
                )
                .map((o: any) => String(o.quotationId)),
            ),
          );
        }
      } catch (error) {
        console.error("Sales order list error (quotation filter):", error);
      }
    };

    fetchUsedQuotations();
  }, [isOpen, salesOrder?.id]);
  const availableQuotationOptions = useMemo(() => {
    if (isEditing) {
      // Lock to the quotation this sales order was created for
      return selectedQuotation[0] ? [selectedQuotation[0]] : [];
    }

    return quotationOptions.filter((q) => !usedQuotationIds.has(String(q.id)));
  }, [quotationOptions, usedQuotationIds, selectedQuotation, isEditing]);

  // Auto-fill Lead ID / City / Model / Remark / Price whenever a quotation is picked.
  // TOP block always mirrors the quotation, regardless of Party selection.
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

      setQty("1");
      setQuotationAmount(Number(q.finalPrice) || 0);
    });
  }, [selectedQuotation]);

  // Auto-fill the BOTTOM (editable) block whenever a Party is selected.
  // Fields stay editable afterwards — this is just a convenient prefill.
  useEffect(() => {
    const p = selectedParty?.[0];

    if (!p) return;

    queueMicrotask(() => {
      setDetailCustomerName(p.accountName || "");
      setDetailMobile(p.mobileNo || "");
      setDetailEmail(p.email || "");
      setDetailAddress(p.addressLine1 || "");
      setDetailCity(p.cityName || "");
    });
  }, [selectedParty]);

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

      const p = partyOptions.find(
        (item) => String(item.id) === String((salesOrder as any).accountId),
      );
      setSelectedParty(p ? [p] : []);

      setLeadCode(q?.leadCode || (salesOrder as any).leadCode || "");
      setCity(q?.city || (salesOrder as any).city || "");
      setCustomerName(
        q?.customerName || (salesOrder as any).customerName || "",
      );
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
    }

    setErrors({});
  });
}, [salesOrder, quotationOptions, partyOptions]); // isOpen removed from here on purpose, see below

  // Reset form for "Add" mode — runs once per drawer open, not on every list change
  useEffect(() => {
    if (!isOpen) return;
    if (salesOrder && salesOrder.id) return; // editing — handled by the effect above

    queueMicrotask(() => {
      setSoNo("");
      setSelectedQuotation([]);
      setSelectedParty([]);
      setQty("1");
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
          toasterrormsg(
            response?.data?.message ||
              "Failed to generate SO number. Please retry.",
          );
        }
      } catch (error) {
        console.error("SO number generation error:", error);
        toasterrormsg("Failed to generate SO number. Please retry.");
      }
    };

    fetchNextSoNo();
  }, [isOpen, isEditing]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!selectedQuotation?.[0]) nextErrors.quotation = "Select a Quotation";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const q = selectedQuotation?.[0];
    const p = selectedParty?.[0];
    const financialYearId = localStorage.getItem("financialYearId");

    if (!financialYearId) {
      toasterrormsg("Financial Year not found. Please select a company year.");
      return;
    }

  const payload = {
  financialYearId: Number(financialYearId),
  quotationId: q?.id ?? "",
  leadId: q?.leadId ?? "",
  accountId: p?.id ? Number(p.id) : null,
  model: model || "",
  remark: remark || "",
  qty,
  unitPrice: quotationAmount,
  totalAmount,
};

    try {
      const response =
        isEditing && salesOrder?.id
          ? await Put(`salesorder/${salesOrder.id}`, payload, false)
          : await Post("salesorder/create", payload, false);

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
          <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
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
                    data={availableQuotationOptions}
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
                    disabled={readOnly || isEditing}
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

              {/* TOP BLOCK — read-only snapshot of the selected quotation. */}
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

              {/* Select Party — only Sundry Debtors / Customer group accounts.
                  Replaces the earlier "Details Mode" (As Its / Manual) toggle:
                  picking a party prefills the editable block below. */}
              <div>
                <Combobox
                  data={partyOptions}
                  displayField="label"
                  value={selectedParty[0] ?? null}
                  onChange={(val: any) =>
                    setSelectedParty(
                      val ? (Array.isArray(val) ? val : [val]) : [],
                    )
                  }
                  placeholder="Select Party"
                  label="Select Party"
                  searchFields={["label", "accountName"]}
                  disabled={readOnly}
                />
              </div>

           
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