import { Finance } from "../shared/types";

export type { Finance };

export const emptyFinance = (): Finance => ({
  id: "",
  financeName: "",
  slug: "",
  createdAt: new Date().toISOString(),
  status: "active",
});