import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Country, State, City } from "country-state-city";

import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Get, Post, toasterrormsg, toastsuccessmsg } from "@/ApiHelper";

/* 31 = Sundry Debtors, 35 = Customer */
const ALLOWED_GROUP_IDS = [31, 35];

// Main AccountForm jaisa: in groups pe default CR, baaki sab pe DR
const CR_GROUP_IDS = ["30", "34"];

const DRCR_OPTIONS = [
  { id: "DR", label: "DR – Debit" },
  { id: "CR", label: "CR – Credit" },
];

interface GroupOption {
  id: number;
  name: string;
}

interface Opt {
  id: string;
  label: string;
}

interface CreateAccountDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (created: any) => void;
  groupListEndpoint?: string;
  createEndpoint?: string;
}

interface AccountDrawerForm {
  accountName: string;
  mobileNo: string;
  group: GroupOption | null;
  openingBalance: string;
  drOrCr: "DR" | "CR";
  country: Opt | null;
  state: Opt | null;
  stateCode: string;
  district: Opt | null;
  taluka: Opt | null;
  city: Opt | null;
  area: string;
  addressLine1: string;
  pincode: string;
  gstNo: string;
}

const getInitialForm = (): AccountDrawerForm => ({
  accountName: "",
  mobileNo: "",
  group: null,
  openingBalance: "0.00",
  drOrCr: "DR",
  country: { id: "IN", label: "India" },
  state: null,
  stateCode: "",
  district: null,
  taluka: null,
  city: null,
  area: "",
  addressLine1: "",
  pincode: "",
  gstNo: "",
});

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

const ErrorText = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;

