import { useMemo, useState } from "react";
import { Combobox } from "@headlessui/react";
import { Check, ChevronDown, Search } from "lucide-react";
import WorkProcessStepper from "./WorkProcessStepper";
import { defaultProcessSteps, dummyWorkOrders } from "./dummyData";
import type { WorkOrderOption, WorkProcessStep } from "./types";

export default function WorkProccess() {
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<WorkOrderOption | null>(null);
  const [processMap, setProcessMap] = useState<Record<string, WorkProcessStep[]>>({});

  const filteredOrders =
    query === ""
      ? dummyWorkOrders
      : dummyWorkOrders.filter((order) =>
          `${order.workOrderId} ${order.name} ${order.model}`
            .toLowerCase()
            .includes(query.toLowerCase())
        );

  const currentSteps: WorkProcessStep[] = useMemo(() => {
    if (!selectedOrder) return [];
    return (
      processMap[selectedOrder.workOrderId] ??
      defaultProcessSteps.map((step) => ({ ...step }))
    );
  }, [selectedOrder, processMap]);

  const handleSelectOrder = (order: WorkOrderOption | null) => {
    setSelectedOrder(order);
    if (order && !processMap[order.workOrderId]) {
      setProcessMap((prev) => ({
        ...prev,
        [order.workOrderId]: defaultProcessSteps.map((step) => ({ ...step })),
      }));
    }
  };

  const handleToggleStatus = (stepId: number) => {
    if (!selectedOrder) return;

    setProcessMap((prev) => {
      const steps = prev[selectedOrder.workOrderId] ?? defaultProcessSteps;
      const updatedSteps = steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              status: (step.status === "Pending" ? "Completed" : "Pending") as WorkProcessStep["status"],
            }
          : step
      );

      // TODO: persist to backend once API is ready
      // await apihelper.patch(`/work-order/${selectedOrder.workOrderId}/process/${stepId}`, {
      //   status: updatedSteps.find((s) => s.id === stepId)?.status,
      // });

      return { ...prev, [selectedOrder.workOrderId]: updatedSteps };
    });
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-800">Work Proccess</h2>

      <div className="mb-8 max-w-md">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Select Work Order
        </label>
        <Combobox value={selectedOrder} onChange={handleSelectOrder}>
          <div className="relative">
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-300 bg-white text-left focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Combobox.Input
                className="w-full border-none py-2 pl-9 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-0"
                placeholder="ID | Name | Model"
                displayValue={(order: WorkOrderOption | null) =>
                  order ? `${order.workOrderId} | ${order.name} | ${order.model}` : ""
                }
                onChange={(event) => setQuery(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Combobox.Button>
            </div>

            {filteredOrders.length > 0 && (
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none">
                {filteredOrders.map((order) => (
                  <Combobox.Option
                    key={order.id}
                    value={order}
                    className={({ active }) =>
                      `relative cursor-pointer select-none px-3 py-2 ${
                        active ? "bg-blue-50 text-blue-700" : "text-gray-900"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <div className="flex items-center justify-between">
                        <span>
                          {order.workOrderId} | {order.name} | {order.model}
                        </span>
                        {selected && <Check className="h-4 w-4 text-blue-600" />}
                      </div>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>
      </div>

      {selectedOrder ? (
        <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <WorkProcessStepper steps={currentSteps} onToggleStatus={handleToggleStatus} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Please select a work order to view its process status.
        </p>
      )}
    </div>
  );
}