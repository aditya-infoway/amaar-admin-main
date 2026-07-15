import { Category } from "../shared/types";

export type { Category };

export const emptyCategory = (): Category => ({
  id: "",
  code: "",
  categoryName: "",
  slug: "",
  createdAt: new Date().toISOString(),
  status: "active",
});