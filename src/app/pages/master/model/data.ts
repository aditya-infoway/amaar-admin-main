export interface Model {
  id: string;
  categoryId: string;
  seriesId: string;
  modelCode: string;
  modelName: string;
  axleType: string;
  capacity: string;
  length: string;
  width: string;
  height: string;
  standardWeight: string;
  status: string;
}

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

// ---- Map backend response (modelId, numeric ids) to frontend Model shape ----
export function mapApiModelToModel(apiModel: any): Model {
  return {
    id: String(apiModel.modelId),
    categoryId: String(apiModel.categoryId),
    seriesId: String(apiModel.seriesId),
    modelCode: apiModel.modelCode ?? "",
    modelName: apiModel.modelName ?? "",
    axleType: apiModel.axleType ?? "",
    capacity: apiModel.capacity ?? "",
    length: apiModel.length ?? "",
    width: apiModel.width ?? "",
    height: apiModel.height ?? "",
    standardWeight: apiModel.standardWeight ?? "",
    status: apiModel.status ?? "active",
  };
}