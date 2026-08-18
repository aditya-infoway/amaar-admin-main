import { useParams, useNavigate } from "react-router";
import {
  PhoneIcon,
  WifiIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, Fragment } from "react";
import { Get, Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import {
  PlusIcon,
  PhoneXMarkIcon,
  SignalSlashIcon,
  PowerIcon,
  XCircleIcon,
  ClockIcon,
  PhoneArrowUpRightIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Button, Textarea } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Timepicker } from "@/components/shared/form/Timepicker";
import { Listbox } from "@/components/shared/form/StyledListbox";

const columns = [
  { title: "New", color: "text-blue-600", icon: PlusIcon },
  { title: "Connected", color: "text-green-600", icon: PhoneIcon },
  { title: "Not Connected", color: "text-red-600", icon: PhoneXMarkIcon },
  { title: "Busy", color: "text-yellow-500", icon: SignalSlashIcon },
  { title: "Switch Off", color: "text-gray-500", icon: PowerIcon },
  { title: "Rejected", color: "text-red-500", icon: XCircleIcon },
  { title: "Waiting", color: "text-indigo-500", icon: ClockIcon },
  { title: "Out Of Network", color: "text-purple-500", icon: WifiIcon },
  { title: "Call Back", color: "text-orange-500", icon: PhoneArrowUpRightIcon },
  { title: "Other", color: "text-slate-500", icon: EllipsisHorizontalIcon },
];

const responseOptions = [
  { label: "Connected", value: "Connected" },
  { label: "Not Connected", value: "Not Connected" },
  { label: "Busy", value: "Busy" },
  { label: "Switch Off", value: "Switch Off" },
  { label: "Rejected", value: "Rejected" },
  { label: "Waiting", value: "Waiting" },
  { label: "Out Of Network", value: "Out Of Network" },
  { label: "Call Back", value: "Call Back" },
  { label: "Other", value: "Other" },
];

// ===== Naya followup create karte waqt fix creator type (lead create jaisa hi pattern) =====
const DEFAULT_CREATED_TYPE = "Sale Executive";

interface FollowupItem {
  id: number;
  leadId?: number;
  nextScheduledDate: string | null;
  callTime?: string | null;
  callResponse: string | null;
  discussion?: string | null;
  followupCount?: number;
  createdBy?: string | number | null;
  createdByName?: string | null; // <-- backend se dynamic naam
  createdType?: string | null;
}

