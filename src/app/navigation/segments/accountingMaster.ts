import { baseNavigationObj } from "../baseNavigation";
import { NavigationTree } from "@/@types/navigation";

export const accountingMaster: NavigationTree = {
  ...baseNavigationObj["accountingMaster"],
  childs: [
    {
      id: "accounting_master.debitNote",
      type: "item",
      path: "/accounting-master/debit-note",
      title: "Debit Note",
      icon: "accounting_master.debitNote",
    },
    {
      id: "accounting_master.creditNote",
      type: "item",
      path: "/accounting-master/credit-note",
      title: "Credit Note",
      icon: "accounting_master.creditNote",
    },
    {
      id: "accounting_master.cashPayment",
      type: "item",
      path: "/accounting-master/cash-payment",
      title: "Cash Payment",
      icon: "accounting_master.cashPayment",
    },
    {
      id: "accounting_master.bankPayment",
      type: "item",
      path: "/accounting-master/bank-payment",
      title: "Bank Payment",
      icon: "accounting_master.bankPayment",
    },
    {
      id: "accounting_master.cashReceipt",
      type: "item",
      path: "/accounting-master/cash-receipt",
      title: "Cash Receipt",
      icon: "accounting_master.cashReceipt",
    },
    {
      id: "accounting_master.bankReceipt",
      type: "item",
      path: "/accounting-master/bank-receipt",
      title: "Bank Receipt",
      icon: "accounting_master.bankReceipt",
    },
    {
      id: "accounting_master.contra",
      type: "item",
      path: "/accounting-master/contra",
      title: "Contra",
      icon: "accounting_master.contra",
    },
    {
      id: "accounting_master.journalEntry",
      type: "item",
      path: "/accounting-master/journal-entry",
      title: "Journal Entry",
      icon: "accounting_master.journalEntry",
    },
  ],
};