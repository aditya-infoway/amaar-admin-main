import { Category } from "../../shared/types";

export type { Category };

export const emptyCategory = (): Category => ({
  id: "",
  code: "",
  categoryName: "",
  createdAt: new Date().toISOString(),
  status: "active",
  slug: ""
});