export default function Followup() {
  const { id } = useParams(); // leadId
  const navigate = useNavigate();

  const [lead, setLead] = useState<any>(null);
  const [openFollowupModal, setOpenFollowupModal] = useState(false);
  const [nextDate, setNextDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [callResponse, setCallResponse] = useState<any>(null);
  const [discussion, setDiscussion] = useState("");
  const [followups, setFollowups] = useState<FollowupItem[]>([]);

  const [errors, setErrors] = useState({
    nextDate: "",
    callTime: "",
    callResponse: "",
  });

  const validateForm = () => {
    const newErrors = { nextDate: "", callTime: "", callResponse: "" };
    let isValid = true;

    if (!nextDate) {
      newErrors.nextDate = "Next Followup Date is required";
      isValid = false;
    }
    if (!callTime) {
      newErrors.callTime = "Call Time is required";
      isValid = false;
    }
    if (!callResponse) {
      newErrors.callResponse = "Call Response is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Backend hi guarantee karta hai ki kam se kam ek entry (real followup ya "New" virtual) aaye,
  // is liye yaha manual fallback ki zarurat nahi.
  const displayFollowups = followups;

  const fetchFollowups = async () => {
    try {
      const response = await Get(`followup/lead/${id}/latest`, {}, false);
      if (response.data?.success) {
        setFollowups(response.data.data?.followups || []);
        setLead(response.data.data?.lead || null);
      } else {
        toasterrormsg(response.data?.message || "Failed to fetch follow-ups.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while fetching follow-ups.");
    }
  };

  useEffect(() => {
    if (id) fetchFollowups();
  }, [id]);

  useEffect(() => {
    if (lead?.nextFollowupDate) {
      setNextDate(new Date(lead.nextFollowupDate).toISOString().split("T")[0]);
    }
  }, [lead]);

  const handleSaveFollowup = async () => {
    if (!validateForm()) return;

    try {
      // ===== employeeId sessionStorage se (static), createdType fix "Sale Executive" =====
      const employeeId = sessionStorage.getItem("employeeId") || "";

      const payload = {
        leadId: Number(id),
        nextScheduledDate: nextDate ? new Date(nextDate).toISOString() : null,
        callTime,
        callResponse: callResponse?.value || callResponse,
        discussion,
        createdBy: Number(employeeId),
        createdType: DEFAULT_CREATED_TYPE,
      };

      const response = await Post("followup/create", payload, false);

      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Follow-up added successfully!");
        setOpenFollowupModal(false);
        await fetchFollowups();
        setCallTime("");
        setCallResponse(null);
        setDiscussion("");
      } else {
        toasterrormsg(response.data?.message || "Failed to save follow-up. Please try again.");
      }
    } catch (error) {
      toasterrormsg("Something went wrong while saving the follow-up.");
    }
  };

  const openFollowupDrawer = (item: FollowupItem) => {
    setNextDate(
      item.nextScheduledDate
        ? new Date(item.nextScheduledDate).toISOString().split("T")[0]
        : "",
    );
    setCallTime(item.callTime || "");
    setCallResponse(
      responseOptions.find((option) => option.value === item.callResponse) || null,
    );
    setDiscussion(item.discussion || "");
    setOpenFollowupModal(true);
  };

  return (
    <div className="dark:bg-dark-800 min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Follow-up Dashboard
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Lead Code : {lead?.leadCode || id}
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="bg-primary-500 hover:bg-primary-600 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {columns.map((column) => (
          <div
            key={column.title}
            className="dark:bg-dark-700 dark:border-dark-600 rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="dark:border-dark-600 flex items-center gap-2 border-b border-gray-200 p-3 font-semibold">
              <column.icon className={`h-5 w-5 ${column.color}`} />
              <span className={column.color}>{column.title}</span>
            </div>

            <div className="min-h-70 p-2">
              {displayFollowups
                .filter((item) => item.callResponse === column.title)
                .map((item) => (
                  <div
                    key={item.id}
                    className="dark:bg-dark-600/50 dark:border-dark-600 mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm"
                  >
                    <div className="text-primary-500 dark:text-primary-400 mb-2 text-sm font-semibold">
                      Created By : {item.createdByName || item.createdBy || "N/A"}
                    </div>

                    <div className="dark:text-dark-200 mb-4 text-sm text-gray-600">
                      F-up Date :{" "}
                      {item.nextScheduledDate
                        ? new Date(item.nextScheduledDate).toLocaleDateString("en-GB")
                        : "—"}
                    </div>

                    <div className="dark:text-dark-200 mb-4 text-sm text-gray-600">
                      Time : {item.callTime || "—"}
                    </div>

                    <div className="mb-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          item.callResponse === "Connected"
                            ? "border-green-500 text-green-600"
                            : item.callResponse === "Busy"
                              ? "border-yellow-500 text-yellow-600"
                              : item.callResponse === "Rejected"
                                ? "border-red-500 text-red-600"
                                : item.callResponse === "Call Back"
                                  ? "border-orange-500 text-orange-600"
                                  : "border-blue-500 text-blue-600"
                        }`}
                      >
                        {item.callResponse}
                      </span>
                    </div>

                    <div className="dark:border-dark-600 dark:text-dark-300 mt-18 flex items-center justify-between border-t border-gray-200 pt-2 text-gray-600">
                      <button
                        onClick={() => openFollowupDrawer(item)}
                        className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer transition-colors"
                        title="Move"
                      >
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>

                      <button
                        className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer transition-colors"
                        title="Transfer"
                      >
                        <ArrowsRightLeftIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => navigate(`/followups/history/${id}`)}
                        className="hover:text-primary-500 dark:hover:text-primary-400 cursor-pointer transition-colors"
                        title="Follow Up History"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <ChatBubbleLeftEllipsisIcon className="hover:text-primary-500 dark:hover:text-primary-400 h-5 w-5 cursor-pointer transition-colors" />
                        <span className="dark:text-dark-400 text-xs text-gray-500">
                          {item.callResponse === "New" ? 1 : item.followupCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Slide Drawer */}
      <Transition appear show={openFollowupModal} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={() => setOpenFollowupModal(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <form className="flex h-full flex-col">
                <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                    Add Follow-up
                  </h2>
                  <Button
                    onClick={() => setOpenFollowupModal(false)}
                    variant="flat"
                    isIcon
                    className="size-8 rounded-full text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                    type="button"
                  >
                    <XMarkIcon className="size-5" />
                  </Button>
                </div>

                <div className="grow space-y-5 overflow-y-auto p-5">
                  {/* Next Followup Date */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Next Followup Date
                    </label>
                    <DatePicker
                      value={nextDate}
                      onChange={(date: any) => setNextDate(date)}
                      placeholder="Select Follow-up Date"
                    />
                    {errors.nextDate && (
                      <p className="mt-1 text-xs text-red-500">{errors.nextDate}</p>
                    )}
                  </div>

                  {/* Call Time */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Call Time
                    </label>
                    <Timepicker value={callTime} onChange={(value: any) => setCallTime(value)} />
                    {errors.callTime && (
                      <p className="mt-1 text-xs text-red-500">{errors.callTime}</p>
                    )}
                  </div>

                  {/* Call Response */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Call Response
                    </label>
                    <Listbox
                      data={responseOptions}
                      value={callResponse}
                      onChange={setCallResponse}
                      placeholder="Select Call Response"
                    />
                    {errors.callResponse && (
                      <p className="mt-1 text-xs text-red-500">{errors.callResponse}</p>
                    )}
                  </div>

                  {/* Discussion */}
                  <div>
                    <label className="dark:text-dark-200 mb-2 block text-sm font-medium text-gray-700">
                      Call Discussion
                    </label>
                    <Textarea
                      rows={4}
                      value={discussion}
                      onChange={(e) => setDiscussion(e.target.value)}
                      placeholder="Enter discussion..."
                      className="focus:border-primary-500 focus:ring-primary-500/20 dark:border-dark-500 dark:bg-dark-600 dark:placeholder-dark-400 dark:focus:border-primary-400 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors outline-none focus:ring-2 dark:text-white"
                    />
                  </div>
                </div>

                <div className="dark:border-dark-500 flex items-center justify-end gap-3 border-t border-gray-200 p-5">
                  <Button
                    variant="outlined"
                    color="neutral"
                    type="button"
                    onClick={() => setOpenFollowupModal(false)}
                    className="h-10 w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveFollowup}
                    color="primary"
                    type="button"
                    className="h-10 w-1/2"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </div>
  );
}