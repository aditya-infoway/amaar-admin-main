import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChevronUpIcon,
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui";
import { RiFilePdfFill, RiFileExcel2Fill } from "react-icons/ri";
import { Get, toasterrormsg } from "@/ApiHelper";

interface FollowupEntry {
  id: number;
  createdBy: string | number | null;
  createdByName?: string | null; // <-- backend se dynamic resolved naam
  createdType: string | null;
  nextScheduledDate: string | null;
  callTime: string | null;
  callResponse: string | null;
  discussion: string | null;
  created: string;
}

const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

const formatDateTime = (d: string | null) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const FollowupHistory: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // leadId
  const [collapsed, setCollapsed] = useState(false);
  const [followups, setFollowups] = useState<FollowupEntry[]>([]);
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await Get(`followup/lead/${id}`, {}, false);
      if (response.data?.success) {
        setFollowups(response.data.data?.followups || []);
        setLead(response.data.data?.lead || null);
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch follow-up history.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching follow-up history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchHistory();
  }, [id]);

  return (
    <div className="dark:bg-dark-800 min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-5 xl:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:mb-6 md:flex-row md:items-center md:gap-0">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
          Follow-up History
        </h2>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-primary-600 hover:bg-primary-700 flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-medium text-white shadow-sm transition-colors sm:h-9 sm:px-3 sm:text-sm lg:h-9.5"
          >
            <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-2 sm:p-4 lg:p-6">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              Loading history...
            </div>
          ) : followups.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No follow-up history available
            </div>
          ) : (
            <div className="relative">
              {followups.map((entry) => (
                <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0 sm:gap-6 sm:pb-8">
                  {/* Timeline marker */}
                  <div className="relative flex w-3 shrink-0 flex-col items-center">
                    <span className="bg-primary-500 ring-primary-100 dark:ring-primary-900/30 relative z-10 mt-2 h-3 w-3 shrink-0 rounded-full ring-4" />
                    <span className="dark:bg-dark-600 absolute top-2 left-1/2 h-full w-px -translate-x-1/2 bg-gray-300" />
                  </div>

                  {/* Info Card */}
                  <div className="dark:bg-dark-800 dark:border-dark-600 flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 lg:grid-cols-2">
                      {/* Left column */}
                      <div className="space-y-2.5 sm:space-y-3">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                          <UserIcon className="text-primary-500 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {lead?.name || "Customer"}
                          </span>
                          {lead?.number && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              ({lead.number})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                          <CalendarDaysIcon className="text-primary-500 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Follow-up Date:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(entry.nextScheduledDate)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                          <ClockIcon className="text-primary-500 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Follow-up Time:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {entry.callTime || "—"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                          <PhoneIcon className="text-primary-500 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Call Response:
                          </span>
                          <Badge variant="filled" color="primary" className="rounded-full text-xs">
                            {entry.callResponse || "—"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                          <ChatBubbleLeftRightIcon className="text-primary-500 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Call Discussion:
                          </span>
                          <span className="wrap-break-word text-gray-600 dark:text-gray-400">
                            {entry.discussion || "—"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                          <CheckCircleIcon className="text-primary-500 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Enquiry Status:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {entry.callResponse || "—"}
                          </span>
                        </div>
                      </div>

                      {/* Right column */}
                      <div className="space-y-2.5 sm:space-y-3">
                        <div className="flex flex-wrap items-center justify-end gap-1.5 text-xs sm:gap-2 sm:text-sm">
                          <UserIcon className="text-primary-500 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Created By:
                          </span>
                          {/* Dynamic naam — Super Admin -> company, warna employee table se */}
                          <span className="text-right wrap-break-word text-gray-600 dark:text-gray-400">
                            {entry.createdByName || entry.createdBy || "—"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5 text-xs sm:gap-2 sm:text-sm">
                          <CalendarDaysIcon className="text-primary-500 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Created Date & Time:
                          </span>
                          <span className="text-right wrap-break-word text-gray-600 dark:text-gray-400">
                            {formatDateTime(entry.created)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowupHistory;