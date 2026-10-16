import clsx from "clsx";
import { useEffect, useState, type CSSProperties } from "react";
import {
  Check,
  Package,
  User as UserIcon,
  Phone as PhoneIcon,
  CalendarDays as CalendarIcon,
  Clock as ClockIcon,
} from "lucide-react";

import type { WorkProcessStage } from "./types";

interface WorkProcessStepperProps {
  stages: WorkProcessStage[];
}

/**
 * Work Process Stepper
 *
 * Dynamic structure:
 *
 * Process
 *   ├── Sub Process 1
 *   ├── Sub Process 2
 *   └── Sub Process 3
 *
 * Backend se jo processStages aayenge
 * wahi screen par show honge.
 *
 * Static stages:
 *   - Material Availability
 *   - Ready For Dispatch
 *
 * Static stages ke liye:
 *   - Manager nahi
 *   - Assign Date & Time nahi
 *   - Work Time nahi
 */

const splitDateTime = (value?: string | null) => {
  if (!value) {
    return {
      date: "-",
      time: "-",
    };
  }

  const d = new Date(value);

  if (isNaN(d.getTime())) {
    return {
      date: "-",
      time: "-",
    };
  }

  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),

    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const formatDuration = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));

  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return [d, h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

function TimeChip({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="border-primary-500/70 bg-primary-500/10 text-primary-600 dark:text-primary-400 flex size-9 items-center justify-center rounded-full border-2 text-xs font-semibold">
        {String(v).padStart(2, "0")}
      </div>

      <span className="mt-0.5 text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

function TimeChips({ value }: { value?: string | null }) {
  if (!value || value === "-") {
    return <span className="text-sm text-gray-400">-</span>;
  }

  const [d = 0, h = 0, m = 0, s = 0] = String(value)
    .split(":")
    .map((n) => parseInt(n, 10) || 0);

  return (
    <div className="flex items-center gap-1.5">
      {d > 0 && <TimeChip v={d} label="d" />}

      <TimeChip v={h} label="h" />

      <TimeChip v={m} label="m" />

      <TimeChip v={s} label="s" />
    </div>
  );
}

/**
 * Status text + dot
 *
 * Process aur sub-process dono ke liye.
 */
function StatusLabel({ status }: { status: string }) {
  const isCompleted = status === "Completed";

  const isRunning = status === "In Progress";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-medium",

        isCompleted
          ? "text-emerald-600"
          : isRunning
            ? "text-blue-600"
            : "text-amber-600",
      )}
    >
      <span
        className={clsx(
          "inline-block h-1.5 w-1.5 rounded-full",

          isCompleted
            ? "bg-emerald-500"
            : isRunning
              ? "bg-blue-500"
              : "bg-amber-500",
        )}
      />

      {status}
    </span>
  );
}

