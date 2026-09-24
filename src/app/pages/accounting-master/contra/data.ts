import { Contra } from "../shared/types";

export type { Contra };

export const emptyContra = (): Contra => ({
  id: "",
  type: "deposit",
  account: "",
  voucherNo: "", // ✅ CHANGED — ab drawer khud fetch karega
  date: "",       // ✅ CHANGED — ab drawer khud current date set karega
  oppAccount: "",
  amount: "",
  narration: "",
  createdAt: new Date().toISOString(),
});