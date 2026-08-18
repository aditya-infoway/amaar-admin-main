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
import { TextEditor } from "@/components/shared/form/TextEditor";
import type Delta from "quill-delta";
import { masterStorage } from "../shared/storage";
import { Quotation } from "./data";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import {
  Get,
  Post,
  Put,
  Delete,
  toasterrormsg,
  toastsuccessmsg,
} from "@/ApiHelper";

// TEMP: static option lists so the drawer compiles/works standalone.
// Replace each of these with a real fetch (masterStorage / API) once
// the backend endpoints for these masters are ready — the rest of the
// component only depends on the {id, label, price} shape, so nothing
// else needs to change when you wire these up dynamically.
interface DropdownOption {
  id: string;
  label: string;
  price?: number;
}

// Helpers for the Combobox-style array state used by all 17 spec dropdowns
function idOf(selected: DropdownOption[]): string {
  return selected[0]?.id || "";
}

interface QuotationDrawerProps {
  isOpen: boolean;
  close: () => void;
  quotation: Quotation | null;
  onSave: (quotation: Quotation) => void;
}

interface LeadOption {
  id: number;
  leadId: number;
  leadCode: string;
  name: string;
  number: string;
  email?: string;
  address?: string;
  city?: string;
  model?: string;
  remark?: string;
  label: string;
}

interface CreateMasterOption {
  id: string | number;
  type: string;
  description: string;
  actualItem?: any[];
  exShowroom?: number;
  effectiveDate?: string;
  status?: string;
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

  // Vehicle type controls whether Main Chassis dropdown is shown
  const [vehicleType, setVehicleType] = useState<"tipper" | "trailer">(
    "trailer",
  );

  // 17 technical spec dropdowns, in the order shown on the sketch
  const [trailer, setTrailer] = useState<DropdownOption[]>([]);
  const [chassis, setChassis] = useState<DropdownOption[]>([]);
  const [body, setBody] = useState<DropdownOption[]>([]);
  const [hydraulic, setHydraulic] = useState<DropdownOption[]>([]);
  const [axle, setAxle] = useState<DropdownOption[]>([]);
  const [suspension, setSuspension] = useState<DropdownOption[]>([]);
  const [tyre, setTyre] = useState<DropdownOption[]>([]);
  const [rim, setRim] = useState<DropdownOption[]>([]);
  const [kingPin, setKingPin] = useState<DropdownOption[]>([]);
  const [landingLeg, setLandingLeg] = useState<DropdownOption[]>([]);
  const [brakeSystem, setBrakeSystem] = useState<DropdownOption[]>([]);
  const [mudguard, setMudguard] = useState<DropdownOption[]>([]);
  const [color, setColor] = useState<DropdownOption[]>([]);
  const [electricalTapes, setElectricalTapes] = useState<DropdownOption[]>([]);
  const [supdRupd, setSupdRupd] = useState<DropdownOption[]>([]);
  const [box, setBox] = useState<DropdownOption[]>([]);
  const [spareWheelCarrier, setSpareWheelCarrier] = useState<DropdownOption[]>(
    [],
  );

  const [warranty, setWarranty] = useState<Delta | undefined>(undefined);

  const [discountType, setDiscountType] = useState<"amount" | "percentage">(
    "amount",
  );
  const [discountValue, setDiscountValue] = useState("0");
  const [position, setPosition] = useState("");
  const [leadOptions, setLeadOptions] = useState<LeadOption[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createMasterData, setCreateMasterData] = useState<
    CreateMasterOption[]
  >([]);

