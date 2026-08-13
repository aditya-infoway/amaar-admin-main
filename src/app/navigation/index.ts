import { accountingMaster } from "./segments/accountingMaster";
import { dashboards } from "./segments/dashboards";
import { enquiryMaster } from "./segments/enquiryMaster";
import { itemMaster } from "./segments/itemMaster";
import { leadMaster } from "./segments/leadMaster";
import { logout } from "./segments/logout";
import { master } from "./segments/master";
import { purchaseMaster } from "./segments/purchaseMaster";
import { stockReport } from "./segments/stockReport";
import { userMaster } from "./segments/userMaster";
import { followups } from "./segments/followups";

export const navigation = [
  dashboards,
  master,
  itemMaster,
  leadMaster,
  followups,
  enquiryMaster,
  accountingMaster,
  purchaseMaster,
  stockReport,
  userMaster,
  logout,
];
