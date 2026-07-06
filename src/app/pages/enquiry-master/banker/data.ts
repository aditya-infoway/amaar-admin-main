import { Banker } from "../shared/types";

export type { Banker };

export const emptyBanker = (): Banker => ({
  id: "",
  bankerName: "",
  slug: "",
  createdAt: new Date().toISOString(),
  status: "active",
});