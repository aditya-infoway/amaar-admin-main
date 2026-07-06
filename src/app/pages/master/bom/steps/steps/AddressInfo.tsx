import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  PlusIcon,
  TrashIcon,
  FolderPlusIcon,
  DocumentTextIcon,
  CircleStackIcon
} from "@heroicons/react/24/outline";

import { Button, Input } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";

export interface ExcellChildItem {
  name: string;
  type: "item";
  quantity: number;
  cost: number;
}

export interface ExcellParentItem {
  name: string;
  type: "assembly" | "item";
  quantity: number;
  cost: number;
  children: ExcellChildItem[];
}

export interface ExcellBOMFormType {
  bom: ExcellParentItem[];
}

interface AddressInfoProps {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function AddressInfo({ setCurrentStep }: AddressInfoProps) {
  const kycFormCtx = useKYCFormContext();

  const currentValues = kycFormCtx.state.formData.addressInfo as unknown as ExcellBOMFormType;

  const { register, control, handleSubmit, watch, setValue } = useForm<ExcellBOMFormType>({
    defaultValues: currentValues || {
      bom: [
        {
          name: "Axle Shaft Assembly",
          type: "assembly",
          quantity: 1,
          cost: 0,
          children: [
            { name: "Axle Shaft", type: "item", quantity: 2, cost: 4500 },
            { name: "Bearing Hub", type: "item", quantity: 2, cost: 1800 },
            { name: "Oil Seal", type: "item", quantity: 2, cost: 350 },
          ],
        },
        {
          name: "Brake Drum Unit",
          type: "assembly",
          quantity: 2,
          cost: 0,
          children: [
            { name: "Brake Drum", type: "item", quantity: 1, cost: 2400 },
            { name: "Brake Shoe Set", type: "item", quantity: 1, cost: 1200 },
          ],
        },
        {
          name: "Mud Guard",
          type: "item",
          quantity: 2,
          cost: 950,
          children: [],
        },
        {
          name: "Tool Box",
          type: "item",
          quantity: 1,
          cost: 3200,
          children: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bom",
  });

  const onSubmit = (data: ExcellBOMFormType) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { addressInfo: data as any },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { addressInfo: { isDone: true } },
    });
    setCurrentStep(2);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
    }
  };

  const addSubItem = (parentIndex: number) => {
    const currentBom = watch("bom");
    const parent = currentBom[parentIndex];
    const updatedChildren = [...(parent.children || [])];
    updatedChildren.push({ name: "", type: "item", quantity: 1, cost: 0 });
    setValue(`bom.${parentIndex}.children`, updatedChildren);
  };

