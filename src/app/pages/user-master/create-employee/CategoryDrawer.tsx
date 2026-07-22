import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Fragment, useState } from "react";

import { Listbox } from "@/components/shared/form/StyledListbox";
import { Button, Input } from "@/components/ui";
import { Get } from "@/ApiHelper";
import { departmentOptions, branchOptions } from "./options";
import { Employee } from "./data";

interface RoleOption {
  id: string;
  label: string;
  department: string;
}

interface EmployeeFormValues extends Employee {
  confirmPassword: string;
}

interface EmployeeDrawerProps {
  isOpen: boolean;
  close: () => void;
  employee: Employee | null;
  roles: RoleOption[];
  onSave: (employee: Employee) => void;
}

export function EmployeeDrawer({
  isOpen,
  close,
  employee,
  roles,
  onSave,
}: EmployeeDrawerProps) {
  const [checking, setChecking] = useState(false);
  const isEditing = Boolean(employee?.id);

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
    values: employee ? { ...employee, confirmPassword: "" } : undefined,
  });

  const selectedDepartment = watch("department");
  const roleOptions = roles
    .filter((item) => item.department === selectedDepartment)
    .map((item) => ({ id: item.id, label: item.label }));

  const handleClose = () => {
    reset();
    clearErrors();
    close();
  };

  // ---- Mobile/email uniqueness ka lightweight client-side check ----
  // (Server final validation karega hi.)
  const checkUnique = async (mobileNumber: string, email: string) => {
    setChecking(true);
    try {
      const response = await Get("master/employee/list", {}, false);
      if (response.data?.success) {
        const allEmployees: any[] = response.data.data || [];
        const mobileTaken = allEmployees.some(
          (e) =>
            e.mobileNumber?.trim() === mobileNumber.trim() &&
            String(e.employeeId) !== String(employee?.id || "")
        );
        const emailTaken = allEmployees.some(
          (e) =>
            e.email?.trim().toLowerCase() === email.trim().toLowerCase() &&
            String(e.employeeId) !== String(employee?.id || "")
        );
        return { mobileTaken, emailTaken };
      }
      return { mobileTaken: false, emailTaken: false };
    } catch (error) {
      return { mobileTaken: false, emailTaken: false }; // fail-open; server enforce karega
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    const { mobileTaken, emailTaken } = await checkUnique(data.mobileNumber, data.email);

    let hasError = false;
    if (mobileTaken) {
      setError("mobileNumber", {
        type: "manual",
        message: "Mobile number already exists. Please enter a different number.",
      });
      hasError = true;
    }
    if (emailTaken) {
      setError("email", {
        type: "manual",
        message: "Email already exists. Please enter a different email.",
      });
      hasError = true;
    }
    if (!isEditing && data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      hasError = true;
    }
    if (hasError) return;

    const { confirmPassword, ...rest } = data;
    onSave({ ...rest, id: employee?.id || "" });
    handleClose();
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
          className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white transition-transform duration-200"
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="text-lg font-semibold text-white">
              {isEditing ? "Edit Employee" : "Add Employee"}
            </h3>
            <Button onClick={handleClose} variant="flat" isIcon className="size-6 rounded-full">
              <XMarkIcon className="size-4.5 text-white" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex grow flex-col overflow-hidden">
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              <Controller
                control={control}
                name="department"
                rules={{ required: "Department is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={departmentOptions}
                    value={departmentOptions.find((item) => item.id === value) || null}
                    onChange={(item) => {
                      onChange(item.id);
                      setValue("roleId", "");
                    }}
                    label="Department"
                    placeholder="Select department"
                    displayField="label"
                    error={errors.department?.message}
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="branch"
                rules={{ required: "Branch is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={branchOptions}
                    value={branchOptions.find((item) => item.id === value) || branchOptions[0]}
                    onChange={(item) => onChange(item.id)}
                    label="Branch"
                    placeholder="Select branch"
                    displayField="label"
                    error={errors.branch?.message}
                    {...rest}
                  />
                )}
              />

              <Controller
                control={control}
                name="roleId"
                rules={{ required: "Role is required" }}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Listbox
                    data={roleOptions}
                    value={roleOptions.find((item) => item.id === value) || null}
                    onChange={(item) => onChange(item.id)}
                    label="Role"
                    placeholder="Select role"
                    displayField="label"
                    error={errors.roleId?.message}
                    inputProps={{ disabled: !selectedDepartment }}
                    {...rest}
                  />
                )}
              />

              <Input
                {...register("employeeName", { required: "Employee name is required" })}
                label="Employee Name"
                placeholder="Enter employee name"
                error={errors.employeeName?.message}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    pattern: { value: /^[0-9]{10}$/, message: "Mobile number must be 10 digits" },
                    onChange: () => clearErrors("mobileNumber"),
                  })}
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  error={errors.mobileNumber?.message}
                />
                <Input
                  {...register("alternateNumber", {
                    pattern: { value: /^[0-9]{10}$/, message: "Alternate number must be 10 digits" },
                  })}
                  label="Alternate Number"
                  placeholder="Enter alternate number"
                  error={errors.alternateNumber?.message}
                />
              </div>

              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
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
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
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
            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
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