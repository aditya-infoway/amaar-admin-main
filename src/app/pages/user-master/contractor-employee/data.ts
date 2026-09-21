import type { ContractorEmployee } from "./types";

export interface PartyOption {
  id: string;
  label: string;
}

export const emptyContractorEmployee = (): ContractorEmployee => ({
  id: "",
  partyId: "",
  partyName: "",
  employeeName: "",
  employeeNo: "",
  email: "",
  address: "",
  aadharNumber: "",
  aadharImage: "",
  panNumber: "",
  panImage: "",
});