  const removeSubItem = (parentIndex: number, childIndex: number) => {
    const currentBom = watch("bom");
    const parent = currentBom[parentIndex];
    const updatedChildren = [...(parent.children || [])];
    updatedChildren.splice(childIndex, 1);
    setValue(`bom.${parentIndex}.children`, updatedChildren);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} autoComplete="off" className="w-full mx-auto px-0 sm:px-4">
      {/* Action Buttons Top Bar */}
      <div className="my-4 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3 dark:border-dark-500">
        <Button
          type="button"
          variant="outlined"
          onClick={() => append({ name: "", type: "assembly", quantity: 1, cost: 0, children: [] })}
          className="flex items-center gap-1 text-xs py-1 h-8 border border-gray-300 dark:border-dark-600"
        >
          <FolderPlusIcon className="h-3.5 w-3.5 text-amber-500" /> Add Assembly
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => append({ name: "", type: "item", quantity: 1, cost: 0, children: [] })}
          className="flex items-center gap-1 text-xs py-1 h-8 border border-gray-300 dark:border-dark-600"
        >
          <PlusIcon className="h-3.5 w-3.5 text-blue-500" /> Add Standalone Item
        </Button>
      </div>

      {/* Form Card Content */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/30 p-2 sm:p-4 dark:border-dark-500 dark:bg-dark-900/10 min-h-[400px]">
        <div className="relative pl-2 sm:pl-3 space-y-3 before:absolute before:left-5 sm:before:left-6 before:top-0 before:bottom-3 before:w-0.5 before:border-l before:border-dashed before:border-gray-300 dark:before:border-dark-600">
          {fields.map((field, parentIndex) => {
            const currentItem = watch(`bom.${parentIndex}`) || field;
            const isAssembly = currentItem.type === "assembly";

            return (
              <div key={field.id} className="relative">
                {/* Horizontal branch line connection */}
                <div className="absolute -left-2 sm:-left-3 top-5 w-2 sm:w-3 border-t border-dashed border-gray-300 dark:border-dark-600" />

                {/* Parent Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm transition-all hover:border-gray-300 dark:bg-dark-800 dark:border-dark-600">

                  {/* Left Side: Icon, Name Input and Action */}
                  <div className="flex items-start gap-2 flex-1 w-full">
                    {isAssembly ? (
                      <CircleStackIcon className="h-4 w-4 text-amber-500 mt-2 flex-shrink-0" />
                    ) : (
                      <DocumentTextIcon className="h-4 w-4 text-blue-500 mt-2 flex-shrink-0" />
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 w-full max-w-md">
                      <Input
                        {...register(`bom.${parentIndex}.name` as const)}
                        placeholder={isAssembly ? "Assembly Name (e.g. Axle Shaft Assembly)" : "Item Name (e.g. Brake Drum)"}
                        className="font-medium bg-transparent border-none shadow-none focus-visible:ring-1 px-1 h-8 text-sm w-full"
                      />

                      {isAssembly && (
                        <button
                          type="button"
                          onClick={() => addSubItem(parentIndex)}
                          className="flex items-center justify-center gap-0.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 px-2 py-1 sm:py-0.5 rounded transition-all shadow-sm flex-shrink-0 w-24 sm:w-auto"
                        >
                          <PlusIcon className="h-3 w-3 stroke-[2.5]" /> Sub-item
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Qty, Cost & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-none pt-2 sm:pt-0 border-gray-100 w-full sm:w-auto">
                    {!isAssembly && (
                      <div className="flex flex-row items-center gap-2 flex-1 sm:flex-initial">
                        <div className="w-full sm:w-24 flex items-center gap-1">
                          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">QTY:</span>
                          <Input
                            type="number"
                            {...register(`bom.${parentIndex}.quantity` as const, { valueAsNumber: true })}
                            className="h-7 text-xs px-1.5 text-center bg-gray-50/50 w-full"
                          />
                        </div>
                        <div className="w-full sm:w-32 flex items-center gap-1">
                          <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">COST:</span>
                          <Input
                            type="number"
                            {...register(`bom.${parentIndex}.cost` as const, { valueAsNumber: true })}
                            placeholder="0"
                            className="h-7 text-xs px-1.5 bg-gray-50/50 w-full"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => remove(parentIndex)}
                      className="p-1 text-gray-400 hover:text-rose-500 rounded hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ml-auto sm:ml-0"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Nested Sub-items (Children) */}
                {isAssembly && currentItem.children && currentItem.children.length > 0 && (
                  <div className="mt-1.5 ml-4 sm:ml-8 pl-3 sm:pl-5 relative space-y-1.5 border-l border-solid border-gray-200 dark:border-dark-700">
                    {currentItem.children.map((_, childIndex) => (
                      <div
                        key={childIndex}
                        className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/70 p-2 sm:px-3 sm:py-1 rounded-md border border-gray-200/60 dark:bg-dark-900/40 dark:border-dark-700"
                      >
                        <div className="absolute -left-3 sm:-left-5 top-4 w-3 sm:w-5 border-t border-solid border-gray-200 dark:border-dark-700" />

                        {/* Sub-item Header/Input */}
                        <div className="flex items-center gap-1.5 flex-1 w-full">
                          <DocumentTextIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <Input
                            {...register(`bom.${parentIndex}.children.${childIndex}.name` as const)}
                            placeholder="Child Item (e.g. Bolt)"
                            className="h-7 bg-transparent border-none shadow-none focus-visible:ring-1 px-1 text-xs w-full max-w-xs"
                          />
                        </div>

                        {/* Sub-item Qty, Cost & Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-none pt-1.5 sm:pt-0 border-gray-200/40">
                          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                            <div className="w-full sm:w-24 flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 uppercase font-bold whitespace-nowrap">QTY:</span>
                              <Input
                                type="number"
                                {...register(`bom.${parentIndex}.children.${childIndex}.quantity` as const, { valueAsNumber: true })}
                                className="h-6 text-xs px-1 text-center bg-white w-full"
                              />
                            </div>
                            <div className="w-full sm:w-32 flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 uppercase font-bold whitespace-nowrap">COST:</span>
                              <Input
                                type="number"
                                {...register(`bom.${parentIndex}.children.${childIndex}.cost` as const, { valueAsNumber: true })}
                                className="h-6 text-xs px-1 bg-white w-full"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeSubItem(parentIndex, childIndex)}
                            className="p-0.5 text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-5 flex justify-end space-x-2 border-t border-gray-100 pt-3 dark:border-dark-500">
        <Button
          type="button"
          variant="outlined"
          onClick={() => setCurrentStep(0)}
          className="px-4 h-8 text-xs border border-gray-300 dark:border-dark-600"
        >
          Back
        </Button>
        <Button type="submit" className="px-5 h-8 text-xs" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}