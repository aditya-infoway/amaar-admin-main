import { Fragment, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { Button, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Employee } from "./data";

interface EmployeeDrawerProps {
  isOpen: boolean;
  close: () => void;
  employee: Employee | null;
  onSave: (employee: Employee) => void;
}

interface EmployeeFormValues {
  department: string;
  branch: string;
  role: string;
  employeeName: string;
  mobileNumber: string;
  alternateNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Department options
const departmentOptions = [
  { id: "sale", label: "Sale" },
  { id: "production", label: "Production" },
];

// Branch options
const branchOptions = [
  { id: "main-branch", label: "Main Branch" },
  { id: "branch-1", label: "Branch 1" },
  { id: "branch-2", label: "Branch 2" },
];

// Role options for each department
const roleOptions: Record<string, { id: string; label: string }[]> = {
  sale: [
    { id: "sale-manager", label: "Sale Manager" },
    { id: "sale-executive", label: "Sale Executive" },
    { id: "telecaller", label: "Telecaller" },
    { id: "accountant", label: "Accountant" },
    { id: "cashier", label: "Cashier" },
  ],
  production: [
    { id: "cutting", label: "Cutting" },
    { id: "welding", label: "Welding" },
    { id: "fitting", label: "Fitting" },
    { id: "blasting", label: "Blasting" },
    { id: "paint", label: "Paint" },
    { id: "washing", label: "Washing" },
    { id: "qc", label: "QC" },
    { id: "production-manager", label: "Production Manager" },
  ],
};

const getRolesForDepartment = (departmentId: string) => {
  return roleOptions[departmentId] || [];
};

const emptyFormValues: EmployeeFormValues = {
  department: "",
  branch: "",
  role: "",
  employeeName: "",
  mobileNumber: "",
  alternateNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function EmployeeDrawer({
  isOpen,
  close,
  employee,
  onSave,
}: EmployeeDrawerProps) {
  const isEditing = Boolean(employee?.id);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    defaultValues: emptyFormValues,
  });

  const selectedDepartment = watch("department");
  const roleOptionsForDepartment = getRolesForDepartment(selectedDepartment);

  useEffect(() => {
    if (employee && employee.id) {
      // Map employee data to form values
      // Assuming employee has these fields, if not, adjust accordingly
      reset({
        department: (employee as any).department || "",
        branch: employee.branch || "",
        role: employee.role || "",
        employeeName: employee.employeeName || "",
        mobileNumber: employee.mobileNumber || "",
        alternateNumber: employee.alternateNumber || "",
        email: employee.email || "",
        password: employee.password || "",
        confirmPassword: employee.password || "",
      });
    } else {
      reset(emptyFormValues);
    }
  }, [employee, reset]);

  const handleClose = () => {
    reset();
    close();
  };

  const onSubmit = handleSubmit((values) => {
    onSave({
      id: employee?.id || crypto.randomUUID(),
      // Map form values to employee fields
      // If Employee type doesn't have department, add it or use a different field
      ...(values as any),
      branch: values.branch,
      role: values.role,
      employeeName: values.employeeName,
      mobileNumber: values.mobileNumber,
      alternateNumber: values.alternateNumber,
      email: values.email,
      password: values.password,
      createdBy: employee?.createdBy || "Admin",
      createdType: employee?.createdType || "Manual",
      createdAt: employee?.createdAt || new Date().toISOString(),
    });
    handleClose();
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-100" onClose={handleClose}>
        {/* Backdrop */}
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

        {/* Drawer Panel */}
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5 bg-primary">
            <h3 className="text-lg font-semibold text-white">
              {isEditing ? "Edit Employee" : "Add Employee"}
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

          <form
            onSubmit={onSubmit}
            className="flex grow flex-col overflow-hidden"
          >
            <div className="hide-scrollbar grow space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {/* Department */}
              <Controller
                name="department"
                control={control}
                rules={{ required: "Department is required" }}
                render={({ field }) => (
                  <Listbox
                    label="Department"
                    error={errors.department?.message}
                    data={departmentOptions}
                    value={
                      departmentOptions.find((item) => item.id === field.value) ||
                      null
                    }
                    onChange={(item) => {
                      field.onChange(item.id);
                      setValue("role", "");
                    }}
                    placeholder="Select Department"
                    displayField="label"
                  />
                )}
              />

              {/* Branch */}
              <Controller
                name="branch"
                control={control}
                rules={{ required: "Branch is required" }}
                render={({ field }) => (
                  <Listbox
                    label="Branch"
                    error={errors.branch?.message}
                    data={branchOptions}
                    value={
                      branchOptions.find((item) => item.id === field.value) ||
                      null
                    }
                    onChange={(item) => field.onChange(item.id)}
                    placeholder="Select Branch"
                    displayField="label"
                  />
                )}
              />

              {/* Role */}
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Listbox
                    label="Role"
                    error={errors.role?.message}
                    data={roleOptionsForDepartment}
                    value={
                      roleOptionsForDepartment.find(
                        (item) => item.id === field.value,
                      ) || null
                    }
                    onChange={(item) => field.onChange(item.id)}
                    placeholder="Select Role"
                    displayField="label"
                    disabled={!selectedDepartment}
                  />
                )}
              />

              {/* Employee Name */}
              <Input
                label="Employee Name"
                required
                placeholder="Enter Employee Name"
                error={errors.employeeName?.message}
                {...register("employeeName", {
                  required: "Employee Name is required",
                })}
              />

              {/* Mobile Number */}
              <Input
                label="Mobile Number"
                required
                placeholder="Enter Mobile Number"
                error={errors.mobileNumber?.message}
                {...register("mobileNumber", {
                  required: "Mobile Number is required",
                })}
              />

              {/* Alternate Number */}
              <Input
                label="Alternate Number"
                required
                placeholder="Enter Alternate Number"
                error={errors.alternateNumber?.message}
                {...register("alternateNumber", {
                  required: "Alternate Number is required",
                })}
              />

              {/* Email */}
              <Input
                label="Email"
                required
                type="email"
                placeholder="Enter Email"
                error={errors.email?.message}
                {...register("email", { required: "Email is required" })}
              />

              {/* Password */}
              <Input
                label="Password"
                required
                type="password"
                placeholder="Enter Password"
                error={errors.password?.message}
                {...register("password", { required: "Password is required" })}
              />

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                required
                type="password"
                placeholder="Enter Confirm Password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value, formValues) =>
                    value === formValues.password || "Passwords do not match",
                })}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 px-4 py-4 dark:border-dark-500 sm:px-5">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {isEditing ? "Update Employee" : "Add Employee"}
              </Button>
            </div>
          </form>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}