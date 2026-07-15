
export const bodyTypeOptions = [
  { id: "open", label: "Open Body" },
  { id: "closed", label: "Closed Body" },
  { id: "tipper", label: "Tipper" },
  { id: "tanker", label: "Tanker" },
  { id: "flatbed", label: "Flatbed" },
  { id: "reefer", label: "Reefer" },
];

export const brandOptions = [
  { id: "tata", label: "Tata" },
  { id: "ashok", label: "Ashok Leyland" },
  { id: "eicher", label: "Eicher" },
  { id: "bharatbenz", label: "BharatBenz" },
  { id: "volvo", label: "Volvo" },
  { id: "man", label: "MAN" },
];

export const hydraulicBrandOptions = [
  { id: "wabco", label: "Wabco" },
  { id: "hyva", label: "Hyva" },
  { id: "parker", label: "Parker" },
  { id: "bosch", label: "Bosch" },
  { id: "danfoss", label: "Danfoss" },
];
export const drCrOptions = [
  { id: "DR", label: "DR" },
  { id: "CR", label: "CR" },
];

export const districtOptions = [
  { id: "ahmedabad", label: "Ahmedabad" },
  { id: "rajkot", label: "Rajkot" },
  { id: "junagadh", label: "Junagadh" },
  // fill in the rest of your district list
];

export const cityOptions = [
  { id: "ahmedabad-city", label: "Ahmedabad" },
  { id: "rajkot-city", label: "Rajkot" },
  { id: "junagadh-city", label: "Junagadh" },
  // fill in the rest of your city list
];

export const tyreBrandOptions = [
  { id: "mrf", label: "MRF" },
  { id: "ceat", label: "CEAT" },
  { id: "apollo", label: "Apollo" },
  { id: "jk", label: "JK Tyre" },
  { id: "bridgestone", label: "Bridgestone" },
  { id: "goodyear", label: "Goodyear" },
];

export const itemCategoryOptions = [
  { id: "raw", label: "Raw Material" },
  { id: "consumable", label: "Consumable" },
  { id: "finished", label: "Finished Goods" },
  { id: "spare", label: "Spare Parts" },
  { id: "packaging", label: "Packaging Material" },
  { id: "chemical", label: "Chemical" },
];



export const uomOptions = [
  { id: "pcs", label: "PCS" },
  { id: "kg", label: "KG" },
  { id: "ltr", label: "LTR" },
  { id: "box", label: "BOX" },
  { id: "set", label: "SET" },
  { id: "mtr", label: "MTR" },
  { id: "roll", label: "ROLL" },
  { id: "bag", label: "BAG" },
];

export const taxSlabOptions = [
  { id: "0", label: "0%" },
  { id: "5", label: "5%" },
  { id: "12", label: "12%" },
  { id: "18", label: "18%" },
  { id: "28", label: "28%" },
];

export const itemTypeOptions = [
  { id: "raw-material", label: "Raw Material" },
  { id: "consumable", label: "Consumable" },
  { id: "sub-assembly", label: "Sub Assembly" },
  { id: "semi-finished", label: "Semi Finished" },
  { id: "finished-goods", label: "Finished Goods" },
  { id: "service", label: "Service" },
  { id: "scrap", label: "Scrap" },
  { id: "tool-equipment", label: "Tool & Equipment" },
];

export const supplierOptions = [
  { id: "supplier-1", label: "Amaar Suppliers Pvt Ltd" },
  { id: "supplier-2", label: "Global Auto Parts" },
  { id: "supplier-3", label: "Prime Industrial Co." },
  { id: "supplier-4", label: "Metro Trading House" },
  { id: "supplier-5", label: "Shree Steel Traders" },
  { id: "supplier-6", label: "National Hydraulics" },
  { id: "supplier-7", label: "Bharat Fasteners Ltd" },
  { id: "supplier-8", label: "Omega Electricals" },
];

export const statusOptions = [
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];



export const groupOptions = [
  {
    label: "Bank Accounts (Bank)",
    value: "Bank Accounts",
    effect: "Balance Sheet",
  },
  { label: "Bank OCC A/C", value: "Bank OCC A/C", effect: "Balance Sheet" },
  {
    label: "Capital Account",
    value: "Capital Account",
    effect: "Balance Sheet",
  },
  { label: "Cash-in-Hand", value: "Cash-in-Hand", effect: "Balance Sheet" },
  {
    label: "Currant Assets",
    value: "Currant Assets",
    effect: "Balance Sheet",
  },
  {
    label: "Duites & Taxes",
    value: "Duites & Taxes",
    effect: "Balance Sheet",
  },
  {
    label: "Expense Account",
    value: "Expense Account",
    effect: "Profit & Loss",
  },
  { label: "Purchase Account", value: "Purchase Account", effect: "Trading" },
  { label: "Sales Account", value: "Sales Account", effect: "Trading" },
  { label: "Stock in Hand", value: "Stock in Hand", effect: "Balance Sheet" },
  {
    label: "Sundry Creditors",
    value: "Sundry Creditors",
    effect: "Balance Sheet",
  },
  {
    label: "Sundry Debitors",
    value: "Sundry Debtors",
    effect: "Balance Sheet",
  },
  { label: "Supplier", value: "Supplier", effect: "Balance Sheet" },
  { label: "Customer", value: "Customer", effect: "Balance Sheet" },
  {
    label: "Sundry Debitor (finance)",
    value: "Sundry Debitor (finance)",
    effect: "Balance Sheet",
  },
  {
    label: "Sundry Credito (finance)",
    value: "Sundry Credito (finance)",
    effect: "Balance Sheet",
  },
  {
    label: "Sundry Debitor (internal)",
    value: "Sundry Debitor (internal)",
    effect: "Balance Sheet",
  },
  {
    label: "Sundry Creditor (internal)",
    value: "Sundry Creditor (internal)",
    effect: "Balance Sheet",
  },
];

export const countryOptions = [
  { id: "india", label: "India" },
  { id: "usa", label: "USA" },
  { id: "uk", label: "UK" },
  { id: "canada", label: "Canada" },
  { id: "australia", label: "Australia" },
];

export const stateOptions = [
  { id: "maharashtra", label: "Maharashtra" },
  { id: "gujarat", label: "Gujarat" },
  { id: "rajasthan", label: "Rajasthan" },
  { id: "delhi", label: "Delhi" },
  { id: "karnataka", label: "Karnataka" },
  { id: "tamil-nadu", label: "Tamil Nadu" },
  { id: "uttar-pradesh", label: "Uttar Pradesh" },
  { id: "west-bengal", label: "West Bengal" },
];

export const talukaOptions = [
  { id: "aheri", label: "Aheri" },
  { id: "jalgaon-jamod", label: "Jalgaon Jamod" },
  { id: "bhusawal", label: "Bhusawal" },
  { id: "chalisgaon", label: "Chalisgaon" },
  { id: "jamner", label: "Jamner" },
];