export function CreateAccountDrawer({
  open,
  onClose,
  onCreated,
  groupListEndpoint = "master/group/customer/list",
  createEndpoint = "master/account/create",
}: CreateAccountDrawerProps) {
  const [form, setForm] = useState<AccountDrawerForm>(getInitialForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const sf = (k: keyof AccountDrawerForm, v: any) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as string]) {
      setErrors((prev) => ({ ...prev, [k]: "" }));
    }
  };

  const countryOptions = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({ id: c.isoCode, label: c.name })),
    [],
  );

  const stateOptions = useMemo(
    () =>
      form.country
        ? State.getStatesOfCountry(form.country.id).map((s) => ({
            id: s.isoCode,
            label: s.name,
          }))
        : [],
    [form.country],
  );

  // Main form jaisa: district / taluka / city teeno same city list se
  const cityOptions = useMemo(
    () =>
      form.country && form.state
        ? City.getCitiesOfState(form.country.id, form.state.id).map((c) => ({
            id: c.name,
            label: c.name,
          }))
        : [],
    [form.country, form.state],
  );

  // Drawer khulte hi reset + groups fetch
  useEffect(() => {
    if (!open) return;

    setForm(getInitialForm());
    setErrors({});

    const fetchGroups = async () => {
      setGroupLoading(true);
      try {
        const res = await Get(groupListEndpoint, {}, false);

        if (res.data?.success || res.data?.status === 200) {
          const list = res.data.data || [];

          const filtered: GroupOption[] = list
            .map((g: any) => ({
              id: Number(g.id ?? g.groupId),
              name: g.groupName ?? g.name,
            }))
            .filter((g: GroupOption) => ALLOWED_GROUP_IDS.includes(g.id));

          setGroupOptions(filtered);
        } else {
          setGroupOptions([]);
          toasterrormsg(res.data?.message || "Failed to load groups.");
        }
      } catch (err: any) {
        setGroupOptions([]);
        toasterrormsg(
          err?.response?.data?.message ||
            "Something went wrong while loading groups.",
        );
      } finally {
        setGroupLoading(false);
      }
    };

    fetchGroups();
  }, [open, groupListEndpoint]);

  // ---- Validation: main AccountForm ke rules jaisa ----
  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.accountName.trim()) next.accountName = "Account Name is required";
    if (!form.group) next.group = "Group is required";

    if (!form.mobileNo.trim()) next.mobileNo = "Mobile number is required";
    else if (!/^[6-9][0-9]{9}$/.test(form.mobileNo.trim()))
      next.mobileNo = "Please enter a valid 10-digit mobile number";

    if (!form.country) next.country = "Country is required";
    if (!form.state) next.state = "State is required";
    if (!form.district) next.district = "District is required";
    if (!form.taluka) next.taluka = "Taluka is required";
    if (!form.city) next.city = "City is required";
    if (!form.area.trim()) next.area = "Area is required";
    if (!form.addressLine1.trim())
      next.addressLine1 = "Address Line 1 is required";

    if (!form.pincode.trim()) next.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(form.pincode.trim()))
      next.pincode = "Pincode must be 6 digits";

    if (
      form.gstNo.trim() &&
      !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(
        form.gstNo.trim(),
      )
    )
      next.gstNo = "Please enter a valid GST number";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    // Main AccountForm jaisa FormData (multipart) + same keys
    const formData = new FormData();
    const financialYearId = localStorage.getItem("financialYearId");

    const fields: Record<string, string> = {
      accountName: form.accountName.trim(),
      printName: form.accountName.trim(),
      groupId: String(form.group?.id ?? ""),
      openingBalance: form.openingBalance || "0.00",
      drOrCr: form.drOrCr,
      countryName: form.country?.label || "",
      stateName: form.state?.label || "",
      stateCode: form.stateCode || "",
      districtName: form.district?.label || "",
      talukaName: form.taluka?.label || "",
      cityName: form.city?.label || "",
      area: form.area.trim(),
      addressLine1: form.addressLine1.trim(),
      pincode: form.pincode.trim(),
      mobileNo: form.mobileNo.trim(),
      gstNo: form.gstNo.trim(),
      status: "active",
    };

    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    if (financialYearId) formData.append("financialYearId", financialYearId);

    setSubmitting(true);
    try {
      const res = await Post(createEndpoint, formData, true);

      if (res?.data?.status === 400 || res?.data?.success === false) {
        toasterrormsg(res?.data?.message || "Failed to create account.");
        return;
      }

      toastsuccessmsg(res?.data?.message || "Account created successfully.");
      onCreated?.({
        ...(res?.data?.data || {}),
        accountName: fields.accountName,
      });
      onClose();
    } catch (err: any) {
      toasterrormsg(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while creating account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[110]" onClose={onClose}>
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full transform-gpu flex-col bg-white transition-transform duration-200 lg:max-w-[50%]"
        >
          {/* Header */}
          <div className="bg-primary-600 flex flex-shrink-0 items-center justify-between px-5 py-4 text-white">
            <h3 className="text-base font-bold">Create Account</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white"
            >
              <XMarkIcon className="size-4.5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Account Name *"
                  placeholder="Enter account name"
                  value={form.accountName}
                  onChange={(e: any) => sf("accountName", e.target.value)}
                />
                <ErrorText msg={errors.accountName} />
              </div>

              <div>
                <Input
                  label="Mobile *"
                  placeholder="Mobile number"
                  value={form.mobileNo}
                  onChange={(e: any) => sf("mobileNo", e.target.value)}
                />
                <ErrorText msg={errors.mobileNo} />
              </div>

              <div>
                <FieldLabel required>Group</FieldLabel>
                <Combobox
                  data={groupOptions}
                  displayField="name"
                  value={form.group}
                  onChange={(v: any) => {
                    // Main form jaisa: group se Dr/Cr auto-set
                    setForm((f) => ({
                      ...f,
                      group: v || null,
                      drOrCr:
                        v && CR_GROUP_IDS.includes(String(v.id)) ? "CR" : "DR",
                    }));
                    if (errors.group) setErrors((p) => ({ ...p, group: "" }));
                  }}
                  placeholder={groupLoading ? "Loading..." : "Select group"}
                  searchFields={["name"]}
                />
                <ErrorText msg={errors.group} />
              </div>

              <Input
                label="Opening Balance"
                value={form.openingBalance}
                onChange={(e: any) => sf("openingBalance", e.target.value)}
                type="number"
                step="0.01"
                placeholder="0.00"
              />

              <div>
                <FieldLabel required>Dr./Cr.</FieldLabel>
                <Listbox
                  data={DRCR_OPTIONS}
                  value={
                    DRCR_OPTIONS.find((o) => o.id === form.drOrCr) || null
                  }
                  onChange={(item: any) => sf("drOrCr", item?.id || "DR")}
                  displayField="label"
                  placeholder="Select"
                />
              </div>

              <div>
                <FieldLabel required>Country</FieldLabel>
                <Combobox
                  data={countryOptions}
                  displayField="label"
                  value={form.country}
                  onChange={(v: any) => {
                    setForm((f) => ({
                      ...f,
                      country: v || null,
                      state: null,
                      stateCode: "",
                      district: null,
                      taluka: null,
                      city: null,
                    }));
                    if (errors.country)
                      setErrors((p) => ({ ...p, country: "" }));
                  }}
                  placeholder="Select country"
                  searchFields={["label"]}
                />
                <ErrorText msg={errors.country} />
              </div>

              <div>
                <FieldLabel required>State</FieldLabel>
                <Combobox
                  data={stateOptions}
                  displayField="label"
                  value={form.state}
                  onChange={(v: any) => {
                    setForm((f) => ({
                      ...f,
                      state: v || null,
                      stateCode: v?.id || "",
                      district: null,
                      taluka: null,
                      city: null,
                    }));
                    if (errors.state) setErrors((p) => ({ ...p, state: "" }));
                  }}
                  placeholder="Select state"
                  searchFields={["label"]}
                />
                <ErrorText msg={errors.state} />
              </div>

              <Input
                label="State Code"
                value={form.stateCode}
                placeholder="Auto filled on State select"
                readOnly
                disabled
              />

              <div>
                <FieldLabel required>District</FieldLabel>
                <Combobox
                  data={cityOptions}
                  displayField="label"
                  value={form.district}
                  onChange={(v: any) => sf("district", v || null)}
                  placeholder="Select district"
                  searchFields={["label"]}
                />
                <ErrorText msg={errors.district} />
              </div>

              <div>
                <FieldLabel required>Taluka</FieldLabel>
                <Combobox
                  data={cityOptions}
                  displayField="label"
                  value={form.taluka}
                  onChange={(v: any) => sf("taluka", v || null)}
                  placeholder="Select taluka"
                  searchFields={["label"]}
                />
                <ErrorText msg={errors.taluka} />
              </div>

              <div>
                <FieldLabel required>City</FieldLabel>
                <Combobox
                  data={cityOptions}
                  displayField="label"
                  value={form.city}
                  onChange={(v: any) => sf("city", v || null)}
                  placeholder="Select city"
                  searchFields={["label"]}
                />
                <ErrorText msg={errors.city} />
              </div>

              <div>
                <Input
                  label="Area *"
                  placeholder="Enter area"
                  value={form.area}
                  onChange={(e: any) => sf("area", e.target.value)}
                />
                <ErrorText msg={errors.area} />
              </div>

              <div>
                <Input
                  label="Address Line 1 *"
                  placeholder="Enter address"
                  value={form.addressLine1}
                  onChange={(e: any) => sf("addressLine1", e.target.value)}
                />
                <ErrorText msg={errors.addressLine1} />
              </div>

              <div>
                <Input
                  label="Pincode *"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e: any) => sf("pincode", e.target.value)}
                />
                <ErrorText msg={errors.pincode} />
              </div>

              <div className="col-span-2">
                <FieldLabel>GST No.</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    value={form.gstNo}
                    onChange={(e: any) => sf("gstNo", e.target.value)}
                    placeholder="Enter GST number"
                    className="flex-1"
                  />
                  <Button color="success" variant="outlined" type="button">
                    Verify
                  </Button>
                </div>
                <ErrorText msg={errors.gstNo} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
            <Button
              variant="outlined"
              color="secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="button"
              className="gap-2"
              onClick={handleCreate}
              disabled={submitting}
            >
              <PlusIcon className="size-4" />
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}

export default CreateAccountDrawer;