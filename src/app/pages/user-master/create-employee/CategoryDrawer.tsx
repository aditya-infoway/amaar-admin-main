import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { Get } from "@/ApiHelper";
import { departmentOptions, branchOptions } from "./options";
import { Employee } from "./data";
import { Combobox } from "@/components/shared/form/StyledCombobox";

interface RoleOption {
  id: string;
  label: string;
  department: string;
}

interface AccountGroupOption {
  id: string;
  label: string;
  mobile?: string;
}

interface Option {
  id: string;
  label: string;
}

interface SubProcessRow {
  processId: string;
  id: string;
  label: string;
}

interface EmployeeFormValues extends Employee {
  confirmPassword: string;
  accountGroup?: string;
  processId?: string;
  subProcessId?: string;
}

interface EmployeeDrawerProps {
  isOpen: boolean;
  close: () => void;
  employee: Employee | null;
  roles: RoleOption[];
  onSave: (employee: Employee) => void;
}

// backend number bhejta hai, combobox string id se match karta hai
const toStr = (v: any) =>
  v === undefined || v === null || v === 0 || v === "0" ? "" : String(v);

// DB me "Fitting  Manager" jaise double space ho sakte hain
const normalizeLabel = (s: string) =>
  String(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// ---- Simple module-level cache: drawer dobara kholne par turant options dikhenge ----
const CACHE_TTL = 60 * 1000; // 60 sec ke baad background refresh

const cache: {
  processes?: { at: number; data: Option[] };
  parties?: { at: number; data: AccountGroupOption[] };
  subProcesses?: { at: number; data: SubProcessRow[] };
} = {};

const isFresh = (entry?: { at: number }) =>
  !!entry && Date.now() - entry.at < CACHE_TTL;

export function EmployeeDrawer({
  isOpen,
  close,
  employee,
  roles,
  onSave,
}: EmployeeDrawerProps) {
  const [checking, setChecking] = useState(false);
  const isEditing = Boolean(employee?.id);

  // Party (Sundry Creditor) list
  const [accountGroupOptions, setAccountGroupOptions] = useState<
    AccountGroupOption[]
  >(cache.parties?.data || []);
  const [loadingAccountGroups, setLoadingAccountGroups] = useState(false);

  // Production: process list (Active main process ke processes)
  const [processOptions, setProcessOptions] = useState<Option[]>(
    cache.processes?.data || [],
  );
  const [loadingProcesses, setLoadingProcesses] = useState(false);

  // Production: saare Active sub process (selected process ke hisaab se client-side filter)
  const [allSubProcesses, setAllSubProcesses] = useState<SubProcessRow[]>(
    cache.subProcesses?.data || [],
  );
  const [loadingSubProcesses, setLoadingSubProcesses] = useState(false);

  // Edit prefill: ids ko string me normalize karo
  const formValues = useMemo(() => {
    if (!employee) return undefined;
    const e: any = employee;
    return {
      ...employee,
      roleId: toStr(e.roleId),
      processId: toStr(e.processId),
      subProcessId: toStr(e.subProcessId),
      accountId: toStr(e.accountId),
      confirmPassword: "",
    } as EmployeeFormValues;
  }, [employee]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    values: formValues,
  });

  const selectedDepartment = watch("department");
  const selectedRoleId = watch("roleId");
  const selectedProcessId = watch("processId");

  // Production department select hua hai?
  const isProduction =
    String(selectedDepartment || "").toLowerCase() === "production";
const isProcessSelected = isProduction && !!selectedProcessId;
  // Role table se (department ke hisaab se)
  const roleOptions = roles
    .filter((item) => item.department === selectedDepartment)
    .map((item) => ({ id: item.id, label: item.label }));

  const selectedRole = roles.find((item) => item.id === selectedRoleId);
  const isContractorManager =
    !isProduction && selectedRole?.label === "Contractor Manager";

  // ---- Production Role dropdown = Processes + role table ke wo roles jo process ke duplicate nahi ----
  // Role "Welding Manager" ka base = "welding". Agar kisi process ke naam me
  // ye base aata hai (jaise "Welding", "Material Cutting"), to wo role process
  // ka duplicate hai, isliye skip.
  const productionRoleOptions: Option[] = useMemo(() => {
    const isProcessRole = (roleLabel: string) => {
      const base = normalizeLabel(roleLabel).replace(/\s*manager$/, "");
      if (!base) return false;
      return processOptions.some((p) => {
        const pn = normalizeLabel(p.label);
        if (pn.length < 2) return false;
        return pn.includes(base) || base.includes(pn);
      });
    };

    return [
      // id me prefix: p: = process, r: = role (dono tables ki ids clash na karein)
      ...processOptions.map((p) => ({ id: `p:${p.id}`, label: p.label })),
      ...roles
        .filter(
          (r) =>
            r.department === selectedDepartment && !isProcessRole(r.label),
        )
        .map((r) => ({ id: `r:${r.id}`, label: r.label })),
    ];
  }, [processOptions, roles, selectedDepartment]);

  // Combobox me kaunsa selected dikhana hai
  const selectedProductionRoleValue = selectedProcessId
    ? `p:${selectedProcessId}`
    : selectedRoleId
      ? `r:${selectedRoleId}`
      : "";

  // Sub process options: selected process ke hisaab se
  const subProcessOptions: Option[] = useMemo(
    () =>
      selectedProcessId
        ? allSubProcesses
            .filter((s) => s.processId === String(selectedProcessId))
            .map((s) => ({ id: s.id, label: s.label }))
        : [],
    [allSubProcesses, selectedProcessId],
  );

  // Drawer khulte hi teeno lists prefetch (department select hone ka wait nahi)
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const financialYearId = localStorage.getItem("financialYearId");
    const fyParams = financialYearId ? { financialYearId } : {};

    // 1) Processes
    if (cache.processes) setProcessOptions(cache.processes.data);
    if (!isFresh(cache.processes)) {
      if (!cache.processes) setLoadingProcesses(true);
      Get("main-process/list", fyParams, false)
        .then((response: any) => {
          if (!isMounted || !response?.data?.success) return;
          const list: any[] = response.data.data || [];
          const data: Option[] = list
            .filter((m) => m.status === "Active")
            .flatMap((m) =>
              (m.processes || []).map((p: any) => ({
                id: String(p.id),
                label: p.processName,
              })),
            );
          cache.processes = { at: Date.now(), data };
          setProcessOptions(data);
        })
        .catch(() => {})
        .finally(() => isMounted && setLoadingProcesses(false));
    }

    // 2) Parties
    if (cache.parties) setAccountGroupOptions(cache.parties.data);
    if (!isFresh(cache.parties)) {
      if (!cache.parties) setLoadingAccountGroups(true);
      Get("master/account/sundry-creditor/list", {}, false)
        .then((response: any) => {
          if (!isMounted || !response?.data?.success) return;
          const list: any[] = response.data.data || [];
          const data: AccountGroupOption[] = list.map((item) => ({
            id: String(item.id),
            label: item.accountName,
            mobile: item.mobileNo || item.mobileNumber || "",
          }));
          cache.parties = { at: Date.now(), data };
          setAccountGroupOptions(data);
        })
        .catch(() => {})
        .finally(() => isMounted && setLoadingAccountGroups(false));
    }

    // 3) Sub processes (ek hi baar, filter client-side)
    if (cache.subProcesses) setAllSubProcesses(cache.subProcesses.data);
    if (!isFresh(cache.subProcesses)) {
      if (!cache.subProcesses) setLoadingSubProcesses(true);
      Get("sub-process/list", fyParams, false)
        .then((response: any) => {
          if (!isMounted || !response?.data?.success) return;
          const list: any[] = response.data.data || [];
          const data: SubProcessRow[] = list
            .filter((s) => s.status === "Active")
            .map((s) => ({
              processId: String(s.processId),
              id: String(s.id),
              label: s.subProcessName,
            }));
          cache.subProcesses = { at: Date.now(), data };
          setAllSubProcesses(data);
        })
        .catch(() => {})
        .finally(() => isMounted && setLoadingSubProcesses(false));
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  // ---- Email uniqueness ka lightweight client-side check ----
  // (Server final validation karega hi.)
  // Mobile number ka uniqueness check hata diya gaya hai (same number allowed).
  const checkUnique = async (email: string) => {
    setChecking(true);
    try {
      const response = await Get("master/employee/list", {}, false);
      if (response.data?.success) {
        const allEmployees: any[] = response.data.data || [];
        const emailTaken = allEmployees.some(
          (e) =>
            e.email?.trim().toLowerCase() === email.trim().toLowerCase() &&
            String(e.employeeId) !== String(employee?.id || ""),
        );
        return { emailTaken };
      }
      return { emailTaken: false };
    } catch (error) {
      return { emailTaken: false }; // fail-open; server enforce karega
    } finally {
      setChecking(false);
    }
  };

const onSubmit = async (data: EmployeeFormValues) => {
  const party = accountGroupOptions.find(
    (p) => p.id === String((data as any).accountId),
  );

  // Production me sirf Process select hua ho tab name/mobile party se aayenge
  const isProcess = isProduction && !!data.processId;

  const finalData: EmployeeFormValues = isProcess
    ? {
        ...data,
        roleId: "",
        processId: data.processId || "",
        subProcessId: data.subProcessId || "",
        employeeName: party?.label || data.employeeName || "",
        mobileNumber: party?.mobile || "",
        alternateNumber: "",
      }
    : { ...data, processId: "", subProcessId: "" };

  const { emailTaken } = await checkUnique(finalData.email);

  let hasError = false;

  if (emailTaken) {
    setError("email", {
      type: "manual",
      message: "Email already exists. Please enter a different email.",
    });
    hasError = true;
  }
  if (!isEditing && data.password !== data.confirmPassword) {
    setError("confirmPassword", {
      type: "manual",
      message: "Passwords do not match",
    });
    hasError = true;
  }
  if (hasError) return;

  const { confirmPassword, ...rest } = finalData;
  onSave({ ...rest, id: employee?.id || "" } as Employee);
  handleClose();
};


// Party: Contractor Manager (non-production) ya Production me Process select ho
const needsParty = isContractorManager || isProcessSelected;

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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="dark:border-dark-500 bg-primary-600 flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
            <h3 className="text-lg font-semibold text-white">
              {isEditing ? "Edit Employee" : "Add Employee"}
            </h3>
            <Button
              onClick={handleClose}
              variant="flat"
              isIcon
              className="size-6 rounded-full"
            >
              <XMarkIcon className="size-4.5 text-white" />
            </Button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {/* Department */}
              <Controller
                control={control}
                name="department"
                rules={{ required: "Department is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={departmentOptions}
                    value={
                      departmentOptions.find((item) => item.id === value) ||
                      null
                    }
                    onChange={(item) => {
                      onChange(item.id);
                      setValue("roleId", "");
                      setValue("processId", "");
                      setValue("subProcessId", "");
                      setValue("accountId" as any, "");
                    }}
                    label="Department"
                    placeholder="Select department"
                    displayField="label"
                    error={errors.department?.message}
                    {...rest}
                  />
                )}
              />

              {/* Branch */}
              <Controller
                control={control}
                name="branch"
                rules={{ required: "Branch is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={branchOptions}
                    value={
                      branchOptions.find((item) => item.id === value) ||
                      branchOptions[0]
                    }
                    onChange={(item) => onChange(item.id)}
                    label="Branch"
                    placeholder="Select branch"
                    displayField="label"
                    error={errors.branch?.message}
                    {...rest}
                  />
                )}
              />

              {/* Role: Production me = processes + role table ke (non-process) roles, baaki me roles */}
              {isProduction ? (
                <Controller
                  control={control}
                  name="roleId"
                
                  render={() => (
                    <Combobox
                      data={productionRoleOptions}
                      value={
                        productionRoleOptions.find(
                          (item) => item.id === selectedProductionRoleValue,
                        ) || null
                      }
                    onChange={(item: Option) => {
  const picked = String(item?.id || "");
  if (picked.startsWith("p:")) {
    // process select hua
    setValue("processId", picked.slice(2));
    setValue("roleId", "", { shouldValidate: true });
  } else if (picked.startsWith("r:")) {
    // role select hua
    setValue("roleId", picked.slice(2), {
      shouldValidate: true,
    });
    setValue("processId", "");
  } else {
    setValue("processId", "");
    setValue("roleId", "", { shouldValidate: true });
  }
  // har case me sub process aur party reset
  setValue("subProcessId", "");
  setValue("accountId" as any, "");
}}
                      label="Role"
                      placeholder={
                        loadingProcesses && processOptions.length === 0
                          ? "Loading..."
                          : "Select role"
                      }
                      displayField="label"
                      searchFields={["label"]}
                      error={(errors.roleId?.message as string) || undefined}
                    />
                  )}
                />
              ) : (
                <Controller
                  control={control}
                  name="roleId"
                  rules={{ required: "Role is required" }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Listbox
                      data={roleOptions}
                      value={
                        roleOptions.find(
                          (item) => item.id === String(value ?? ""),
                        ) || null
                      }
                      onChange={(item) => {
                        onChange(item.id);
                        // Role badalne par party reset karo
                        setValue("accountId" as any, "");
                      }}
                      label="Role"
                      placeholder="Select role"
                      displayField="label"
                      error={errors.roleId?.message}
                      inputProps={{ disabled: !selectedDepartment }}
                      {...rest}
                    />
                  )}
                />
              )}

              {/* Sub Process: sirf jab process select ho aur uske sub process bane ho */}
              {isProduction &&
                selectedProcessId &&
                (loadingSubProcesses || subProcessOptions.length > 0) && (
                  <Controller
                    control={control}
                    name="subProcessId"
                    rules={{ required: "Sub Process is required" }}
                    render={({ field: { value, onChange } }) => (
                      <Combobox
                        data={subProcessOptions}
                        value={
                          subProcessOptions.find(
                            (item) => item.id === String(value ?? ""),
                          ) || null
                        }
                        onChange={(item: Option) => onChange(item?.id || "")}
                        label="Sub Process"
                        placeholder={
                          loadingSubProcesses && subProcessOptions.length === 0
                            ? "Loading..."
                            : "Select sub process"
                        }
                        displayField="label"
                        searchFields={["label"]}
                        error={errors.subProcessId?.message}
                      />
                    )}
                  />
                )}

              {/* Select Party: Contractor Manager ya Production */}
              {needsParty && (
                <Controller
                  control={control}
                  name={"accountId" as any}
                  rules={{ required: "Party is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Combobox
                      data={accountGroupOptions}
                      value={
                        accountGroupOptions.find(
                          (item) => item.id === String(value ?? ""),
                        ) || null
                      }
                      onChange={(item: AccountGroupOption) =>
                        onChange(item?.id || "")
                      }
                      label="Select Party"
                      placeholder={
                        loadingAccountGroups && accountGroupOptions.length === 0
                          ? "Loading..."
                          : "Select party"
                      }
                      displayField="label"
                      searchFields={["label"]}
                      error={(errors as any).accountId?.message}
                    />
                  )}
                />
              )}

              {/* Production me Employee Name / Mobile / Alternate hide */}
         {!isProcessSelected && (
                <>
                  <Input
                    {...register("employeeName", {
                      required: "Employee name is required",
                    })}
                    label="Employee Name"
                    placeholder="Enter employee name"
                    error={errors.employeeName?.message}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      {...register("mobileNumber", {
                        required: "Mobile number is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Mobile number must be 10 digits",
                        },
                        onChange: () => clearErrors("mobileNumber"),
                      })}
                      label="Mobile Number"
                      placeholder="Enter mobile number"
                      error={errors.mobileNumber?.message}
                    />
                    <Input
                      {...register("alternateNumber", {
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Alternate number must be 10 digits",
                        },
                      })}
                      label="Alternate Number"
                      placeholder="Enter alternate number"
                      error={errors.alternateNumber?.message}
                    />
                  </div>
                </>
              )}

              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter a valid email",
                  },
                  onChange: () => clearErrors("email"),
                })}
                label="Email"
                type="email"
                placeholder="Enter email"
                error={errors.email?.message}
              />

              <Input
                {...register("password", {
                  required: isEditing ? false : "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                label={isEditing ? "New Password" : "Password"}
                type="password"
                placeholder="Enter password"
                error={errors.password?.message}
                disabled={checking}
              />

              <Input
                {...register("confirmPassword", {
                  validate: (value, formValues) =>
                    (!formValues.password && !value) ||
                    value === formValues.password ||
                    "Passwords do not match",
                })}
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                error={errors.confirmPassword?.message}
              />
            </div>
            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary" disabled={checking}>
                {checking ? "Checking..." : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}