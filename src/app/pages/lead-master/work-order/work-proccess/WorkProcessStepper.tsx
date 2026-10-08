import clsx from "clsx";
import { useEffect, useState, type CSSProperties } from "react";
import {
  Flame,
  PaintBucket,
  Package,
  ClipboardCheck,
  Scissors,
  Truck,
  Wind,
  Check,
} from "lucide-react";

import type { WorkProcessStep } from "./types";

interface WorkProcessStepperProps {
  steps: WorkProcessStep[];
}

const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  material_availability: Package,
  material_cutting: Scissors,
  welding: Flame,
  blasting: Wind,
  paint: PaintBucket,
  qc: ClipboardCheck,
  ready_for_dispatch: Truck,
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return `${d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} ${d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
};

const formatDuration = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

export default function WorkProcessStepper({ steps }: WorkProcessStepperProps) {
  // running work ka live timer
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <ol
      className="steps line-space is-vertical w-full text-xs sm:text-sm"
      style={{ "--size": "2.75rem", "--line": "0.5rem" } as CSSProperties}
    >
      {steps.map((step, i) => {
        const isCompleted = step.status === "Completed";
        const StepIcon = stepIcons[step.key] ?? Package;
        const stage = step.stage;
        const showDetails = i >= 1; // Material Cutting se aage

        const workTime = stage?.startTime
          ? formatDuration(
              (stage.endTime ? new Date(stage.endTime).getTime() : now) -
                new Date(stage.startTime).getTime(),
            )
          : "-";

        return (
          <li
            key={step.id}
            className={clsx(
              "step w-full items-start",
              showDetails ? "pb-6 last:pb-0" : "pb-12 last:pb-0",
              isCompleted
                ? "before:bg-primary-500"
                : "dark:before:bg-dark-500 before:bg-gray-200",
            )}
          >
            <span
              className={clsx(
                "step-header shrink-0 rounded-full dark:text-white",
                isCompleted
                  ? "bg-primary-600 dark:bg-primary-500 dark:ring-offset-dark-900 text-white ring-offset-[3px] ring-offset-gray-100"
                  : "dark:bg-dark-500 bg-gray-200 text-gray-950",
              )}
            >
              {isCompleted ? (
                <Check className="size-5" strokeWidth={2.5} />
              ) : (
                <StepIcon className="size-4.5 opacity-80" />
              )}
            </span>

          <div
  className={clsx(
    "w-full min-w-0 flex-1 text-start ltr:ml-4 rtl:mr-4",
    showDetails &&
      "dark:border-dark-500 -mt-2 border-y border-gray-200 py-3",
  )}
>
              <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                {/* Number + Title + Status (pehle jaisa) */}
                <div className="flex w-full shrink-0 gap-6 lg:w-96">
                  <span className="text-primary-500 mt-0.5 pr-4 text-2xl font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col justify-center">
                    <h3
                      className={clsx(
                        "text-base leading-tight font-medium",
                        isCompleted
                          ? "text-primary-600 dark:text-primary-400"
                          : "dark:text-dark-100 text-gray-800",
                      )}
                    >
                      {step.label}
                    </h3>

                    <span
                      className={clsx(
                        "mt-1 inline-flex items-center gap-1.5 text-xs font-medium",
                        isCompleted
                          ? "text-emerald-600"
                          : step.status === "In Progress"
                            ? "text-blue-600"
                            : "text-amber-600",
                      )}
                    >
                      <span
                        className={clsx(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          isCompleted
                            ? "bg-emerald-500"
                            : step.status === "In Progress"
                              ? "bg-blue-500"
                              : "bg-amber-500",
                        )}
                      />
                      {step.status}
                    </span>
                  </div>
                </div>

                {/* 3 columns: Manager (name+mobile) | Assign Date & Time | Work Time */}
                {showDetails && (
         <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                        Manager
                      </p>
                      <p className="dark:text-dark-50 text-sm font-semibold text-gray-800">
                        {stage?.employeeName || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stage?.employeeMobile   || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                        Assign Date &amp; Time
                      </p>
                      <p className="dark:text-dark-100 text-sm font-medium text-gray-700">
                        {formatDateTime(stage?.assignedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                        Work Time
                      </p>
                      <p className="dark:text-dark-50 text-sm font-semibold text-gray-800 tabular-nums">
                        {workTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
