export interface PricedOption {
  id: string;
  label: string;
  price: number;
}

export const tyreOptions: PricedOption[] = [
  { id: "tyre-mrf", label: "MRF", price: 8500 },
  { id: "tyre-ceat", label: "CEAT", price: 7800 },
  { id: "tyre-apollo", label: "Apollo", price: 8000 },
  { id: "tyre-jk", label: "JK Tyre", price: 7600 },
  { id: "tyre-bridgestone", label: "Bridgestone", price: 9200 },
];

export const axleOptions: PricedOption[] = [
  { id: "axle-tata", label: "Tata", price: 45000 },
  { id: "axle-ashok", label: "Ashok Leyland", price: 47000 },
  { id: "axle-eicher", label: "Eicher", price: 44000 },
  { id: "axle-bharatbenz", label: "BharatBenz", price: 52000 },
];

export const hydraulicOptions: PricedOption[] = [
  { id: "hyd-hyva", label: "Hyva", price: 65000 },
  { id: "hyd-wabco", label: "Wabco", price: 70000 },
  { id: "hyd-parker", label: "Parker", price: 68000 },
  { id: "hyd-danfoss", label: "Danfoss", price: 72000 },
];

export const boxOptions: PricedOption[] = [
  { id: "box-open", label: "Open Box", price: 95000 },
  { id: "box-closed", label: "Closed Box", price: 125000 },
  { id: "box-tipper", label: "Tipper Box", price: 145000 },
  { id: "box-tanker", label: "Tanker Box", price: 180000 },
];

export const colorOptions: PricedOption[] = [
  { id: "color-white", label: "White", price: 0 },
  { id: "color-red", label: "Red", price: 2000 },
  { id: "color-blue", label: "Blue", price: 2000 },
  { id: "color-silver", label: "Silver", price: 2500 },
];

export const chassisOptions: PricedOption[] = [
  { id: "chassis-std", label: "Standard Chassis", price: 350000 },
  { id: "chassis-heavy", label: "Heavy Duty Chassis", price: 420000 },
  { id: "chassis-light", label: "Light Chassis", price: 290000 },
];

export function getOptionPrice(list: PricedOption[], id: string): number {
  return list.find((item) => item.id === id)?.price || 0;
}

export function getOptionLabel(list: PricedOption[], id: string): string {
  return list.find((item) => item.id === id)?.label || "—";
}