import { CheckCircle2, Circle } from "lucide-react";
import type { WorkProcessStatus, WorkProcessStep } from "./types";

interface WorkProcessStepperProps {
  steps: WorkProcessStep[];
  onToggleStatus: (stepId: number) => void;
}

const statusStyles: Record<WorkProcessStatus, string> = {
  Pending: "text-amber-600 bg-amber-50 border-amber-200",
  Completed: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

export default function WorkProcessStepper({
  steps,
  onToggleStatus,
}: WorkProcessStepperProps) {
  return (
    <div className="relative pl-2">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === "Completed";

        return (
          <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[15px] top-8 h-full w-0.5 ${
                  isCompleted ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}

            <button
              type="button"
              onClick={() => onToggleStatus(step.id)}
              className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white shadow"
              title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500" strokeWidth={2} />
              ) : (
                <Circle className="h-8 w-8 text-gray-300" strokeWidth={2} />
              )}
            </button>

            <div className="flex-1 pt-1">
              <p className="text-sm font-semibold text-gray-500">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h4 className="text-base font-medium text-gray-900">{step.label}</h4>
              <span
                className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[step.status]}`}
              >
                {step.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}