import { Profession } from "../shared/types";

export type { Profession };

export const emptyProfession = (): Profession => ({
  id: "",
  code: "",
  professionName: "",
  slug: "",
  createdAt: new Date().toISOString(),
  status: "active",
});