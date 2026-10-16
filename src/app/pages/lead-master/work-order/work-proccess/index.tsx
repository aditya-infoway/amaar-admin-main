import { useEffect, useMemo, useState } from "react";

import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Get, toasterrormsg } from "@/ApiHelper";

import WorkProcessStepper from "./WorkProcessStepper";
import type {
  WorkOrderOption,
  WorkProcessStage,
} from "./types";

export default function WorkProccess() {
  const [workOrders, setWorkOrders] = useState<
    WorkOrderOption[]
  >([]);

  const [selectedOrder, setSelectedOrder] =
    useState<WorkOrderOption | null>(null);

  const [loading, setLoading] = useState(false);

  const [hasIndent, setHasIndent] = useState(false);

  // Which work order the indent check has finished for
  const [indentCheckedFor, setIndentCheckedFor] =
    useState<number | null>(null);

  // ============================================================
  // CHECK INDENT
  // ============================================================

  useEffect(() => {
    if (!selectedOrder) {
      setHasIndent(false);
      setIndentCheckedFor(null);
      return;
    }

    let cancelled = false;

    const checkIndent = async () => {
      let exists = false;

      try {
        const response = await Get(
          `indent/check/${selectedOrder.id}`,
          {},
          false,
        );

        if (response?.data?.success) {
          exists = Boolean(
            response.data.data?.exists,
          );
        }
      } catch (error) {
        console.error(
          "Indent check error:",
          error,
        );
      }

      if (cancelled) return;

      setHasIndent(exists);
      setIndentCheckedFor(
        selectedOrder.id,
      );
    };

    checkIndent();

    return () => {
      cancelled = true;
    };
  }, [selectedOrder]);

  // ============================================================
  // FETCH WORK ORDERS
  // ============================================================

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);

        const financialYearId =
          localStorage.getItem(
            "financialYearId",
          );

        const response = await Get(
          "workorder/list",
          financialYearId
            ? { financialYearId }
            : {},
          false,
        );

        if (
          response?.data?.success ||
          response?.data?.status === 200
        ) {
          const list =
            response?.data?.data || [];

          setWorkOrders(
            list.map((item: any) => ({
              id: Number(item.id),

              workOrderNo:
                item.workOrderNo || "",

              customerName:
                item.customerName || "",

              model:
                item.modelName ||
                item.model ||
                "",

              label: `${
                item.workOrderNo || "-"
              } | ${
                item.customerName || "-"
              } | ${
                item.modelName ||
                item.model ||
                "-"
              }`,

              // Old stages
              stages: item.stages || [],

              // Dynamic assigned processes
              processStages:
                item.processStages || [],
            })),
          );
        }
      } catch (error) {
        console.error(
          "Work Order list error:",
          error,
        );

        toasterrormsg(
          "Unable to load work orders.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  // ============================================================
  // DYNAMIC + STATIC PROCESS STAGES
  // ============================================================

  const currentStages: WorkProcessStage[] =
    useMemo(() => {
      if (!selectedOrder) return [];

      const dynamicStages =
        selectedOrder.processStages || [];

      /*
       * --------------------------------------------------------
       * 1. MATERIAL AVAILABILITY
       * --------------------------------------------------------
       *
       * Ye STATIC rahega.
       *
       * Indent hai => Completed
       * Indent nahi hai => Pending
       */

      const materialAvailability: WorkProcessStage =
        {
          stage: "material_availability",
          label: "Material Availability",
          order: 0,

          employeeId: "",
          employeeName: "",

          status: hasIndent
            ? "Completed"
            : "Pending",

          hasSubProcess: false,
          completedCount: hasIndent ? 1 : 0,
          totalCount: 1,
          subStages: [],
        };

      /*
       * --------------------------------------------------------
       * 2. DYNAMIC ASSIGNED PROCESSES
       * --------------------------------------------------------
       *
       * Sirf workorderassignment se aaye hue
       * processes yahan show honge.
       *
       * Example:
       *
       * Cutting
       * Welding
       * Painting
       *
       * Agar assigned nahi hai to show nahi hoga.
       */

      const dynamicProcessStages =
        dynamicStages.map(
          (stage, index) => ({
            ...stage,

            // Static Material Availability ke baad
            // dynamic processes start honge.
            order:
              Number(stage.order) ||
              index + 1,
          }),
        );

      /*
       * --------------------------------------------------------
       * 3. READY FOR DISPATCH
       * --------------------------------------------------------
       *
       * Ye bhi STATIC rahega.
       *
       * Saare dynamic processes Completed
       * hone ke baad Completed.
       *
       * Warna Pending.
       */

      const hasDynamicProcesses =
        dynamicProcessStages.length > 0;

      const allProcessesCompleted =
        hasDynamicProcesses &&
        dynamicProcessStages.every(
          (stage) =>
            stage.status === "Completed",
        );

      const readyForDispatch: WorkProcessStage =
        {
          stage: "ready_for_dispatch",

          label: "Ready For Dispatch",

          // Last process ke baad
          order:
            dynamicProcessStages.length + 1,

          employeeId: "",
          employeeName: "",

          status:
            allProcessesCompleted
              ? "Completed"
              : "Pending",

          hasSubProcess: false,

          completedCount:
            allProcessesCompleted
              ? 1
              : 0,

          totalCount: 1,

          subStages: [],
        };

      /*
       * Final sequence:
       *
       * Material Availability
       *        ↓
       * Dynamic assigned processes
       *        ↓
       * Ready For Dispatch
       */

      return [
        materialAvailability,
        ...dynamicProcessStages,
        readyForDispatch,
      ];
    }, [
      selectedOrder,
      hasIndent,
    ]);

  // ============================================================
  // SELECT WORK ORDER
  // ============================================================

  const handleSelectOrder = (
    value: any,
  ) => {
    const order: WorkOrderOption | null =
      Array.isArray(value)
        ? value[0] || null
        : value || null;

    setSelectedOrder(order);
  };

  // ============================================================
  // INDENT READY
  // ============================================================

  const indentReady =
    !!selectedOrder &&
    indentCheckedFor ===
      selectedOrder.id;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="p-6">
      {/* WORK ORDER DROPDOWN */}

      <div className="mb-8 max-w-md">
        <Combobox
          data={workOrders}
          displayField="label"
          value={selectedOrder}
          onChange={
            handleSelectOrder
          }
          placeholder="ID | Name | Model"
          label="Select Work Order"
          searchFields={[
            "workOrderNo",
            "customerName",
            "model",
          ]}
          disabled={loading}
        />
      </div>

      {/* WORK PROCESS */}

      {selectedOrder &&
      indentReady ? (
        <div className="dark:border-dark-500 dark:bg-dark-700 w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {currentStages.length >
          0 ? (
            <WorkProcessStepper
              stages={
                currentStages
              }
            />
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">
                No process has been
                assigned to this work
                order.
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          {loading
            ? "Loading work orders..."
            : selectedOrder
              ? "Loading process status..."
              : "Please select a work order to view its process status."}
        </p>
      )}
    </div>
  );
}