interface DetailSource {
  employeeName?: string;
  employeeMobile?: string;
  assignedAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

/**
 * Manager | Assign Date & Time | Work Time
 *
 * Ye sirf dynamic assigned process
 * aur sub-process ke liye use hoga.
 */
function StageDetails({
  data,
  now,
}: {
  data?: DetailSource | null;
  now: number;
}) {
  const workTime = data?.startTime
    ? formatDuration(
        (data.endTime ? new Date(data.endTime).getTime() : now) -
          new Date(data.startTime).getTime(),
      )
    : "-";

  const { date: assignedDate, time: assignedTime } = splitDateTime(
    data?.assignedAt,
  );

  return (
    <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
      {/* MANAGER */}
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
          Manager
        </p>

        <div className="flex items-center gap-2">
          <UserIcon className="size-4 text-gray-400" />

          <span className="dark:text-dark-50 text-sm font-semibold text-gray-800">
            {data?.employeeName || "-"}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <PhoneIcon className="size-4 text-gray-400" />

          <span className="text-xs text-gray-500">
            {data?.employeeMobile || "-"}
          </span>
        </div>
      </div>

      {/* ASSIGN DATE & TIME */}
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
          Assign Date &amp; Time
        </p>

        <p className="dark:text-dark-100 flex items-center gap-2 text-sm font-medium text-gray-700">
          <CalendarIcon className="size-3.5" />

          {assignedDate}
        </p>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <ClockIcon className="size-3.5" />

          <span>{assignedTime}</span>
        </div>
      </div>

      {/* WORK TIME */}
      <div>
        <p className="mb-1 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
          Work Time
        </p>

        <TimeChips value={workTime} />
      </div>
    </div>
  );
}

export default function WorkProcessStepper({
  stages,
}: WorkProcessStepperProps) {
  /**
   * Running work ka live timer.
   *
   * Agar kisi process/sub-process ka
   * endTime nahi hai aur startTime available
   * hai, to work time har second update hoga.
   */
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  /**
   * Safety:
   * Agar backend se null/undefined aaye
   * to UI crash nahi karegi.
   */
  const safeStages = Array.isArray(stages) ? stages : [];

  return (
    <ol
      className="steps line-space is-vertical w-full text-xs sm:text-sm"
      style={
        {
          "--size": "2.75rem",
          "--line": "0.5rem",
        } as CSSProperties
      }
    >
      {safeStages.map((stage, index) => {
        const isCompleted = stage.status === "Completed";

        const isRunning = stage.status === "In Progress";

        /**
         * Static stages:
         *
         * 1. Material Availability
         * 2. Ready For Dispatch
         *
         * Inke liye Manager,
         * Assign Date & Time,
         * Work Time nahi dikhana.
         */
        const isStaticStage =
          stage.stage === "material_availability" ||
          stage.stage === "ready_for_dispatch";

        /**
         * Dynamic process ke liye
         * details show honge.
         *
         * Static process ke liye
         * details hide honge.
         */
        const showDetails = !isStaticStage;

        const StepIcon = Package;

        const subStages = stage.subStages ?? [];

        const hasSubs = Boolean(stage.hasSubProcess) && subStages.length > 0;

        return (
          <li
            key={`${stage.order}-${stage.label}-${index}`}
            className={clsx(
              "step w-full items-start",

              showDetails ? "pb-6 last:pb-0" : "pb-12 last:pb-0",

              isCompleted
                ? "before:bg-primary-500"
                : "dark:before:bg-dark-500 before:bg-gray-200",
            )}
          >
            {/* =====================================================
                  STEP ICON
                  ===================================================== */}

            <span
              className={clsx(
                "step-header shrink-0 rounded-full dark:text-white",

                isCompleted
                  ? "bg-primary-600 dark:bg-primary-500 dark:ring-offset-dark-900 text-white ring-offset-[3px] ring-offset-gray-100"
                  : isRunning
                    ? "bg-blue-600 text-white"
                    : "dark:bg-dark-500 bg-gray-200 text-gray-950",
              )}
            >
              {isCompleted ? (
                <Check className="size-5" strokeWidth={2.5} />
              ) : (
                <StepIcon className="size-4.5 opacity-80" />
              )}
            </span>

            {/* =====================================================
                  PROCESS CONTENT
                  ===================================================== */}

            <div
              className={clsx(
                "w-full min-w-0 flex-1 text-start ltr:ml-4 rtl:mr-4",

                showDetails &&
                  "dark:border-dark-500 -mt-2 border-y border-gray-200 py-3",
              )}
            >
              <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                {/* =================================================
                      NUMBER + PROCESS TITLE + STATUS
                      ================================================= */}

                <div className="flex w-full shrink-0 gap-6 lg:w-96">
                  <span className="text-primary-500 mt-0.5 pr-4 text-2xl font-bold">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex flex-col justify-center">
                    {/* PROCESS NAME */}

                    <h3
                      className={clsx(
                        "text-base leading-tight font-medium",

                        isCompleted
                          ? "text-primary-600 dark:text-primary-400"
                          : isRunning
                            ? "text-blue-600 dark:text-blue-400"
                            : "dark:text-dark-100 text-gray-800",
                      )}
                    >
                      {stage.label || "Unnamed Process"}
                    </h3>

                    {/* STATUS + COUNT */}

                    <div className="mt-1 flex items-center gap-3">
                      <StatusLabel status={stage.status} />

                      {/* SUB PROCESS COUNT */}

                      {hasSubs && (
                        <span className="dark:bg-dark-500 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-300">
                          {stage.completedCount ??
                            subStages.filter(
                              (sub) => sub.status === "Completed",
                            ).length}
                          /{stage.totalCount ?? subStages.length} completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* =================================================
                      PROCESS WITHOUT SUB-PROCESS
                      
                      IMPORTANT:
                      Static stages ke liye details nahi.
                      Dynamic process ke liye details.
                      ================================================= */}

                {!hasSubs && !isStaticStage && (
                  <StageDetails data={stage} now={now} />
                )}
              </div>

              {/* =====================================================
                    PROCESS WITH SUB-PROCESSES
                    ===================================================== */}

              {hasSubs && (
                <div className="mt-4 max-h-[500px] space-y-3 overflow-y-auto pr-2">
                  {subStages.map((sub, subIndex) => (
                    <div
                      key={sub.id}
                      className="dark:border-dark-500 flex w-full flex-col gap-4 rounded-lg border border-dashed border-gray-200 px-4 py-3 lg:flex-row lg:items-center lg:gap-6"
                    >
                      {/* SUB PROCESS NAME */}

                      <div className="flex w-full shrink-0 flex-col justify-center lg:w-72">
                        <span className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                          Sub Process {subIndex + 1}
                        </span>

                        <span className="dark:text-dark-100 text-sm font-semibold text-gray-800">
                          {sub.label || stage.label || "Unnamed Sub Process"}
                        </span>

                        <div className="mt-1">
                          <StatusLabel status={sub.status} />
                        </div>
                      </div>

                      {/* SUB PROCESS DETAILS */}

                      <StageDetails data={sub} now={now} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
