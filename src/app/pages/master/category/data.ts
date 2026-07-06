import { Category } from "../shared/types";

export type { Category };

export const emptyCategory = (): Category => ({
  id: "",
  code: "",
  categoryName: "",
  status: "active",
});
