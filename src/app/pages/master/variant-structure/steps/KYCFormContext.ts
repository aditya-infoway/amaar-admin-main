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

export type AddressType = {
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
};

export type AddressInfoType = {
  permanentAddress: AddressType;
  isSameCorrespondenceAddress: boolean;
  correspondenceAddress: AddressType;
};

export type IdentifyDocumentType = {
  type: "passport" | "id_card" | "driving_license";
  imageFront: File | null;
  imageBack: File | null;
  passportPage: File | null;
};

export type DeclarationType = {
  agreed: boolean;
  fullName: string;
  dateSigned: Date | null;
};

export type FormDataType = {
  personalInfo: TechnicalSpecType;
  addressInfo: AddressInfoType;
  identifyDocument: IdentifyDocumentType;
  declaration: DeclarationType;
};

// ─── State & Actions ──────────────────────────────────────────────────────────

export interface FormState {
  readonly formData: FormDataType;
  readonly stepStatus: {
    [key in StepKey]: StepStatus;
  };
}

export type FormAction =
  | { type: "SET_FORM_DATA";   payload: Partial<FormDataType> }
  | { type: "SET_STEP_STATUS"; payload: Partial<FormState["stepStatus"]> };

// ─── Context ──────────────────────────────────────────────────────────────────

export interface KYCFormContextType {
  state: FormState;
  dispatch: Dispatch<FormAction>;
}

export const [KYCFormContextProvider, useKYCFormContext] =
  createSafeContext<KYCFormContextType>(
    "useKYCFormContext must be used within a KYCFormContextProvider",
  );