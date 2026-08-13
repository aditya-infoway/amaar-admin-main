import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Get, toasterrormsg } from "@/ApiHelper";
import {
  RiFilePdfFill,
  RiFileExcel2Fill,
  RiRefreshFill,
  RiSearchLine,
  RiEyeLine,
  RiPhoneLine,
  RiAddLine,
  RiGridLine,
  RiListUnordered,
  RiTimeLine,
  RiAlarmWarningLine,
  RiCheckboxCircleLine,
  RiCalendarEventLine,
  RiChat3Line,
  RiCalendarCheckLine,
  RiCalendarLine,
} from "react-icons/ri";
import { FiChevronUp, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Badge } from "@/components/ui";

const FollowUpCard: React.FC<{
  lead: any;
  onView: (leadId: number) => void;
  onHistory: (leadId: number) => void;
}> = ({ lead, onView, onHistory }) => (
  <div className="dark:bg-dark-700 dark:border-dark-600 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
    <div className="min-w-[260px]">
      <div className="mb-4 flex items-center gap-3">
        <Badge variant="outlined" className="rounded-full whitespace-nowrap">
          {lead.leadCode || `#${lead.leadId}`}
        </Badge>
        <span className="text-sm font-bold whitespace-nowrap text-gray-900 dark:text-white">
          {lead.name || "-"}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="dark:bg-dark-800 flex items-center justify-between gap-2 rounded-full bg-gray-50 py-2 pr-2 pl-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <RiCalendarCheckLine className="shrink-0 text-primary-500" size={15} />
            <span className="text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
              Followup Date
            </span>
          </div>
          <Badge variant="outlined" color="primary" className="rounded-full whitespace-nowrap">
            {(lead.latestFollowUp?.nextScheduledDate || lead.nextFollowupDate)
              ? new Date(
                  lead.latestFollowUp?.nextScheduledDate || lead.nextFollowupDate,
                ).toLocaleDateString("en-GB")
              : "-"}
          </Badge>
        </div>

        <div className="dark:bg-dark-800 flex items-center justify-between gap-2 rounded-full bg-gray-50 py-2 pr-2 pl-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <RiPhoneLine className="shrink-0 text-primary-500" size={15} />
            <span className="text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
              Call Response
            </span>
          </div>
          <Badge variant="outlined" color="success" className="rounded-full whitespace-nowrap">
            {lead.latestFollowUp?.callResponse || "New"}
          </Badge>
        </div>

        <div className="dark:bg-dark-800 flex items-center gap-2 rounded-full bg-gray-50 py-2.5 pr-4 pl-4">
          <RiChat3Line className="shrink-0 text-primary-500" size={15} />
          <span className="text-xs whitespace-nowrap text-gray-400 dark:text-gray-500">
            {lead.latestFollowUp?.discussion || "No remarks yet"}
          </span>
        </div>

        {/* Created By — dynamic naam, first time lead creator ka naam aayega */}
        <div className="dark:bg-dark-800 flex items-center justify-between gap-2 rounded-full bg-gray-50 py-2 pr-2 pl-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <RiCalendarLine className="shrink-0 text-primary-500" size={15} />
            <span className="text-xs font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
              Created By
            </span>
          </div>
          <span className="text-xs font-medium whitespace-nowrap text-gray-700 dark:text-gray-300">
            {lead.latestFollowUp?.createdByName ||
              lead.createdByName ||
              lead.createdBy ||
              "-"}
          </span>
        </div>
      </div>

      <div className="dark:border-dark-600 my-4 border-t border-dashed border-gray-300" />

      <div className="flex items-center justify-end gap-2">
        <span className="dark:bg-dark-800 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {lead.followupCount ?? 0}
        </span>
        <button
          onClick={() => onView(lead.leadId)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-100 text-primary-600 transition-all duration-200 hover:bg-primary-200 active:scale-95 dark:bg-primary-900/30 dark:text-primary-400"
          title="Add Follow-up"
        >
          <RiAddLine className="text-lg" />
        </button>
        <button
          onClick={() => onHistory(lead.leadId)}
          className="dark:bg-dark-800 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all duration-200 hover:bg-gray-200 active:scale-95 dark:text-gray-400"
          title="View"
        >
          <RiEyeLine className="text-lg" />
        </button>
      </div>
    </div>
  </div>
);

const TodayFollowUps: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "grid">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsed, setCollapsed] = useState(false);

  const [board, setBoard] = useState<{
    Pending: any[];
    Attend: any[];
    Delay: any[];
    Upcoming: any[];
  }>({ Pending: [], Attend: [], Delay: [], Upcoming: [] });

  const fetchBoard = async () => {
    try {
      const response = await Get("followup/board", { t: Date.now() }, false);
      if (response.data?.success) {
        setBoard(response.data.data || { Pending: [], Attend: [], Delay: [], Upcoming: [] });
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch follow-up board.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching the follow-up board.");
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const flattenBoard = () => [
    ...board.Pending.map((l: any) => ({ ...l, bucket: "Pending" })),
    ...board.Attend.map((l: any) => ({ ...l, bucket: "Attend" })),
    ...board.Delay.map((l: any) => ({ ...l, bucket: "Delay" })),
    ...board.Upcoming.map((l: any) => ({ ...l, bucket: "Upcoming" })),
  ];

  const allRows = flattenBoard();

  const searchLower = searchTerm.toLowerCase();
  const tableData = allRows.filter((lead: any) => {
    if (!searchTerm) return true;
    return (
      lead.name?.toLowerCase().includes(searchLower) ||
      lead.number?.includes(searchTerm) ||
      lead.leadCode?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = tableData.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleViewClick = (leadId: number) => {
    navigate(`/followups/follow-up/${leadId}`);
  };

  const handleHistoryClick = (leadId: number) => {
    navigate(`/followups/history/${leadId}`);
  };

  const bucketColor: Record<string, string> = {
    Pending: "bg-orange-100 text-orange-600",
    Delay: "bg-red-100 text-red-600",
    Attend: "bg-green-100 text-green-600",
    Upcoming: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="dark:bg-dark-800 min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today Follow-ups</h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all Today Follow-ups
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 md:mt-0">
        </div>
      </div>

      {/* View Switch */}
      <div className="dark:border-dark-600 mb-6 flex items-center gap-1 border-b border-gray-200">
        <button
          onClick={() => setView("grid")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
            view === "grid"
              ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <RiGridLine className="text-lg" />
          Grid
        </button>
        <button
          onClick={() => setView("table")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-all ${
            view === "table"
              ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <RiListUnordered className="text-lg" />
          Table
        </button>
      </div>

      {/* Table View */}
      {view === "table" && (
        <>
          <div className="mb-5 flex flex-col items-end justify-end gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-48">
              <RiSearchLine className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="dark:border-dark-600 dark:bg-dark-700 w-full rounded-lg border border-gray-200 bg-white py-1.5 pr-4 pl-9 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white dark:placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="dark:bg-dark-700 dark:border-dark-600 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="dark:bg-dark-600 bg-[#F3F6FB]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">Lead Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">City</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">Created By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">Call Response</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">F Count</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">Followup Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">View</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="dark:divide-dark-600 divide-y divide-gray-100">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item: any, index: number) => (
                      <tr key={item.leadId} className="dark:hover:bg-dark-600 transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {item.leadCode || item.leadId}
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900 dark:text-white">
                          {item.name || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {item.number || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {item.city || "-"}
                        </td>
                        {/* Created By — dynamic, first time lead creator ka naam */}
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {item.latestFollowUp?.createdByName ||
                            item.createdByName ||
                            item.createdBy ||
                            "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {item.latestFollowUp?.callResponse || "New"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {item.latestFollowUp?.callTime || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {item.followupCount ?? 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {(item.latestFollowUp?.nextScheduledDate || item.nextFollowupDate)
                            ? new Date(
                                item.latestFollowUp?.nextScheduledDate || item.nextFollowupDate,
                              ).toLocaleDateString("en-GB")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          <button
                            onClick={() => handleViewClick(item.leadId)}
                            className="text-primary-600 hover:underline"
                          >
                            View
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${bucketColor[item.bucket]}`}>
                            {item.bucket}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {tableData.length > 0 && (
              <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
                <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
                  <span>Show</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="dark:border-dark-600 dark:bg-dark-700 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-priamry-500 focus:outline-none dark:text-gray-200"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>entries</span>
                </div>

                <div className="order-2 flex justify-center md:w-1/3">
                  <div className="dark:border-dark-700 dark:bg-dark-800 inline-flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                    >
                      <FiChevronLeft className="size-4" />
                    </button>

                    {getPageNumbers().map((page, index) =>
                      typeof page === "number" ? (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                            page === currentPage
                              ? "bg-primary-600 text-white"
                              : "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={index} className="inline-flex size-8 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                          {page}
                        </span>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                    >
                      <FiChevronRight className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
                  <span>
                    {tableData.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, tableData.length)} of{" "}
                    {tableData.length} entries
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Pending */}
          <div className="dark:bg-dark-600 min-h-100 rounded-xl bg-gray-100 p-4">
            <div className="dark:bg-dark-700 mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <RiTimeLine className="text-orange-500" size={14} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Pending</span>
              </div>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                {board.Pending.length}
              </span>
            </div>
            <div className="min-h-0 max-h-[500px] flex-1 space-y-3 overflow-y-auto pr-1">
              {board.Pending.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center">
                  <span className="text-sm text-gray-400 dark:text-gray-500">No Pending Follow-ups</span>
                </div>
              ) : (
                board.Pending.map((lead: any) => (
                  <FollowUpCard key={lead.leadId} lead={lead} onView={handleViewClick} onHistory={handleHistoryClick} />
                ))
              )}
            </div>
          </div>

          {/* Delay */}
          <div className="dark:bg-dark-600 min-h-[400px] rounded-xl bg-gray-100 p-4">
            <div className="dark:bg-dark-700 mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <RiAlarmWarningLine className="text-red-500" size={14} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Delay</span>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {board.Delay.length}
              </span>
            </div>
            <div className="min-h-0 max-h-[500px] flex-1 space-y-3 overflow-y-auto pr-1">
              {board.Delay.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center">
                  <span className="text-sm text-gray-400 dark:text-gray-500">No Delayed Follow-ups</span>
                </div>
              ) : (
                board.Delay.map((lead: any) => (
                  <FollowUpCard key={lead.leadId} lead={lead} onView={handleViewClick} onHistory={handleHistoryClick} />
                ))
              )}
            </div>
          </div>

          {/* Attend */}
          <div className="dark:bg-dark-600 min-h-[400px] rounded-xl bg-gray-100 p-4">
            <div className="dark:bg-dark-700 mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <RiCheckboxCircleLine className="text-green-500" size={14} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Attend</span>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                {board.Attend.length}
              </span>
            </div>
            <div className="min-h-0 max-h-[500px] flex-1 space-y-3 overflow-y-auto pr-1">
              {board.Attend.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center">
                  <span className="text-sm text-gray-400 dark:text-gray-500">No Attend Follow-ups</span>
                </div>
              ) : (
                board.Attend.map((lead: any) => (
                  <FollowUpCard key={lead.leadId} lead={lead} onView={handleViewClick} onHistory={handleHistoryClick} />
                ))
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className="dark:bg-dark-600 min-h-[400px] rounded-xl bg-gray-100 p-4">
            <div className="dark:bg-dark-700 mb-3 flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <RiCalendarEventLine className="text-yellow-500" size={14} />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">Upcoming</span>
              </div>
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                {board.Upcoming.length}
              </span>
            </div>
            <div className="min-h-0 max-h-[500px] flex-1 space-y-3 overflow-y-auto pr-1">
              {board.Upcoming.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center">
                  <span className="text-sm text-gray-400 dark:text-gray-500">No Upcoming Follow-ups</span>
                </div>
              ) : (
                board.Upcoming.map((lead: any) => (
                  <FollowUpCard key={lead.leadId} lead={lead} onView={handleViewClick} onHistory={handleHistoryClick} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayFollowUps;