import { useEffect, useState } from "react";
import { Controller, useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { PaperClipIcon } from "@heroicons/react/24/solid";
import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { drCrOptions } from "../../shared/constants";
import { DatePicker } from "@/components/shared/form/Datepicker";
import {
  Get,
  Post,
  Put,
  URL,
  toastsuccessmsg,
  toasterrormsg,
} from "@/ApiHelper";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import {
  Country,
  State,
  City,
  type ICountry,
  type IState,
  type ICity,
} from "country-state-city";
import { GroupCombobox } from "../groupCombobox";

// ---------------- Inline API calls ----------------
const groupApi = {
  list: () => Get("master/group/list", {}, false),
};

const accountGroupApi = {
  list: () => Get("master/account-group/list", {}, false),
};

const accountApi = {
  create: (payload: FormData) => Post("master/account/create", payload, true),
  update: (payload: FormData) => Put("master/account/update", payload, true),
  getById: (id: string) => Get(`master/account/${id}`, {}, false),
};
// -----------------------------------------------------------------------------------

// groupId jinke liye CR default hona chahiye (Supplier / Sundry Creditor jaisi groups)
const CR_GROUP_IDS = ["30", "34"];

interface GroupItem {
  id: number | string;
  groupName: string;
  role: string;
}

interface AccountGroupItem {
  id: number | string;
  groupName: string; // main group
  groupId: number | string; // sub group (group master id)
  subGroupName: string;
}
// ---------------- KYC (Aadhar / PAN / GST) — same pattern as Sales Order ----------------
type KycKey = "aadhar" | "pan" | "gst";

interface KycState {
  number: string;
  file: File | null;
  // edit mode me backend se already-uploaded file ka url aa sakta hai
  existingUrl?: string;
}

const emptyKyc = (): KycState => ({ number: "", file: null, existingUrl: "" });

const getFileUrl = (path?: string) => {
  if (!path) return "";

  return /^https?:\/\//i.test(path)
    ? path
    : `${URL.localurl}${path.replace(/^\/+/, "")}`;
};

const kycKeyToFileField: Record<KycKey, string> = {
  aadhar: "aadharImage",
  pan: "panImage",
  gst: "gstImage",
};

// NOTE: countryId / stateId / stateCode hata diye — sirf NAME store hoga
interface AccountFormValues {
  accountName: string;
  printName: string;
  groupId: string;
  openingBalance: string;
  drOrCr: "DR" | "CR";
  countryName: string;
  stateName: string;
  stateCode: string;
  districtName: string;
  talukaName: string;
  cityName: string;
  area: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  phoneNo: string;
  mobileNo: string;
  email: string;
  contactPersonName: string;
  birthdayOn: string;
  anniversary: string;
  bankAccountNo: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  gstNo: string;
  panCard: string;
  aadharCardNo: string;
  status: string;
}

// ---- Validation Schema ----
const schema = yup.object({
  accountName: yup.string().trim().required("Account Name is required"),
  printName: yup.string().trim().notRequired(),
  groupId: yup.string().required("Group is required"),
  drOrCr: yup
    .string()
    .oneOf(["DR", "CR"] as const)
    .required("Dr./Cr. is required"),
  openingBalance: yup.string().notRequired(),

  countryName: yup.string().trim().required("Country is required"),
  stateName: yup.string().trim().required("State is required"),
  stateCode: yup.string().trim().notRequired(),

  districtName: yup.string().trim().required("District is required"),
  talukaName: yup.string().trim().required("Taluka is required"),
  cityName: yup.string().trim().required("City is required"),

  area: yup.string().trim().required("Area is required"),
  addressLine1: yup.string().trim().required("Address Line 1 is required"),
  addressLine2: yup.string().trim().notRequired(),
  pincode: yup
    .string()
    .trim()
    .required("Pincode is required")
    .matches(/^[0-9]{6}$/, "Pincode must be 6 digits"),

  phoneNo: yup
    .string()
    .trim()
    .notRequired()
    .matches(/^[0-9]{6,15}$/, {
      message: "Please enter a valid phone number",
      excludeEmptyString: true,
    }),
  mobileNo: yup
    .string()
    .trim()
    .required("Mobile number is required")
    .matches(/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit mobile number"),

  email: yup
    .string()
    .trim()
    .notRequired()
    .email("Please enter a valid email address"),
  contactPersonName: yup.string().notRequired(),
  birthdayOn: yup.string().notRequired(),
  anniversary: yup.string().notRequired(),

  bankAccountNo: yup.string().notRequired(),
  bankName: yup.string().notRequired(),
  ifscCode: yup
    .string()
    .trim()
    .notRequired()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
      message: "Please enter a valid IFSC code",
      excludeEmptyString: true,
    }),
  branchName: yup.string().notRequired(),

  gstNo: yup
    .string()
    .trim()
    .notRequired()
    .matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/, {
      message: "Please enter a valid GST number",
      excludeEmptyString: true,
    }),
  panCard: yup
    .string()
    .trim()
    .notRequired()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: "Please enter a valid PAN number (e.g. ABCDE1234F)",
      excludeEmptyString: true,
    }),
  aadharCardNo: yup
    .string()
    .trim()
    .notRequired()
    .matches(/^\d{12}$/, {
      message: "Aadhar number must be exactly 12 digits",
      excludeEmptyString: true,
    }),

  status: yup.string().notRequired(),
});