  // Refreshed every time the drawer opens so newly added leads show up
  useEffect(() => {
    const fetchLeads = async () => {
      if (!isOpen) return;

      try {
        const role = sessionStorage.getItem("role") || "";

        const response = await Get("lead/list", { role }, false);

        if (response?.data?.success || response?.data?.status === 200) {
          const leads = response.data.data || [];

          setLeadOptions(
            leads.map((lead: any) => ({
              id: Number(lead.leadId),
              leadId: Number(lead.leadId),
              leadCode: lead.leadCode,
              name: lead.name,
              number: lead.number,
              label: `${lead.leadCode} - ${lead.name} - ${lead.number}`,
            })),
          );
        }
      } catch (error) {
        console.error("Enquiry list error:", error);
        toasterrormsg("Unable to load enquiries.");
      }
    };

    fetchLeads();
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
      const lead = leadOptions.find(
        (item) => String(item.leadId) === String(quotation.leadId),
      );

      setSelectedLead(
        lead
          ? [
              {
                id: Number(lead.leadId),
                leadId: Number(lead.leadId),
                leadCode: lead.leadCode,
                name: lead.name,
                number: lead.number,
                label: `${lead.leadCode} - ${lead.name} - ${lead.number}`,
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

      setVehicleType((quotation as any).vehicleType || "trailer");
      setTrailer(
        toSelection(
          getMasterOptions("Trailer Detail"),
          (quotation as any).trailer,
        ),
      );

      setChassis(
        toSelection(
          getMasterOptions("Main Chassis"),
          (quotation as any).chassis,
        ),
      );

      setBody(
        toSelection(getMasterOptions("Body Details"), (quotation as any).body),
      );

      setHydraulic(
        toSelection(getMasterOptions("Hyd Kit"), (quotation as any).hydraulic),
      );

      setAxle(toSelection(getMasterOptions("Axle"), (quotation as any).axle));

      setSuspension(
        toSelection(
          getMasterOptions("Suspension"),
          (quotation as any).suspension,
        ),
      );

      setTyre(toSelection(getMasterOptions("Tyre"), (quotation as any).tyre));

      setRim(toSelection(getMasterOptions("Rim"), (quotation as any).rim));

      setKingPin(
        toSelection(getMasterOptions("King Pin"), (quotation as any).kingPin),
      );

      setLandingLeg(
        toSelection(
          getMasterOptions("Landing Leg"),
          (quotation as any).landingLeg,
        ),
      );

      setBrakeSystem(
        toSelection(
          getMasterOptions("Brake system"),
          (quotation as any).brakeSystem,
        ),
      );

      setMudguard(
        toSelection(getMasterOptions("Mudgaurd"), (quotation as any).mudguard),
      );

      setColor(
        toSelection(getMasterOptions("Paint"), (quotation as any).color),
      );

      setElectricalTapes(
        toSelection(
          getMasterOptions("Electrical & Reflective tapes"),
          (quotation as any).electricalTapes,
        ),
      );

      setSupdRupd(
        toSelection(
          getMasterOptions("SUPD & RUPD"),
          (quotation as any).supdRupd,
        ),
      );

      setBox(toSelection(getMasterOptions("Tool Box"), (quotation as any).box));

      setSpareWheelCarrier(
        toSelection(
          getMasterOptions("Spare Wheel Carrier"),
          (quotation as any).spareWheelCarrier,
        ),
      );
      {
        const savedWarranty = (quotation as any).warranty;
        setWarranty(savedWarranty ? JSON.parse(savedWarranty) : undefined);
      }

      setDiscountType(quotation.discountType);
      setDiscountValue(quotation.discountValue);
      setPosition(quotation.position);
    } else {
      setQNo("");
      setSelectedLead([]);
      setCustomerName("");
      setMobile("");
      setEmail("");
      setAddress("");
      setCity("");
      setModel("");
      setRemark("");

      setVehicleType("trailer");
      setTrailer([]);
      setChassis([]);
      setBody([]);
      setHydraulic([]);
      setAxle([]);
      setSuspension([]);
      setTyre([]);
      setRim([]);
      setKingPin([]);
      setLandingLeg([]);
      setBrakeSystem([]);
      setMudguard([]);
      setColor([]);
      setElectricalTapes([]);
      setSupdRupd([]);
      setBox([]);
      setSpareWheelCarrier([]);

      setWarranty(undefined);

      setDiscountType("amount");
      setDiscountValue("0");
      setPosition("");
    }
    setErrors({});
  }, [quotation, isOpen, createMasterData]);

  // Handle auto-fill reliably by parsing both arrays or direct single objects
  useEffect(() => {
    const lead = Array.isArray(selectedLead)
      ? selectedLead[0]
      : (selectedLead as LeadOption | null);
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

    const fullLead = leadOptions.find(
      (item) => Number(item.leadId) === Number(lead.leadId),
    );

    if (!fullLead) return;

    setCustomerName(fullLead.name || "");
    setMobile(fullLead.number || "");
    setEmail(fullLead.email || "");
    setAddress(fullLead.address || "");
    setCity(fullLead.city || "");
    setModel(fullLead.model || "");
    setRemark(fullLead.remark || "");
  }, [selectedLead, leadOptions]);

  // When switching to Tipper, clear the Main Chassis selection since it's hidden
  useEffect(() => {
    if (vehicleType === "tipper") {
      setChassis([]);
    }
  }, [vehicleType]);

  const basePrice = useMemo(() => {
    const getPrice = (selected: DropdownOption[]) => {
      return Number(selected[0]?.price || 0);
    };

    return (
      getPrice(trailer) +
      (vehicleType === "trailer" ? getPrice(chassis) : 0) +
      getPrice(body) +
      getPrice(hydraulic) +
      getPrice(axle) +
      getPrice(suspension) +
      getPrice(tyre) +
      getPrice(rim) +
      getPrice(kingPin) +
      getPrice(landingLeg) +
      getPrice(brakeSystem) +
      getPrice(mudguard) +
      getPrice(color) +
      getPrice(electricalTapes) +
      getPrice(supdRupd) +
      getPrice(box) +
      getPrice(spareWheelCarrier)
    );
  }, [
    vehicleType,
    trailer,
    chassis,
    body,
    hydraulic,
    axle,
    suspension,
    tyre,
    rim,
    kingPin,
    landingLeg,
    brakeSystem,
    mudguard,
    color,
    electricalTapes,
    supdRupd,
    box,
    spareWheelCarrier,
  ]);

  const discountAmount = useMemo(() => {
    const value = Number(discountValue) || 0;

    if (discountType === "percentage") {
      return Math.min((basePrice * value) / 100, basePrice);
    }

    return Math.min(value, basePrice);
  }, [basePrice, discountType, discountValue]);

  const afterDiscount = Math.max(0, basePrice - discountAmount);

  const gstAmount = afterDiscount * 0.18;

  const finalPrice = afterDiscount + gstAmount;

  const handleClose = () => {
    close();
  };

  useEffect(() => {
    const fetchNextQuotationNo = async () => {
      if (!isOpen || isEditing) return;

      try {
        const financialYearId = sessionStorage.getItem("financialYearId");

        if (!financialYearId) {
          console.error("Financial Year ID not found");
          return;
        }

        const response = await Get(
          "quotation/next-number",
          { financialYearId },
          false,
        );

        if (response?.data?.success || response?.data?.status === 200) {
          setQNo(response.data.data.qNo);
        }
      } catch (error) {
        console.error("Quotation number generation error:", error);
        toasterrormsg("Unable to generate quotation number.");
      }
    };

    fetchNextQuotationNo();
  }, [isOpen, isEditing]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const lead = selectedLead?.[0];

    if (!lead || !lead.id) {
      nextErrors.lead = "Select a Lead";
    }
    if (!qNo) nextErrors.qNo = "Quotation No is required";
    if (trailer.length === 0) nextErrors.trailer = "Select Trailer";
    if (vehicleType === "trailer" && chassis.length === 0)
      nextErrors.chassis = "Select Main Chassis";
    if (body.length === 0) nextErrors.body = "Select Body";
    if (hydraulic.length === 0) nextErrors.hydraulic = "Select Hydraulic";
    if (axle.length === 0) nextErrors.axle = "Select Axle";
    if (suspension.length === 0) nextErrors.suspension = "Select Suspension";
    if (tyre.length === 0) nextErrors.tyre = "Select Tyre";
    if (rim.length === 0) nextErrors.rim = "Select Rim";
    if (kingPin.length === 0) nextErrors.kingPin = "Select King Pin";
    if (landingLeg.length === 0) nextErrors.landingLeg = "Select Landing Leg";
    if (brakeSystem.length === 0)
      nextErrors.brakeSystem = "Select Brake System";
    if (mudguard.length === 0) nextErrors.mudguard = "Select Mudguard";
    if (electricalTapes.length === 0)
      nextErrors.electricalTapes = "Select Electrical & Reflective Tapes";
    if (supdRupd.length === 0) nextErrors.supdRupd = "Select SUPD & RUPD";
    if (box.length === 0) nextErrors.box = "Select Tool Box";
    if (spareWheelCarrier.length === 0)
      nextErrors.spareWheelCarrier = "Select Spare Wheel Carrier";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const toSelection = (
    options: DropdownOption[],
    value: string | number | null | undefined,
  ): DropdownOption[] => {
    if (value === null || value === undefined || value === "") {
      return [];
    }

    const found = options.find((option) => String(option.id) === String(value));

    return found ? [found] : [];
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const lead = selectedLead?.[0];

    if (!lead || !lead.id) {
      toasterrormsg("Please select a Lead.");
      return;
    }

    const financialYearId = sessionStorage.getItem("financialYearId");

    if (!financialYearId) {
      toasterrormsg("Financial Year not found. Please select a company year.");
      return;
    }

    const payload = {
      financialYearId: Number(financialYearId),

      leadId: Number(lead.id),
      customerName,
      mobile,
      email: email || "",
      address: address || "",
      city: city || "",
      model,
      remark: remark || "",

      vehicleType,

      trailer: idOf(trailer),

      chassis: vehicleType === "trailer" ? idOf(chassis) : null,

      body: idOf(body),
      hydraulic: idOf(hydraulic),
      axle: idOf(axle),
      suspension: idOf(suspension),
      tyre: idOf(tyre),
      rim: idOf(rim),
      kingPin: idOf(kingPin),
      landingLeg: idOf(landingLeg),
      brakeSystem: idOf(brakeSystem),
      mudguard: idOf(mudguard),
      color: idOf(color),
      electricalTapes: idOf(electricalTapes),
      supdRupd: idOf(supdRupd),
      box: idOf(box),
      spareWheelCarrier: idOf(spareWheelCarrier),

      warranty: warranty ? JSON.stringify(warranty) : "",

      discountType,
      discountValue: Number(discountValue) || 0,

      position: position || null,

      createdBy:
        quotation?.createdBy || sessionStorage.getItem("userId") || "Admin",
    };

    try {
      let response;

      if (isEditing && quotation?.id) {
        response = await Put(`quotation/${quotation.id}`, payload, false);
      } else {
        response = await Post("quotation/create", payload, false);
      }

      const responseData = response?.data;

      if (responseData?.success || responseData?.status === 200) {
        toastsuccessmsg(
          responseData?.message ||
            (isEditing
              ? "Quotation updated successfully"
              : "Quotation saved successfully"),
        );

        const backendQuotation = responseData?.data;

        onSave({
          ...(quotation || {}),
          id: String(
            backendQuotation?.quotationId ||
              quotation?.id ||
              crypto.randomUUID(),
          ),
          qNo: backendQuotation?.qNo || "",
          leadId: String(lead.leadId),
          customerName,
          mobile,
          email,
          address,
          city,
          model,
          remark,
          vehicleType,

          trailer: idOf(trailer),
          chassis: vehicleType === "trailer" ? idOf(chassis) : "",
          body: idOf(body),
          hydraulic: idOf(hydraulic),
          axle: idOf(axle),
          suspension: idOf(suspension),
          tyre: idOf(tyre),
          rim: idOf(rim),
          kingPin: idOf(kingPin),
          landingLeg: idOf(landingLeg),
          brakeSystem: idOf(brakeSystem),
          mudguard: idOf(mudguard),
          color: idOf(color),
          electricalTapes: idOf(electricalTapes),
          supdRupd: idOf(supdRupd),
          box: idOf(box),
          spareWheelCarrier: idOf(spareWheelCarrier),

          warranty: warranty ? JSON.stringify(warranty) : "",

          discountType,
          discountValue: String(discountValue || 0),

          basicCost: String(backendQuotation?.basicCost ?? basePrice),
          gstAmount: String(backendQuotation?.gstAmount ?? gstAmount),
          finalPrice: String(backendQuotation?.finalPrice ?? finalPrice),

          position,
        } as Quotation);

        handleClose();
      } else {
        toasterrormsg(responseData?.message || "Failed to save quotation.");
      }
    } catch (error: any) {
      console.error("Quotation save error:", error);

      toasterrormsg(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while saving quotation.",
      );
    }
  };

  // Safe normalized value for standard Combobox bindings
  const normalizedComboboxValue = useMemo(() => {
    return selectedLead[0] ?? null;
  }, [selectedLead]);

  useEffect(() => {
    const fetchCreateMaster = async () => {
      try {
        const response = await Get("master/createmaster/list", {}, false);

        if (response?.data?.status === 200 || response?.data?.success) {
          setCreateMasterData(response?.data?.data || []);
        }
      } catch (error) {
        console.error("Create Master list error:", error);
      }
    };

    fetchCreateMaster();
  }, []);

  const getMasterOptions = (type: string): DropdownOption[] => {
    return createMasterData
      .filter(
        (item) => item.type?.trim().toLowerCase() === type.trim().toLowerCase(),
      )
      .map((item) => ({
        id: String(item.id),
        label: item.description,
        price: Number(item.exShowroom) || 0,
      }));
  };

  const handleMasterChange = (
    value: any,
    type: string,
    setter: React.Dispatch<React.SetStateAction<DropdownOption[]>>,
  ) => {
    const options = getMasterOptions(type);

    const selected = Array.isArray(value) ? value[0] : value;

    if (!selected) {
      setter([]);
      return;
    }

    const selectedId = typeof selected === "object" ? selected.id : selected;

    const matchedOption = options.find(
      (option) => String(option.id) === String(selectedId),
    );

    setter(matchedOption ? [matchedOption] : []);
  };

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
          <div className="dark:border-dark-500 bg-primary flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
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
                    onChange={(val: any) => {
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
                    <p className="text-error mt-1 text-xs">{errors.lead}</p>
                  )}
                </div>

                <Input
                  label="Quotation No"
                  required
                  placeholder="Generating..."
                  value={qNo || "Generating..."}
                  disabled
                  onChange={() => {}}
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
                    value={
                      modelOptions.find((item) => item.id === model) || null
                    }
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
              <div className="dark:border-dark-500 border-t border-dashed border-gray-300" />

              {/* Vehicle Type */}
              <div>
                <p className="dark:text-dark-100 mb-1.5 text-sm font-medium text-gray-800">
                  Vehicle Type
                </p>
                <div className="flex items-center gap-4">
                  <Radio
                    label="Tipper"
                    checked={vehicleType === "tipper"}
                    onChange={() => setVehicleType("tipper")}
                  />
                  <Radio
                    label="Trailer"
                    checked={vehicleType === "trailer"}
                    onChange={() => setVehicleType("trailer")}
                  />
                </div>
              </div>

              {/* Row 5: All 17 technical spec dropdowns, matching sketch order */}
              {/* Row 5: All 17 technical spec dropdowns */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1 - Trailer */}
                <div>
                  <Combobox
                    data={getMasterOptions("Trailer Detail")}
                    displayField="label"
                    value={trailer[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Trailer Detail", setTrailer)
                    }
                    placeholder="Select Trailer"
                    label="Select Trailer"
                    searchFields={["label"]}
                  />
                  {errors.trailer && (
                    <p className="text-error mt-1 text-xs">{errors.trailer}</p>
                  )}
                </div>

                {/* 2 - Main Chassis */}
                {vehicleType === "trailer" && (
                  <div>
                    <Combobox
                      data={getMasterOptions("Main Chassis")}
                      displayField="label"
                      value={chassis[0] || null}
                      onChange={(value: any) =>
                        handleMasterChange(value, "Main Chassis", setChassis)
                      }
                      placeholder="Select Main Chassis"
                      label="Select Main Chassis"
                      searchFields={["label"]}
                    />
                    {errors.chassis && (
                      <p className="text-error mt-1 text-xs">
                        {errors.chassis}
                      </p>
                    )}
                  </div>
                )}

                {/* 3 - Body */}
                <div>
                  <Combobox
                    data={getMasterOptions("Body Details")}
                    displayField="label"
                    value={body[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Body Details", setBody)
                    }
                    placeholder="Select Body"
                    label="Select Body"
                    searchFields={["label"]}
                  />
                  {errors.body && (
                    <p className="text-error mt-1 text-xs">{errors.body}</p>
                  )}
                </div>

                {/* 4 - Hydraulic */}
                <div>
                  <Combobox
                    data={getMasterOptions("Hyd Kit")}
                    displayField="label"
                    value={hydraulic[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Hyd Kit", setHydraulic)
                    }
                    placeholder="Select Hydraulic"
                    label="Select Hyd"
                    searchFields={["label"]}
                  />
                  {errors.hydraulic && (
                    <p className="text-error mt-1 text-xs">
                      {errors.hydraulic}
                    </p>
                  )}
                </div>

                {/* 5 - Axle */}
                <div>
                  <Combobox
                    data={getMasterOptions("Axle")}
                    displayField="label"
                    value={axle[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Axle", setAxle)
                    }
                    placeholder="Select Axle"
                    label="Select Axle"
                    searchFields={["label"]}
                  />
                  {errors.axle && (
                    <p className="text-error mt-1 text-xs">{errors.axle}</p>
                  )}
                </div>

                {/* 6 - Suspension */}
                <div>
                  <Combobox
                    data={getMasterOptions("Suspension")}
                    displayField="label"
                    value={suspension[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Suspension", setSuspension)
                    }
                    placeholder="Select Suspension"
                    label="Select Suspension"
                    searchFields={["label"]}
                  />
                  {errors.suspension && (
                    <p className="text-error mt-1 text-xs">
                      {errors.suspension}
                    </p>
                  )}
                </div>

                {/* 7 - Tyre */}
                <div>
                  <Combobox
                    data={getMasterOptions("Tyre")}
                    displayField="label"
                    value={tyre[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Tyre", setTyre)
                    }
                    placeholder="Select Tyre"
                    label="Select Tyre"
                    searchFields={["label"]}
                  />
                  {errors.tyre && (
                    <p className="text-error mt-1 text-xs">{errors.tyre}</p>
                  )}
                </div>

                {/* 8 - Rim */}
                <div>
                  <Combobox
                    data={getMasterOptions("Rim")}
                    displayField="label"
                    value={rim[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Rim", setRim)
                    }
                    placeholder="Select Rim"
                    label="Select Rim"
                    searchFields={["label"]}
                  />
                  {errors.rim && (
                    <p className="text-error mt-1 text-xs">{errors.rim}</p>
                  )}
                </div>

                {/* 9 - King Pin */}
                <div>
                  <Combobox
                    data={getMasterOptions("King Pin")}
                    displayField="label"
                    value={kingPin[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "King Pin", setKingPin)
                    }
                    placeholder="Select King Pin"
                    label="Select King Pin"
                    searchFields={["label"]}
                  />
                  {errors.kingPin && (
                    <p className="text-error mt-1 text-xs">{errors.kingPin}</p>
                  )}
                </div>

                {/* 10 - Landing Leg */}
                <div>
                  <Combobox
                    data={getMasterOptions("Landing Leg")}
                    displayField="label"
                    value={landingLeg[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Landing Leg", setLandingLeg)
                    }
                    placeholder="Select Landing Leg"
                    label="Select Landing Leg"
                    searchFields={["label"]}
                  />
                  {errors.landingLeg && (
                    <p className="text-error mt-1 text-xs">
                      {errors.landingLeg}
                    </p>
                  )}
                </div>

                {/* 11 - Brake System */}
                <div>
                  <Combobox
                    data={getMasterOptions("Brake system")}
                    displayField="label"
                    value={brakeSystem[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Brake system", setBrakeSystem)
                    }
                    placeholder="Select Brake System"
                    label="Select Brake System"
                    searchFields={["label"]}
                  />
                  {errors.brakeSystem && (
                    <p className="text-error mt-1 text-xs">
                      {errors.brakeSystem}
                    </p>
                  )}
                </div>

                {/* 12 - Mudguard */}
                <div>
                  <Combobox
                    data={getMasterOptions("Mudgaurd")}
                    displayField="label"
                    value={mudguard[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Mudgaurd", setMudguard)
                    }
                    placeholder="Select Mudguard"
                    label="Select Mudguard"
                    searchFields={["label"]}
                  />
                  {errors.mudguard && (
                    <p className="text-error mt-1 text-xs">{errors.mudguard}</p>
                  )}
                </div>

                {/* 13 - Paint / Color */}
                <div>
                  <Combobox
                    data={getMasterOptions("Paint")}
                    displayField="label"
                    value={color[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Paint", setColor)
                    }
                    placeholder="Select Paint"
                    label="Select Paint"
                    searchFields={["label"]}
                  />
                </div>

                {/* 14 - Electrical & Reflective Tapes */}
                <div>
                  <Combobox
                    data={getMasterOptions("Electrical & Reflective tapes")}
                    displayField="label"
                    value={electricalTapes[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(
                        value,
                        "Electrical & Reflective tapes",
                        setElectricalTapes,
                      )
                    }
                    placeholder="Electrical & Reflective Tapes"
                    label="Electrical & Reflective Tapes"
                    searchFields={["label"]}
                  />
                  {errors.electricalTapes && (
                    <p className="text-error mt-1 text-xs">
                      {errors.electricalTapes}
                    </p>
                  )}
                </div>

                {/* 15 - SUPD & RUPD */}
                <div>
                  <Combobox
                    data={getMasterOptions("SUPD & RUPD")}
                    displayField="label"
                    value={supdRupd[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "SUPD & RUPD", setSupdRupd)
                    }
                    placeholder="SUPD & RUPD"
                    label="SUPD & RUPD"
                    searchFields={["label"]}
                  />
                  {errors.supdRupd && (
                    <p className="text-error mt-1 text-xs">{errors.supdRupd}</p>
                  )}
                </div>

                {/* 16 - Tool Box */}
                <div>
                  <Combobox
                    data={getMasterOptions("Tool Box")}
                    displayField="label"
                    value={box[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(value, "Tool Box", setBox)
                    }
                    placeholder="Tool Box"
                    label="Tool Box"
                    searchFields={["label"]}
                  />
                  {errors.box && (
                    <p className="text-error mt-1 text-xs">{errors.box}</p>
                  )}
                </div>

                {/* 17 - Spare Wheel Carrier */}
                <div>
                  <Combobox
                    data={getMasterOptions("Spare Wheel Carrier")}
                    displayField="label"
                    value={spareWheelCarrier[0] || null}
                    onChange={(value: any) =>
                      handleMasterChange(
                        value,
                        "Spare Wheel Carrier",
                        setSpareWheelCarrier,
                      )
                    }
                    placeholder="Spare Wheel Carrier"
                    label="Spare Wheel Carrier"
                    searchFields={["label"]}
                  />
                  {errors.spareWheelCarrier && (
                    <p className="text-error mt-1 text-xs">
                      {errors.spareWheelCarrier}
                    </p>
                  )}
                </div>
              </div>

              {/* Warranty - rich text editor */}
              <div>
                <p className="dark:text-dark-100 mb-1.5 text-sm font-medium text-gray-800">
                  Warranty
                </p>
                <TextEditor
                  value={warranty}
                  onChange={setWarranty}
                  placeholder="Enter warranty details..."
                />
              </div>

              {/* Row 7: Discount then Basic Cost / GST / Final Amount */}
              <div>
                <p className="dark:text-dark-100 mb-1.5 text-sm font-medium text-gray-800">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Basic Cost"
                  value={`₹ ${basePrice.toLocaleString("en-IN")}`}
                  disabled
                  onChange={() => {}}
                />

                <Input
                  label="GST 18%"
                  value={`₹ ${gstAmount.toLocaleString("en-IN")}`}
                  disabled
                  onChange={() => {}}
                />

                <Input
                  label="Final Amount"
                  value={`₹ ${finalPrice.toLocaleString("en-IN")}`}
                  disabled
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-6">
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
