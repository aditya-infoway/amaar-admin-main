import { Banker } from "../../enquiry-master/shared/types";

export type { Banker };

export const emptyBanker = (): Banker => ({
  id: "",
  bankerName: "",
  slug: "",
  createdAt: new Date().toISOString(),
  status: "active",
});