const emptyFormValues: AccountFormValues = {
  accountName: "",
  printName: "",
  groupId: "",
  openingBalance: "0.00",
  drOrCr: "DR",
  countryName: "",
  stateName: "",
  stateCode: "",
  districtName: "",
  talukaName: "",
  cityName: "",
  area: "",
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  phoneNo: "",
  mobileNo: "",
  email: "",
  contactPersonName: "",
  birthdayOn: "",
  anniversary: "",
  bankAccountNo: "",
  bankName: "",
  ifscCode: "",
  branchName: "",
  gstNo: "",
  panCard: "",
  aadharCardNo: "",
  status: "active",
};

export function AccountForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [groupList, setGroupList] = useState<GroupItem[]>([]);
  const [accountGroupList, setAccountGroupList] = useState<AccountGroupItem[]>(
    [],
  );
  const [selectedMainGroup, setSelectedMainGroup] = useState<string>("");
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [countryList] = useState<ICountry[]>(() => Country.getAllCountries());
  const [stateList, setStateList] = useState<IState[]>([]);
  const [cityList, setCityList] = useState<ICity[]>([]);

  // ---- ISO codes sirf dropdown cascading ke liye — form/payload me nahi jaate ----
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>("");
  const [selectedStateIso, setSelectedStateIso] = useState<string>("");

  // ---- KYC (Aadhar / PAN / GST) — number RHF me, file + existingUrl local state me ----
  const [kyc, setKyc] = useState<Record<KycKey, KycState>>({
    aadhar: emptyKyc(),
    pan: emptyKyc(),
    gst: emptyKyc(),
  });
  const [kycErrors, setKycErrors] = useState<Partial<Record<KycKey, string>>>(
    {},
  );

  // Group dropdown = main groups (typed) + normal groups jo kisi main group ke under nahi hain
  const subGroupMasterIds = new Set(
    accountGroupList.map((r) => String(r.groupId)),
  );
  // sirf wahi rows jinka sub group sach me linked hai
  const validRows = accountGroupList.filter((r) => r.subGroupName);
  const mainGroupNames = new Set(
    validRows.map((r) => r.groupName.trim().toLowerCase()),
  );
  const mainGroupOptions = Array.from(
    new Set(validRows.map((r) => r.groupName)),
  ).map((name) => ({ id: `m:${name}`, label: name, effect: "" }));
  const directGroupOptions = groupList
    .filter(
      (g) =>
        !subGroupMasterIds.has(String(g.id)) &&
        !mainGroupNames.has(String(g.groupName).trim().toLowerCase()),
    )
    .map((g) => ({
      id: `g:${g.id}`,
      label: g.groupName,
      effect: g.role || "",
    }));
  const groupListOptions = [...mainGroupOptions, ...directGroupOptions];
  const countryListOptions = countryList.map((c) => ({
    id: c.isoCode,
    label: c.name,
  }));
  const stateListOptions = stateList.map((s) => ({
    id: s.isoCode,
    label: s.name,
  }));
  const cityListOptions = cityList.map((c) => ({ id: c.name, label: c.name }));
  const districtListOptions = cityListOptions;
  const talukaListOptions = cityListOptions;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    defaultValues: emptyFormValues,
    resolver: yupResolver(schema) as Resolver<AccountFormValues>,
  });

  const accountNameValue = watch("accountName");
  const gstNoValue = watch("gstNo");
  const panCardValue = watch("panCard");
  const aadharCardNoValue = watch("aadharCardNo");

  const groupIdValue = watch("groupId");

  const subGroupOptions = accountGroupList
    .filter((r) => r.groupName === selectedMainGroup)
    .map((r) => ({ id: String(r.groupId), label: r.subGroupName }));

  // Edit mode: account ka groupId kisi sub group ka hai to uska main group restore karo
  useEffect(() => {
    if (!groupIdValue) return;
    const row = accountGroupList.find(
      (r) => String(r.groupId) === String(groupIdValue),
    );
    if (row) setSelectedMainGroup(row.groupName);
  }, [groupIdValue, accountGroupList]);

  // Print Name = Account Name (auto-fill, readonly)
  useEffect(() => {
    setValue("printName", accountNameValue || "");
  }, [accountNameValue, setValue]);

  // Fetch Group list dynamically from DB
  useEffect(() => {
    (async () => {
      try {
        setLoadingGroups(true);
        const res = await groupApi.list();
        setGroupList(res?.data?.data || res?.data || []);
      } catch (err) {
        toasterrormsg("Failed to load groups");
      } finally {
        setLoadingGroups(false);
      }
    })();
  }, []);

  // Fetch Account Groups (sub groups) - Sub Group dropdown ke liye
  useEffect(() => {
    (async () => {
      try {
        const res = await accountGroupApi.list();
        setAccountGroupList(res?.data?.data || []);
      } catch (err) {
        toasterrormsg("Failed to load sub groups");
      }
    })();
  }, []);

  // Country iso change -> load states
  useEffect(() => {
    if (selectedCountryIso) {
      setStateList(State.getStatesOfCountry(selectedCountryIso));
    } else {
      setStateList([]);
    }
  }, [selectedCountryIso]);

  // State iso change -> load cities
  useEffect(() => {
    if (selectedCountryIso && selectedStateIso) {
      setCityList(City.getCitiesOfState(selectedCountryIso, selectedStateIso));
    } else {
      setCityList([]);
    }
  }, [selectedCountryIso, selectedStateIso]);

  // Edit mode - fetch existing account from API
  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          const res = await accountApi.getById(id);
          const account = res?.data?.data || res?.data;
          if (!account) return;

          reset({
            accountName: account.accountName || "",
            printName: account.printName || account.accountName || "",
            groupId: account.groupId ? String(account.groupId) : "",
            openingBalance: String(account.openingBalance ?? "0.00"),
            drOrCr: account.drOrCr || "DR",
            countryName: account.countryName || "",
            stateName: account.stateName || "",
            stateCode: account.stateCode || "",
            districtName: account.districtName || "",
            talukaName: account.talukaName || "",
            cityName: account.cityName || "",
            area: account.area || "",
            addressLine1: account.addressLine1 || "",
            addressLine2: account.addressLine2 || "",
            pincode: account.pincode || "",
            phoneNo: account.phoneNo || "",
            mobileNo: account.mobileNo || "",
            email: account.email || "",
            contactPersonName: account.contactPersonName || "",
            birthdayOn: account.birthdayOn || "",
            anniversary: account.anniversary || "",
            bankAccountNo: account.bankAccountNo || "",
            bankName: account.bankName || "",
            ifscCode: account.ifscCode || "",
            branchName: account.branchName || "",
            gstNo: account.gstNo || "",
            panCard: account.panCard || "",
            aadharCardNo: account.aadharCardNo || "",
            status: account.status || "active",
          });

          // KYC existing files (agar backend se aaye hain)
          setKyc({
            aadhar: {
              number: account.aadharCardNo || "",
              file: null,
              existingUrl: account.aadharImage || "",
            },
            pan: {
              number: account.panCard || "",
              file: null,
              existingUrl: account.panImage || "",
            },
            gst: {
              number: account.gstNo || "",
              file: null,
              existingUrl: account.gstImage || "",
            },
          });

          // Sirf dropdown cascading ke liye — naam se ISO dhoond lo (best effort)
          const foundCountry = countryList.find(
            (c) => c.name === account.countryName,
          );
          if (foundCountry) {
            setSelectedCountryIso(foundCountry.isoCode);
            const statesForCountry = State.getStatesOfCountry(
              foundCountry.isoCode,
            );
            const foundState = statesForCountry.find(
              (s) => s.name === account.stateName,
            );
            setStateList(statesForCountry);
            if (foundState) {
              setSelectedStateIso(foundState.isoCode);
              setValue("stateCode", foundState.isoCode);
              setCityList(
                City.getCitiesOfState(foundCountry.isoCode, foundState.isoCode),
              );
            }
          }
        } catch (err) {
          toasterrormsg("Failed to load account details");
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, reset, countryList]);

  // Keep kyc.number in sync whenever the RHF text value changes (typing)
  useEffect(() => {
    setKyc((prev) => ({
      ...prev,
      aadhar: { ...prev.aadhar, number: aadharCardNoValue || "" },
    }));
  }, [aadharCardNoValue]);

  useEffect(() => {
    setKyc((prev) => ({
      ...prev,
      pan: { ...prev.pan, number: panCardValue || "" },
    }));
  }, [panCardValue]);

  useEffect(() => {
    setKyc((prev) => ({
      ...prev,
      gst: { ...prev.gst, number: gstNoValue || "" },
    }));
  }, [gstNoValue]);

  const handleVerifyGst = () => {
    console.log("Verify GST clicked");
  };

  const formatDateForApi = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (value instanceof Date && !isNaN(value.getTime())) {
      const yyyy = value.getFullYear();
      const mm = String(value.getMonth() + 1).padStart(2, "0");
      const dd = String(value.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return null;
  };

  const extractErrorMessage = (res: any, fallback: string): string => {
    const data = res?.data ?? res;
    if (data?.message && typeof data.message === "string") return data.message;
    if (data?.error && typeof data.error === "string") return data.error;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (typeof first === "string") return first;
    }
    return fallback;
  };

  const updateKycFile = (key: KycKey, file: File | null) => {
    setKyc((prev) => ({
      ...prev,
      [key]: { ...prev[key], file },
    }));
    setKycErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Same condition as Sales Order: number diya hai lekin koi image (new ya existing) nahi -> error
  const validateKyc = (): boolean => {
    const nextErrors: Partial<Record<KycKey, string>> = {};

    (Object.keys(kyc) as KycKey[]).forEach((key) => {
      const entry = kyc[key];
      if (entry.number.trim() && !entry.file && !entry.existingUrl) {
        const label =
          key === "aadhar" ? "Aadhar" : key === "pan" ? "PAN" : "GST";
        nextErrors[key] = `Upload ${label} card image`;
      }
    });

    setKycErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (data: AccountFormValues) => {
    if (!validateKyc()) return;

    try {
      setSubmitting(true);

      const financialYearId = localStorage.getItem("financialYearId");

      const formData = new FormData();

      // countryId / stateId / stateCode kabhi bhi payload me nahi jaate — sirf naam
      Object.entries(data).forEach(([key, value]) => {
        if (key === "birthdayOn" || key === "anniversary") return;
        formData.append(
          key,
          value === undefined || value === null ? "" : String(value),
        );
      });

      formData.append("birthdayOn", formatDateForApi(data.birthdayOn) || "");
      formData.append("anniversary", formatDateForApi(data.anniversary) || "");

      if (financialYearId) {
        formData.append("financialYearId", financialYearId);
      }

      if (isEdit && id) {
        formData.append("accountId", String(id));
      }

      (Object.keys(kyc) as KycKey[]).forEach((key) => {
        const entry = kyc[key];
        if (entry.file) {
          formData.append(kycKeyToFileField[key], entry.file);
        }
      });

      if (isEdit && id) {
        const res = await accountApi.update(formData);
        if (res?.data?.status === 400 || res?.data?.success === false) {
          toasterrormsg(extractErrorMessage(res, "Something went wrong."));
          return;
        }
        toastsuccessmsg(
          extractErrorMessage(res, "Account updated successfully"),
        );
      } else {
        const res = await accountApi.create(formData);
        if (res?.data?.status === 400 || res?.data?.success === false) {
          toasterrormsg(extractErrorMessage(res, "Something went wrong."));
          return;
        }
        toastsuccessmsg(
          extractErrorMessage(res, "Account created successfully"),
        );
      }

      navigate("/user-master/accounts");
    } catch (err: any) {
      toasterrormsg(
        extractErrorMessage(
          err?.response,
          "Something went wrong. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---- KYC field renderer — same design/condition as Sales Order drawer ----
  // registerName: RHF field for the number; showVerify: GST ke liye Verify button
  const renderKycField = (
    key: KycKey,
    label: string,
    registerName: "gstNo" | "panCard" | "aadharCardNo",
    fieldError?: string,
    showVerify?: boolean,
  ) => {
    const entry = kyc[key];

    return (
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>

        <div className="flex items-stretch">
          {/* Number Input */}
          <div className="relative w-[68%]">
            <input
              {...register(registerName)}
              type="text"
              placeholder={`Enter ${label}`}
              className={`focus:border-primary dark:bg-dark-800 w-full rounded-l-lg rounded-r-none border border-gray-300 px-3 py-2 text-sm outline-none dark:border-gray-600 ${
                showVerify ? "pr-16" : ""
              }`}
            />
            {showVerify && (
              <Button
                type="button"
                color="success"
                onClick={handleVerifyGst}
                className="absolute top-1/2 right-1 h-auto -translate-y-1/2 px-2 py-1 text-xs font-medium"
              >
                Verify
              </Button>
            )}
          </div>

          {/* Upload / Change / Replace */}
          <label className="border-primary bg-primary/5 text-primary flex w-[32%] cursor-pointer items-center justify-center gap-1 rounded-l-none rounded-r-lg border border-l-0 border-dashed px-2 py-2 text-center text-xs">
            <PaperClipIcon className="size-4" />
            {entry.file ? "Change" : entry.existingUrl ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => updateKycFile(key, e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* RHF pattern/format error (e.g. invalid PAN format) */}
        {fieldError && (
          <p className="mt-1 text-xs text-red-600">{fieldError}</p>
        )}

        {/* Selected filename */}
        {entry.file && (
          <p className="mt-1 truncate text-xs text-green-600">
            {entry.file.name}
          </p>
        )}

        {/* Existing image preview */}
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
          </div>
        )}

        {/* Upload-required error — same condition as Sales Order */}
        {kycErrors[key] && (
          <p className="mt-1 text-xs text-red-600">{kycErrors[key]}</p>
        )}
      </div>
    );
  };

  return (
    <Page title={isEdit ? "Edit Account" : "Create Account"}>
      <div className="transition-content w-full pb-5">
        <div className="mb-6 flex items-center justify-between p-6 pb-0">
          <h1 className="text-primary text-2xl font-bold underline underline-offset-4">
            {isEdit ? "Edit Account" : "Create Account"}
          </h1>
          <Button
            type="button"
            onClick={() => navigate("/user-master/accounts")}
            className="bg-primary-500 hover:bg-primary-600 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="dark:bg-dark-800 rounded-lg bg-white p-6 shadow-sm"
        >
          <div className="dark:lg:divide-dark-500 grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
            {/* Left section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:pr-8">
              <div className="sm:col-span-2">
                <Input
                  {...register("accountName")}
                  label="Account Name *"
                  placeholder="Enter Account Name"
                  error={errors.accountName?.message}
                />
              </div>

              <Input
                {...register("printName")}
                label="Print Name"
                placeholder="Auto-filled from Account Name"
                readOnly
                error={errors.printName?.message}
              />

              {/* Group - dynamic from DB */}
              <Controller
                control={control}
                name="groupId"
                render={({ field: { value, onChange } }) => (
                  <GroupCombobox
                    data={groupListOptions}
                    displayField="label"
                    searchFields={["label", "effect"]}
                    highlight
                    value={
                      selectedMainGroup
                        ? mainGroupOptions.find(
                            (o) => o.id === `m:${selectedMainGroup}`,
                          ) || null
                        : directGroupOptions.find(
                            (o) => o.id === `g:${value}`,
                          ) || null
                    }
                    onChange={(item: any) => {
                      const picked = String(item?.id || "");
                      if (picked.startsWith("m:")) {
                        // main group -> ab sub group select karna padega
                        setSelectedMainGroup(picked.slice(2));
                        onChange("");
                      } else {
                        setSelectedMainGroup("");
                        const realId = picked.slice(2);
                        onChange(realId);
                        setValue(
                          "drOrCr",
                          CR_GROUP_IDS.includes(realId) ? "CR" : "DR",
                        );
                      }
                    }}
                    label="Group *"
                    placeholder={
                      loadingGroups ? "Loading groups..." : "Search Group"
                    }
                    error={
                      selectedMainGroup ? undefined : errors.groupId?.message
                    }
                  />
                )}
              />

              {/* Sub Group - sirf tab dikhega jab selected group ke sub groups bane hon */}
              {selectedMainGroup && (
                <Combobox
                  data={subGroupOptions}
                  value={
                    subGroupOptions.find((o) => o.id === groupIdValue) || null
                  }
                  onChange={(item: any) => {
                    const sid = item?.id ? String(item.id) : "";
                    setValue("groupId", sid, { shouldValidate: true });
                    setValue(
                      "drOrCr",
                      CR_GROUP_IDS.includes(sid) ? "CR" : "DR",
                    );
                  }}
                  label="Sub Group *"
                  placeholder="Select Sub Group"
                  displayField="label"
                  searchFields={["label"]}
                  error={errors.groupId ? "Sub Group is required" : undefined}
                />
              )}

              <Input
                {...register("openingBalance")}
                label="Opening Balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.openingBalance?.message}
              />

              {/* Dr./Cr. */}
              <Controller
                control={control}
                name="drOrCr"
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={drCrOptions}
                    value={
                      drCrOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Dr./Cr. *"
                    placeholder="Select"
                    displayField="label"
                    error={errors.drOrCr?.message}
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="countryName"
                render={(
                  { field: { value, onChange } }, // ✅ CHANGED — ...rest hata diya
                ) => (
                  <Combobox
                    data={countryListOptions}
                    value={
                      countryListOptions.find((item) => item.label === value) ||
                      null
                    }
                    onChange={(item: any) => {
                      onChange(item?.label || "");
                      setSelectedCountryIso(item?.id || "");
                      setSelectedStateIso("");
                      setValue("stateName", "");
                      setValue("stateCode", "");
                      setValue("districtName", "");
                      setValue("talukaName", "");
                      setValue("cityName", "");
                    }}
                    label="Country *"
                    placeholder="Select Country"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.countryName?.message}
                    // ✅ {...rest} yaha se hata diya
                  />
                )}
              />
              <Controller
                control={control}
                name="stateName"
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={stateListOptions}
                    value={
                      stateListOptions.find((item) => item.label === value) ||
                      null
                    }
                    onChange={(item: any) => {
                      onChange(item?.label || "");
                      setSelectedStateIso(item?.id || "");
                      setValue("stateCode", item?.id || ""); // item.id yahan state ka isoCode hai
                      setValue("districtName", "");
                      setValue("talukaName", "");
                      setValue("cityName", "");
                    }}
                    label="State *"
                    placeholder="Select State"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.stateName?.message}
                  />
                )}
              />

              <Input
                {...register("stateCode")}
                label="State Code"
                placeholder="Auto filled on State select"
                readOnly
                disabled
                error={errors.stateCode?.message}
              />

              {/* District */}
              <Controller
                control={control}
                name="districtName"
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={districtListOptions}
                    value={
                      districtListOptions.find((item) => item.id === value) ||
                      null
                    }
                    onChange={(item: any) => onChange(item?.id || "")}
                    label="District *"
                    placeholder="Select District"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.districtName?.message}
                  />
                )}
              />

              {/* Taluka */}
              <Controller
                control={control}
                name="talukaName"
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={talukaListOptions}
                    value={
                      talukaListOptions.find((item) => item.id === value) ||
                      null
                    }
                    onChange={(item: any) => onChange(item?.id || "")}
                    label="Taluka *"
                    placeholder="Select Taluka"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.talukaName?.message}
                  />
                )}
              />

              {/* City */}
              <Controller
                control={control}
                name="cityName"
                render={({ field: { value, onChange } }) => (
                  <Combobox
                    data={cityListOptions}
                    value={
                      cityListOptions.find((item) => item.id === value) || null
                    }
                    onChange={(item: any) => onChange(item?.id || "")}
                    label="City *"
                    placeholder="Select City"
                    displayField="label"
                    searchFields={["label"]}
                    error={errors.cityName?.message}
                  />
                )}
              />

              <Input
                {...register("area")}
                label="Area *"
                placeholder="Enter Area"
                error={errors.area?.message}
              />

              <Input
                {...register("addressLine1")}
                label="Address Line 1 *"
                placeholder="Enter Address"
                error={errors.addressLine1?.message}
              />

              <Input
                {...register("addressLine2")}
                label="Address Line 2"
                placeholder="Enter Address Line 2"
                error={errors.addressLine2?.message}
              />

              <Input
                {...register("pincode")}
                label="Pincode *"
                placeholder="Pincode"
                error={errors.pincode?.message}
              />

              <Input
                {...register("phoneNo")}
                label="Phone"
                placeholder="Phone"
                error={errors.phoneNo?.message}
              />

              <Input
                {...register("mobileNo")}
                label="Mobile *"
                placeholder="Mobile"
                error={errors.mobileNo?.message}
              />

              <Input
                {...register("email")}
                label="Email"
                type="email"
                placeholder="Enter Email"
                error={errors.email?.message}
              />

              <Input
                {...register("contactPersonName")}
                label="Contact Person"
                placeholder="Contact Name"
                error={errors.contactPersonName?.message}
              />
            </div>

            {/* Right section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:pl-8">
              <Controller
                control={control}
                name="birthdayOn"
                render={({ field: { value, onChange, ...rest } }) => (
                  <DatePicker
                    label="Birthday On"
                    value={value}
                    onChange={(selectedDates: Date[]) => {
                      const picked = selectedDates?.[0];
                      onChange(picked ? formatDateForApi(picked) : "");
                    }}
                    placeholder="Select Date"
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="anniversary"
                render={({ field: { value, onChange, ...rest } }) => (
                  <DatePicker
                    label="Anniversary"
                    value={value}
                    onChange={(selectedDates: Date[]) => {
                      const picked = selectedDates?.[0];
                      onChange(picked ? formatDateForApi(picked) : "");
                    }}
                    placeholder="Select Date"
                    {...rest}
                  />
                )}
              />

              <Input
                {...register("bankAccountNo")}
                label="Bank Account No."
                placeholder="Account Number"
                error={errors.bankAccountNo?.message}
              />

              <Input
                {...register("bankName")}
                label="Bank Name"
                placeholder="Bank Name"
                error={errors.bankName?.message}
              />

              <Input
                {...register("ifscCode")}
                label="IFSC Code"
                placeholder="IFSC Code"
                error={errors.ifscCode?.message}
              />

              <Input
                {...register("branchName")}
                label="Branch"
                placeholder="Branch Name"
                error={errors.branchName?.message}
              />

              {/* GST No. — KYC style: input + Verify + Upload */}
              {renderKycField("gst", "GST No.", "gstNo", errors.gstNo?.message)}

              {/* PAN Card — KYC style: input + Upload */}
              {renderKycField(
                "pan",
                "PAN Card",
                "panCard",
                errors.panCard?.message,
              )}

              {/* Aadhar Card No — KYC style: input + Upload */}
              <div className="sm:col-span-2">
                {renderKycField(
                  "aadhar",
                  "Aadhar Card No",
                  "aadharCardNo",
                  errors.aadharCardNo?.message,
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="dark:border-dark-500 mt-6 flex justify-end gap-3 border-t border-gray-200 pt-6">
            <Button
              type="button"
              onClick={() => navigate("/user-master/accounts")}
            >
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}
