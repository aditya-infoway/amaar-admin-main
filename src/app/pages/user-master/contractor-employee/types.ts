export interface ContractorEmployee {
  id: string;
  partyId: string;
  partyName: string;
  employeeName: string;
  employeeNo: string;
  email: string;
  address: string;
  aadharNumber: string;
  aadharImage: string;
  panNumber: string;
  panImage: string;
}

// What the drawer hands back on save (id is decided by the page / API)
export type ContractorEmployeeInput = Omit<ContractorEmployee, "id">;

// Raw files picked in the drawer — use these to build FormData once the API exists
export interface ContractorEmployeeFiles {
  aadhar: File | null;
  pan: File | null;
}