import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Input, Radio, Textarea } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { masterStorage } from "../shared/storage";
import { Quotation } from "./data";
import {
  tyreOptions,
  axleOptions,
  hydraulicOptions,
  boxOptions,
  colorOptions,
  chassisOptions,
  getOptionPrice,
} from "./options";
import { Combobox } from "@/components/shared/form/StyledCombobox";

interface QuotationDrawerProps {
  isOpen: boolean;
  close: () => void;
  quotation: Quotation | null;
  onSave: (quotation: Quotation) => void;
}

interface LeadOption {
  id: string;
  leadId: string;
  name: string;
  number: string;
  label: string;
}

export function QuotationDrawer({
  isOpen,
  close,
  quotation,
  onSave,
}: QuotationDrawerProps) {
  const isEditing = Boolean(quotation?.id);

  const [qNo, setQNo] = useState("");
  
  // Kept as array structure to safely support your Combobox architecture
  const [selectedLead, setSelectedLead] = useState<LeadOption[]>([]);
  
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [model, setModel] = useState("");
  const [remark, setRemark] = useState("");

  const [tyre, setTyre] = useState("");
  const [axle, setAxle] = useState("");
  const [hydraulic, setHydraulic] = useState("");
  const [box, setBox] = useState("");
  const [color, setColor] = useState("");
  const [chassis, setChassis] = useState("");

  const [markup, setMarkup] = useState("0");
  const [discountType, setDiscountType] = useState<"amount" | "percentage">(
    "amount",
  );
  const [discountValue, setDiscountValue] = useState("0");
  const [position, setPosition] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refreshed every time the drawer opens so newly added leads show up
  const leadOptions: LeadOption[] = useMemo(() => {
    if (!isOpen) return [];
    return masterStorage.getEnquiries().map((lead) => ({
      id: lead.id,
      leadId: lead.leadId,
      name: lead.name,
      number: lead.number,
      label: `${lead.leadId} - ${lead.name} - ${lead.number}`,
    }));
  }, [isOpen]);

  const modelOptions = useMemo(() => {
    return masterStorage.getModels().map((item) => ({
      id: item.id,
      label: item.modelName,
    }));
  }, []);

  // Pre-fill on edit, or reset on add
  useEffect(() => {
    if (!isOpen) return;

    if (quotation && quotation.id) {
      setQNo(quotation.qNo);
      const lead = masterStorage
        .getEnquiries()
        .find((item) => item.leadId === quotation.leadId);
      
      setSelectedLead(
        lead
          ? [
              {
                id: lead.id,
                leadId: lead.leadId,
                name: lead.name,
                number: lead.number,
                label: `${lead.leadId} - ${lead.name} - ${lead.number}`,
              },
            ]
          : [],
      );
      setCustomerName(quotation.customerName);
      setMobile(quotation.mobile);
      setEmail(quotation.email);
      setAddress(quotation.address);
      setCity(quotation.city);
      setModel(quotation.model);
      setRemark((quotation as any).remark || "");
      setTyre(quotation.tyre);
      setAxle(quotation.axle);
      setHydraulic(quotation.hydraulic);
      setBox(quotation.box);
      setColor(quotation.color);
      setChassis(quotation.chassis);
      setMarkup(quotation.markup);
      setDiscountType(quotation.discountType);
      setDiscountValue(quotation.discountValue);
      setPosition(quotation.position);
    } else {
      setQNo(`QT${Date.now().toString().slice(-6)}`);
      setSelectedLead([]);
      setCustomerName("");
      setMobile("");
      setEmail("");
      setAddress("");
      setCity("");
      setModel("");
      setRemark("");
      setTyre("");
      setAxle("");
      setHydraulic("");
      setBox("");
      setColor("");
      setChassis("");
      setMarkup("0");
      setDiscountType("amount");
      setDiscountValue("0");
      setPosition("");
    }
    setErrors({});
  }, [quotation, isOpen]);

  // Handle auto-fill reliably by parsing both arrays or direct single objects
  useEffect(() => {
    const lead = Array.isArray(selectedLead) ? selectedLead[0] : (selectedLead as LeadOption | null);
    if (!lead) {
      // Clear fields if lead is deselected
      setCustomerName("");
      setMobile("");
      setEmail("");
      setAddress("");
      setCity("");
      setModel("");
      setRemark("");
      return;
    }

    const fullLead = masterStorage
      .getEnquiries()
      .find((item) => item.id === lead.id);
      
    if (!fullLead) return;

    setCustomerName(fullLead.name || "");
    setMobile(fullLead.number || "");
    setEmail(fullLead.email || "");
    setAddress(fullLead.address || "");
    setCity(fullLead.city || "");
    setModel(fullLead.model || "");
    setRemark(fullLead.remark || "");
  }, [selectedLead]);

  // Auto-calculate final price whenever components, markup, or discount change
  const basePrice = useMemo(() => {
    return (
      getOptionPrice(tyreOptions, tyre) +
      getOptionPrice(axleOptions, axle) +
      getOptionPrice(hydraulicOptions, hydraulic) +
      getOptionPrice(boxOptions, box) +
      getOptionPrice(colorOptions, color) +
      getOptionPrice(chassisOptions, chassis)
    );
  }, [tyre, axle, hydraulic, box, color, chassis]);

  const finalPrice = useMemo(() => {
    const markupNum = Number(markup) || 0;
    const discountNum = Number(discountValue) || 0;
    const subtotal = basePrice + markupNum;
    const discountAmount =
      discountType === "percentage"
        ? (subtotal * discountNum) / 100
        : discountNum;
    const result = subtotal - discountAmount;
    return result > 0 ? result : 0;
  }, [basePrice, markup, discountType, discountValue]);

  const handleClose = () => {
    close();
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const lead = Array.isArray(selectedLead) ? selectedLead[0] : selectedLead;
    if (!lead) nextErrors.lead = "Select a Lead";
    if (!qNo) nextErrors.qNo = "Quotation No is required";
    if (!tyre) nextErrors.tyre = "Select Tyre";
    if (!axle) nextErrors.axle = "Select Exel";
    if (!hydraulic) nextErrors.hydraulic = "Select Hydraulic";
    if (!box) nextErrors.box = "Select Box";
    if (!chassis) nextErrors.chassis = "Select Chassis";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const lead = Array.isArray(selectedLead) ? selectedLead[0] : (selectedLead as LeadOption);

    onSave({
      id: quotation?.id || crypto.randomUUID(),
      qNo,
      leadId: lead.leadId,
      customerName,
      mobile,
      email,
      address,
      city,
      model,
      remark,
      tyre,
      axle,
      hydraulic,
      box,
      color,
      chassis,
      markup,
      discountType,
      discountValue,
      finalPrice: String(finalPrice),
      createdBy: quotation?.createdBy || "Admin",
      position,
      createdAt: quotation?.createdAt || new Date().toISOString(),
    } as Quotation);
    handleClose();
  };

  // Safe normalized value for standard Combobox bindings
  const normalizedComboboxValue = useMemo(() => {
    return selectedLead;
  }, [selectedLead]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="text-lg font-semibold text-white">
              {isEditing ? "Edit Quotation" : "Add Quotation"}
            </h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </Button>
          </div>

          <div className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-5 overflow-y-auto px-4 py-4 sm:px-6">
              
              {/* Row 1: Lead Selector and Quotation number */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Combobox
                    data={leadOptions}
                    displayField="label"
                    value={normalizedComboboxValue}
                    onChange={(val:any) => {
                      // Normalizes single-object select events into matching state shapes
                      if (val && !Array.isArray(val)) {
                        setSelectedLead([val]);
                      } else {
                        setSelectedLead(val || []);
                      }
                    }}
                    placeholder="Select Lead No"
                    label="Select Lead No"
                    searchFields={["leadId", "name", "number"]}
                  />
                  {errors.lead && (
                    <p className="mt-1 text-xs text-error">{errors.lead}</p>
                  )}
                </div>

                <Input
                  label="Quotation No"
                  required
                  placeholder="Quotation No"
                  value={qNo}
                  error={errors.qNo}
                  onChange={(e) => setQNo(e.target.value)}
                />
              </div>

              {/* Row 2: Customer details split clean into 3-columns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Customer"
                  placeholder="Customer Name"
                  value={customerName}
                  disabled
                  onChange={() => {}}
                />

                <Input
                  label="Mobile"
                  placeholder="Mobile"
                  value={mobile}
                  disabled
                  onChange={() => {}}
                />

                <Input
                  label="Email"
                  placeholder="Email"
                  value={email}
                  disabled
                  onChange={() => {}}
                />
              </div>

              {/* Row 3: City and Model split clean into 3-columns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="City"
                  placeholder="City"
                  value={city}
                  disabled
                  onChange={() => {}}
                />

                <div className="sm:col-span-2 lg:col-span-2">
                  <Listbox
                    label="Model"
                    data={modelOptions}
                    value={modelOptions.find((item) => item.id === model) || null}
                    onChange={() => {}}
                    placeholder="Model"
                    displayField="label"
                    disabled
                  />
                </div>
              </div>

              {/* Row 4: Large Textareas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Textarea
                  label="Address"
                  rows={3}
                  placeholder="Address"
                  value={address}
                  disabled
                  onChange={() => {}}
                />

                <Textarea
                  label="Remark"
                  rows={3}
                  placeholder="Remark"
                  value={remark}
                  disabled
                  onChange={() => {}}
                />
              </div>

              {/* Separator */}
              <div className="border-t border-dashed border-gray-300 dark:border-dark-500" />

              {/* Row 5: Dynamic Component selections split clean into 3-columns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Listbox
                  label="Select Tyre"
                  error={errors.tyre}
                  data={tyreOptions}
                  value={tyreOptions.find((item) => item.id === tyre) || null}
                  onChange={(item) => setTyre(item.id)}
                  placeholder="Select Tyre"
                  displayField="label"
                />

                <Listbox
                  label="Select Exel"
                  error={errors.axle}
                  data={axleOptions}
                  value={axleOptions.find((item) => item.id === axle) || null}
                  onChange={(item) => setAxle(item.id)}
                  placeholder="Select Exel"
                  displayField="label"
                />

                <Listbox
                  label="Select Hydraulic"
                  error={errors.hydraulic}
                  data={hydraulicOptions}
                  value={
                    hydraulicOptions.find((item) => item.id === hydraulic) ||
                    null
                  }
                  onChange={(item) => setHydraulic(item.id)}
                  placeholder="Select Hydraulic"
                  displayField="label"
                />

                <Listbox
                  label="Select Box"
                  error={errors.box}
                  data={boxOptions}
                  value={boxOptions.find((item) => item.id === box) || null}
                  onChange={(item) => setBox(item.id)}
                  placeholder="Select Box"
                  displayField="label"
                />

                <Listbox
                  label="Select Color"
                  data={colorOptions}
                  value={
                    colorOptions.find((item) => item.id === color) || null
                  }
                  onChange={(item) => setColor(item.id)}
                  placeholder="Select Color"
                  displayField="label"
                />

                <Listbox
                  label="Select Chassis"
                  error={errors.chassis}
                  data={chassisOptions}
                  value={
                    chassisOptions.find((item) => item.id === chassis) ||
                    null
                  }
                  onChange={(item) => setChassis(item.id)}
                  placeholder="Select Chassis"
                  displayField="label"
                />
              </div>

              {/* Row 6: Markup and Position setups */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Markup"
                  type="number"
                  placeholder="Enter Markup Amount"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                />

                <Input
                  label="Position"
                  placeholder="Enter Position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>

              {/* Row 7: Discounts and Final Pricing Layout */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-end">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-gray-800 dark:text-dark-100">
                    Discount
                  </p>
                  <div className="mb-2 flex items-center gap-4">
                    <Radio
                      label="Amount"
                      checked={discountType === "amount"}
                      onChange={() => setDiscountType("amount")}
                    />
                    <Radio
                      label="Percentage"
                      checked={discountType === "percentage"}
                      onChange={() => setDiscountType("percentage")}
                    />
                  </div>
                  <Input
                    type="number"
                    placeholder={
                      discountType === "percentage"
                        ? "Discount %"
                        : "Discount Amount"
                    }
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>

                <Input
                  label="Final Price"
                  value={`₹ ${finalPrice.toLocaleString("en-IN")}`}
                  disabled
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-6">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" color="primary" onClick={handleSubmit}>
                {isEditing ? "Update Quotation" : "Save Quotation"}
              </Button>
            </div>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}