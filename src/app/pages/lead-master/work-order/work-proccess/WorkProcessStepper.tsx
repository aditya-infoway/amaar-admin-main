import clsx from "clsx";
import type { CSSProperties } from "react";
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

// Content-relevant icon per step key
const stepIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  material_availability: Package,
  material_cutting: Scissors,
  welding: Flame,
  blasting: Wind,
  paint: PaintBucket,
  qc: ClipboardCheck,
  ready_for_dispatch: Truck,
};

export default function WorkProcessStepper({ steps }: WorkProcessStepperProps) {
  return (
    <ol
      className={clsx(
        "steps line-space is-vertical text-xs sm:text-sm",
      )}
      style={{ "--size": "2.75rem", "--line": "0.5rem" } as CSSProperties}
    >
      {steps.map((step, i) => {
        const isCompleted = step.status === "Completed";
        const StepIcon = stepIcons[step.key] ?? Package;

        return (
          <li
            key={step.id}
            className={clsx(
              "step items-start",
              "pb-12 last:pb-0", // Vertical space wapas normal kar diya
              isCompleted
                ? "before:bg-primary-500"
                : "dark:before:bg-dark-500 before:bg-gray-200",
            )}
          >
            {/* Circle / Icon */}
            <span
              className={clsx(
                "step-header rounded-full dark:text-white shrink-0",
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

            {/* Content Area: Number + (Title & Status) */}
            {/* Yahan gap-3 ko gap-6 kar diya (Circle aur Number ke beech space) */}
            <div className="text-start ltr:ml-4 rtl:mr-4 flex gap-6">
              
              {/* Number (Left side) */}
              {/* Yahan pr-4 add kiya (Number aur Title ke beech space) */}
              <span className="text-2xl font-bold text-primary-500 dark:text-primary-500 mt-0.5 pr-4">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Title and Status (Stacked vertically) */}
              <div className="flex flex-col justify-center">
                <h3
                  className={clsx(
                    "text-base font-medium leading-tight",
                    isCompleted
                      ? "text-primary-600 dark:text-primary-400"
                      : "dark:text-dark-100 text-gray-800",
                  )}
                >
                  {step.label}
                </h3>
                
                {/* Status neeche */}
                <span
                  className={clsx(
                    "mt-1 inline-flex items-center gap-1.5 text-xs font-medium",
                    isCompleted ? "text-emerald-600" : "text-amber-600",
                  )}
                >
                  <span
                    className={clsx(
                      "inline-block h-1.5 w-1.5 rounded-full",
                      isCompleted ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                  {step.status}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}