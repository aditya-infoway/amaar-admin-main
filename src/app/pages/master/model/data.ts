import { Model } from "../shared/types";

export type { Model };

export const emptyModel = (): Model => ({
  id: "",
  categoryId: "",
  seriesId: "",
  modelCode: "",
  modelName: "",
  axleType: "",
  capacity: "",
  length: "",
  width: "",
  height: "",
  standardWeight: "",
  status: "active",
});
