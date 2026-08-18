// ─── Timepicker.tsx ──────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect } from "react";
import { ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { DatePicker } from "@/components/shared/form/Datepicker";

interface TimepickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const Timepicker = ({
  value = "",
  onChange,
  placeholder = "Select time...",
  className = "",
}: TimepickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [isAM, setIsAM] = useState<boolean>(true);
  const [view, setView] = useState<"hours" | "minutes">("hours");
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parts = value.split(":");
      if (parts.length === 2) {
        let hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        if (!isNaN(hours) && !isNaN(minutes)) {
          setIsAM(hours < 12);
          if (hours > 12) hours -= 12;
          if (hours === 0) hours = 12;
          setSelectedHour(hours);
          setSelectedMinute(minutes);
        }
      }
    } else {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      setIsAM(hours < 12);
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      setSelectedHour(hours);
      setSelectedMinute(Math.round(minutes / 5) * 5);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (hours: number, minutes: number, am: boolean) => {
    let displayHours = hours;
    if (am && hours === 12) displayHours = 0;
    if (!am && hours !== 12) displayHours = hours + 12;
    const paddedHours = String(displayHours).padStart(2, "0");
    const paddedMinutes = String(minutes).padStart(2, "0");
    return `${paddedHours}:${paddedMinutes}`;
  };

  const getDisplayTime = () => {
  if (!value) return "";

  const [hour, minute] = value.split(":").map(Number);

  const date = new Date();
  date.setHours(hour, minute);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  const handleTimeSelect = () => {
    const timeStr = formatTime(selectedHour, selectedMinute, isAM);
    if (onChange) onChange(timeStr);
    setIsOpen(false);
  };

  // For mobile - use DatePicker
  if (isMobile) {
    return (
      <div className={`max-w-xl ${className}`}>
        <DatePicker
          options={{
            enableTime: true,
            noCalendar: true,
            time_24hr: true,
            minuteIncrement: 1,
            enableSeconds: false,
            static: false,
            position: "auto",
            clickOpens: true,
            dateFormat: "H:i",
          }}
          placeholder={placeholder}
          value={value}
          onChange={(selectedDates: Date[]) => {
            const value = selectedDates[0]?.toLocaleTimeString() || "";
            if (onChange) onChange(value);
          }}
        />
      </div>
    );
  }

  // For desktop - Beautiful custom clock design
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const clockSize = 200;
  const center = clockSize / 2;

  return (
    <div className={`relative w-full ${className}`} ref={pickerRef}>
      {/* Input Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 flex cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <span
          className={
            !getDisplayTime()
              ? "dark:text-dark-400 text-gray-400"
              : "dark:text-dark-200"
          }
        >
          {getDisplayTime() || placeholder}
        </span>
        <ClockIcon className="dark:text-dark-400 size-5 text-gray-400" />
      </div>

      {/* Desktop Clock Picker */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-w-sm min-w-[260px]">
          <div className="dark:border-dark-600 dark:bg-dark-700 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Header - Compact */}
            <div className="bg-[#003399] px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-medium tracking-wider text-white/70 uppercase">
                    Time
                  </p>
                  <div className="text-xl font-bold tracking-wider text-white">
                    {String(selectedHour).padStart(2, "0")}:
                    {String(selectedMinute).padStart(2, "0")}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setIsAM(true)}
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                      isAM
                        ? "bg-white text-[#003399] shadow-lg"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAM(false)}
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-medium transition-all ${
                      !isAM
                        ? "bg-white text-[#003399] shadow-lg"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Clock Body - Compact */}
            <div className="dark:bg-dark-800 bg-gray-50 p-3">
              {/* View Selector - Compact */}
              <div className="mb-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setView("hours")}
                  className={`rounded-full px-4 py-1 text-[10px] font-medium transition-all ${
                    view === "hours"
                      ? "bg-[#003399] text-white shadow-md"
                      : "dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600 bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Hours
                </button>
                <button
                  type="button"
                  onClick={() => setView("minutes")}
                  className={`rounded-full px-4 py-1 text-[10px] font-medium transition-all ${
                    view === "minutes"
                      ? "bg-[#003399] text-white shadow-md"
                      : "dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600 bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Minutes
                </button>
              </div>

              {/* Clock Face - Compact */}
              <div className="flex justify-center">
                <div
                  className="relative"
                  style={{ width: clockSize, height: clockSize }}
                >
                  <svg
                    width={clockSize}
                    height={clockSize}
                    viewBox={`0 0 ${clockSize} ${clockSize}`}
                  >
                    {/* Clock face background */}
                    <circle
                      cx={center}
                      cy={center}
                      r={clockSize * 0.44}
                      fill="white"
                      className="dark:fill-dark-700"
                      filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.08))"
                    />

                    <circle
                      cx={center}
                      cy={center}
                      r={clockSize * 0.42}
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="1.5"
                      className="dark:stroke-dark-600"
                    />

                    {/* Inner circle */}
                    <circle
                      cx={center}
                      cy={center}
                      r={clockSize * 0.38}
                      fill="#fafafa"
                      className="dark:fill-dark-800"
                    />

                    {/* Hour markers */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const outerR = clockSize * 0.38;
                      const innerR =
                        i % 3 === 0 ? clockSize * 0.33 : clockSize * 0.355;
                      const x1 = center + outerR * Math.cos(angle);
                      const y1 = center + outerR * Math.sin(angle);
                      const x2 = center + innerR * Math.cos(angle);
                      const y2 = center + innerR * Math.sin(angle);
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={i % 3 === 0 ? "#003399" : "#9ca3af"}
                          strokeWidth={i % 3 === 0 ? "2.5" : "1.5"}
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Numbers - Clickable */}
                    {(view === "hours" ? hours : minutes).map((num, index) => {
                      const angle = (index * 30 - 90) * (Math.PI / 180);
                      const numRadius = clockSize * 0.28;
                      const x = center + numRadius * Math.cos(angle);
                      const y = center + numRadius * Math.sin(angle);
                      const isActive =
                        num ===
                        (view === "hours" ? selectedHour : selectedMinute);

                      return (
                        <g
                          key={num}
                          onClick={() => {
                            if (view === "hours") {
                              setSelectedHour(num);
                              setTimeout(() => setView("minutes"), 400);
                            } else {
                              setSelectedMinute(num);
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={14}
                            fill={isActive ? "#003399" : "transparent"}
                            className={`transition-all duration-200 ${
                              !isActive
                                ? "dark:hover:bg-dark-600 hover:bg-gray-200"
                                : ""
                            }`}
                          />
                          <text
                            x={x}
                            y={y + 4}
                            textAnchor="middle"
                            fill={isActive ? "white" : "#374151"}
                            className="dark:fill-dark-200 font-semibold transition-all duration-200"
                            pointerEvents="none"
                            style={{ fontSize: "11px" }}
                          >
                            {String(num).padStart(2, "0")}
                          </text>
                        </g>
                      );
                    })}

                    {/* Center dot - Smaller */}
                    <circle cx={center} cy={center} r="4" fill="#003399" />
                    <circle
                      cx={center}
                      cy={center}
                      r="10"
                      fill="none"
                      stroke="#003399"
                      strokeWidth="1"
                      opacity="0.2"
                    />

                    {/* Clock Hand - Shorter */}
                    <g
                      style={{
                        transform: `rotate(${(view === "hours" ? hours.indexOf(selectedHour) : minutes.indexOf(selectedMinute)) * 30}deg)`,
                        transformOrigin: `${center}px ${center}px`,
                        transition:
                          "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      {/* Hand shadow - shorter */}
                      <line
                        x1={center}
                        y1={center}
                        x2={center}
                        y2={
                          center -
                          (view === "hours"
                            ? clockSize * 0.22
                            : clockSize * 0.26)
                        }
                        stroke={view === "hours" ? "#003399" : "#dc2626"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        opacity="0.1"
                      />
                      {/* Main hand - shorter */}
                      <line
                        x1={center}
                        y1={center}
                        x2={center}
                        y2={
                          center -
                          (view === "hours"
                            ? clockSize * 0.22
                            : clockSize * 0.26)
                        }
                        stroke={view === "hours" ? "#003399" : "#dc2626"}
                        strokeWidth={view === "hours" ? "2.5" : "2"}
                        strokeLinecap="round"
                      />
                      {/* Hand tip dot - smaller */}
                      <circle
                        cx={center}
                        cy={
                          center -
                          (view === "hours"
                            ? clockSize * 0.22
                            : clockSize * 0.26)
                        }
                        r="3.5"
                        fill={view === "hours" ? "#003399" : "#dc2626"}
                      />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Hint text - smaller */}
              <p className="dark:text-dark-400 mt-2 text-center text-[9px] text-gray-400">
                Click a number to select {view === "hours" ? "hour" : "minute"}
                {view === "hours" && " → auto-switches"}
              </p>
            </div>

            {/* Footer - Compact */}
            <div className="dark:bg-dark-700 dark:border-dark-600 flex justify-end gap-2 border-t border-gray-100 bg-white px-3 py-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="dark:text-dark-300 dark:hover:bg-dark-600 rounded-lg px-3 py-1 text-xs font-medium text-gray-600 transition-all hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTimeSelect}
                className="rounded-lg bg-[#003399] px-4 py-1 text-xs font-medium text-white shadow-md transition-all hover:bg-[#002277] hover:shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Timepicker };
