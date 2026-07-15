export interface Profession {
  id: string;
  professionName: string;
  status: string;
  createdAt?: string;
}

export const emptyProfession = (): Profession => ({
  id: "",
  professionName: "",
  status: "active",
});

// API se aane wale raw row ko frontend Type me map karta hai
export const mapApiProfessionToProfession = (item: any): Profession => ({
  id: String(item.professionId),
  professionName: item.professionName,
  status: item.status,
  createdAt: item.created,
});