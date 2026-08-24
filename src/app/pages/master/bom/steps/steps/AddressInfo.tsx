import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  PlusIcon,
  TrashIcon,
  FolderPlusIcon,
  DocumentTextIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

import { Button, Input } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";

export interface ExcellParentItem {
  name: string;
  type: "assembly" | "item";
  quantity: number;
  cost: number;
  children: ExcellParentItem[];
}

export interface ExcellBOMFormType {
  bom: ExcellParentItem[];
}

interface AddressInfoProps {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function AddressInfo({ setCurrentStep }: AddressInfoProps) {
  const kycFormCtx = useKYCFormContext();

  const currentValues = kycFormCtx.state.formData
    .addressInfo as unknown as ExcellBOMFormType;

  const { register, control, handleSubmit, watch, setValue } =
    useForm<ExcellBOMFormType>({
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

  const addChild = (path: string) => {
    const current = watch(path as any) || [];

    setValue(path as any, [
      ...current,
      {
        name: "",
        type: "item",
        quantity: 1,
        cost: 0,
        children: [],
      },
    ]);
  };

  const removeChild = (path: string, index: number) => {
    const current = watch(path as any) || [];

    const updated = [...current];
    updated.splice(index, 1);

    setValue(path as any, updated);
  };

  const renderItem = (
    item: ExcellParentItem,
    path: string,
    index: number,
  ): React.ReactNode => {
    const itemPath = `${path}.${index}`;
    const childrenPath = `${itemPath}.children`;

    return (
      <div key={itemPath} className="relative min-w-[720px]">
        {/* ROW */}
        <div className="flex min-w-[720px] flex-col justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          {/* NAME + ICON + PLUS */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {item.type === "assembly" ? (
              <CircleStackIcon className="h-4 w-4 flex-shrink-0 text-amber-500" />
            ) : (
              <DocumentTextIcon className="h-4 w-4 flex-shrink-0 text-blue-500" />
            )}

            <Input
              {...register(`${itemPath}.name` as any)}
              placeholder={
                item.type === "assembly" ? "Assembly Name" : "Child Item"
              }
              className="h-8 min-w-[250px] flex-1 border-none bg-transparent px-1 text-sm font-medium shadow-none"
            />

            {/* ONE + BUTTON */}
            <button
              type="button"
              onClick={() => addChild(childrenPath)}
              className="border-primary-300 bg-primary-50 text-primary-600 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border"
              title="Add child"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* QTY / COST / DELETE */}
          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-400">QTY:</span>

              <Input
                type="number"
                {...register(`${itemPath}.quantity` as any, {
                  valueAsNumber: true,
                })}
                className="h-7 w-20 text-center text-xs"
              />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-400">COST:</span>

              <Input
                type="number"
                {...register(`${itemPath}.cost` as any, {
                  valueAsNumber: true,
                })}
                className="h-7 w-28 text-xs"
              />
            </div>

            {/* DELETE */}
            <button
              type="button"
              onClick={() => {
                if (path === "bom") {
                  remove(index);
                } else {
                  removeChild(path, index);
                }
              }}
              className="p-1 text-gray-400 hover:text-rose-500"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CHILDREN */}
        {item.children?.length > 0 && (
          <div className="mt-2 ml-5 space-y-2 border-l border-dashed border-gray-300 pl-4 sm:ml-8 sm:pl-5">
            {item.children.map((child, childIndex) =>
              renderItem(child, childrenPath, childIndex),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      className="mx-auto w-full px-0 sm:px-4"
    >
      {/* Action Buttons Top Bar */}
      <div className="dark:border-dark-500 my-4 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
        <Button
          type="button"
          variant="outlined"
          onClick={() =>
            append({
              name: "",
              type: "assembly",
              quantity: 1,
              cost: 0,
              children: [],
            })
          }
          className="dark:border-dark-600 flex h-8 items-center gap-1 border border-gray-300 py-1 text-xs"
        >
          <FolderPlusIcon className="h-3.5 w-3.5 text-amber-500" /> Add Assembly
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() =>
            append({
              name: "",
              type: "item",
              quantity: 1,
              cost: 0,
              children: [],
            })
          }
          className="dark:border-dark-600 flex h-8 items-center gap-1 border border-gray-300 py-1 text-xs"
        >
          <PlusIcon className="h-3.5 w-3.5 text-blue-500" /> Add Standalone Item
        </Button>
      </div>

      {/* Form Card Content */}
      <div className="dark:border-dark-500 dark:bg-dark-900/10 h-[400px] overflow-auto rounded-xl border border-gray-200 bg-gray-50/30 p-2 sm:p-4">
        <div className="relative min-w-max space-y-3 pl-2 sm:pl-3">
          {fields.map((field, parentIndex) => {
            const currentItem = watch(`bom.${parentIndex}`) || field;

            return renderItem(
              currentItem as ExcellParentItem,
              "bom",
              parentIndex,
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="dark:border-dark-500 mt-5 flex justify-end space-x-2 border-t border-gray-100 pt-3">
        <Button
          type="button"
          variant="outlined"
          onClick={() => setCurrentStep(0)}
          className="dark:border-dark-600 h-8 border border-gray-300 px-4 text-xs"
        >
          Back
        </Button>
        <Button type="submit" className="h-8 px-5 text-xs" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}
