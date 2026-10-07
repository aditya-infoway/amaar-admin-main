export interface ItemCategory {
  id: string;
  financialYearId?: number | string;
  stage: string; // ← stageId ki jagah
  stageName: string;
  categoryId: string;
  categoryName: string;
  createdAt?: string;
}

export const STAGE_OPTIONS = [{ id: "cutting", label: "Cutting" }];

export const emptyItemCategory = (): ItemCategory => ({
  id: "",
  stage: "", // ← stageId ki jagah
  stageName: "",
  categoryId: "",
  categoryName: "",
  createdAt: "",
});