import { TbPalette, TbUsers } from "react-icons/tb";
import {
  ArrowLeftStartOnRectangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  CubeIcon,
  DocumentPlusIcon,
  HomeIcon,
  PhoneArrowUpRightIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  TagIcon,
  UserIcon as HiUserIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  BuildingLibraryIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  CurrencyRupeeIcon,
  ArrowsRightLeftIcon,
  ShoppingCartIcon,
  CubeTransparentIcon,
  UsersIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ElementType } from "react";

import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import FormsIcon from "@/assets/dualicons/forms.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";

export const navigationIcons: Record<string, ElementType> = {
  dashboards: DashboardsIcon,
  registration: FormsIcon,
  leads: TbUsers,
  logout: ArrowLeftStartOnRectangleIcon,

  "dashboards.home": HomeIcon,

  "registration.new": DocumentPlusIcon,
  "registration.expired": ClockIcon,

  "leads.new": UserPlusIcon,
  "leads.todaySchedule": CalendarDaysIcon,
  "leads.followUp": PhoneArrowUpRightIcon,

  master: Squares2X2Icon,
  "master.category": TagIcon,
  "master.productSeries": RectangleStackIcon,
  "master.model": CubeIcon,
  "master.variant": CubeIcon,
  "master.variantStructure": RectangleStackIcon,
"master.bom": CubeTransparentIcon,

  itemMaster: CubeIcon,
  "itemMaster.list": CubeIcon,

  leadMaster: UserGroupIcon,
  "leadMaster.list": UserGroupIcon,

  // User Master
userMaster: UsersIcon,
"user_master.createAccount": UserPlusIcon,
"user_master.createEmployee": UsersIcon,

  // Purchase Master
purchaseMaster: ShoppingCartIcon,
"purchase_master.purchaseRegister": ClipboardDocumentListIcon,

  // Enquiry Master
  enquiryMaster: ClipboardDocumentListIcon,
  "enquiry_master.enquiryType": ClipboardDocumentListIcon,
  "enquiry_master.enquirySource": TagIcon,
  "enquiry_master.profession": BriefcaseIcon,
  "enquiry_master.enquiryStatus": CheckBadgeIcon,
  "enquiry_master.banker": BuildingLibraryIcon,
  "enquiry_master.finance": BanknotesIcon,

    // Accounting Master
  accountingMaster: BanknotesIcon,

  "accounting_master.debitNote": DocumentTextIcon,
  "accounting_master.creditNote": ReceiptRefundIcon,
  "accounting_master.cashPayment": CurrencyRupeeIcon,
  "accounting_master.bankPayment": BuildingLibraryIcon,
  "accounting_master.cashReceipt": CurrencyRupeeIcon,
  "accounting_master.bankReceipt": BuildingLibraryIcon,
  "accounting_master.contra": ArrowsRightLeftIcon,
  "accounting_master.journalEntry": ClipboardDocumentListIcon,

  settings: SettingIcon,
  "settings.general": HiUserIcon,
  "settings.appearance": TbPalette,
};
