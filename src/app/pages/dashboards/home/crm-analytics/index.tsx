// Local Imports
import { Page } from "@/components/shared/Page";
import { Overview } from "./Overview";
import { AppointmentsTable } from "./AppointmentsTable";
import { RecentPaymentTable } from "./RecentPaymentTable";
import { DuePaymentTable } from "./DuePaymentTable";
import { RunningWorkorderTable } from "./RunningWorkorderTable";
import { TodayLeadsTable } from "./TodayLeadsTable";

// ----------------------------------------------------------------------

export default function CRMAnalytics() {
  return (
    <Page title="CRM Analytics Dashboard">
      <div className="overflow-hidden pb-8">
        <div className="transition-content mt-4 grid grid-cols-12 gap-4 px-(--margin-x) sm:mt-5 sm:gap-5 lg:mt-6 lg:gap-6">
          <Overview />
          <AppointmentsTable />
        </div>
        <div className="transition-content mt-4 grid grid-cols-1 gap-4 px-(--margin-x) sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:mt-6 lg:gap-6">
         <RecentPaymentTable />
          <DuePaymentTable />
        </div>
         <div className="transition-content mt-4 grid grid-cols-1 gap-4 px-(--margin-x) sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:mt-6 lg:gap-6">
         <TodayLeadsTable />
          <RunningWorkorderTable />
        </div>
      </div>
    </Page>
  );
}
