import { createSafeContext } from "@/utils/createSafeContext";
import { Dispatch } from "react";

// ─── Step Types ───────────────────────────────────────────────────────────────

export interface StepStatus {
  isDone: boolean;
}

export type StepKey =
  | "personalInfo"
  | "addressInfo"
  | "identifyDocument"
  | "declaration";

// ─── Variant Summary (readonly auto-fill) ──────────────────────────────────────

export interface VariantSummary {
  variantCode: string;
  categoryCode: string;
  categoryName: string;
  seriesCode: string;
  seriesName: string;
  modelCode: string;
  modelName: string;
  capacity: string;
  bodyLength: string;
  bodyWidth: string;
  bodyHeight: string;
  standardWeight: string;
  bodyType: string;
  axleBrand: string;
  hydraulicBrand: string;
  tyreBrand: string;
  targetCost: string;
  sellingMarkup: string;
}

// ─── Form Data Types ──────────────────────────────────────────────────────────

export type TechnicalSpecType = {
  bodyLength?: string;
  bodyWidth?: string;
  bodyHeight?: string;
  capacity?: string;
  axleCount?: string;
  suspensionType?: string;
  tyreSize?: string;
  kingPin?: string;
  brakeSystem?: string;
  hydraulicDetails?: string;
  paintType?: string;
  floorPlateThk?: string;
  sidePlateThk?: string;
  chassisType?: string;
  etc?: string;
};

export type StandardFeaturesType = Record<string, boolean>;
export type OptionalAccessoriesType = Record<string, boolean>;

export type DeclarationType = {
  productImage?: File | null;
  brochurePdf?: File | null;
  drawingPdf?: File | null;
  specSheet?: File | null;
};

export type FormDataType = {
  personalInfo: TechnicalSpecType;
  addressInfo: StandardFeaturesType;
  identifyDocument: OptionalAccessoriesType;
  declaration: DeclarationType;
};

// ─── State & Actions ──────────────────────────────────────────────────────────

export interface FormState {
  readonly variantStructureId?: string;
  readonly variantId: string;
  readonly variantSummary: VariantSummary | null;
  readonly formData: FormDataType;
  readonly stepStatus: {
    [key in StepKey]: StepStatus;
  };
}

export type FormAction =
  | { type: "SET_FORM_DATA"; payload: Partial<FormDataType> }
  | { type: "SET_STEP_STATUS"; payload: Partial<FormState["stepStatus"]> }
  | { type: "SET_VARIANT"; payload: { variantId: string; variantSummary: VariantSummary } };

// ─── Context ──────────────────────────────────────────────────────────────────

export interface KYCFormContextType {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export const [KYCFormContextProvider, useKYCFormContext] =
  createSafeContext<KYCFormContextType>(
    "useKYCFormContext must be used within a KYCFormContextProvider",
  );