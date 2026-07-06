import { ProductSeries } from "../shared/types";

export type { ProductSeries };

export const emptyProductSeries = (): ProductSeries => ({
  id: "",
  categoryId: "",
  seriesCode: "",
  seriesName: "",
  capacity: "",
  status: "active",
});
