import { useReducer } from "react";
import { FormAction, FormState, KYCFormContextProvider } from "./KYCFormContext";

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: FormState = {
  formData: {
    personalInfo: {
      bodyLength: "",
      bodyWidth: "",
      bodyHeight: "",
      capacity: "",
      axleCount: "",
      suspensionType: "",
      tyreSize: "",
      kingPin: "",
      brakeSystem: "",
      hydraulicDetails: "",
      paintType: "",
      floorPlateThk: "",
      sidePlateThk: "",
      chassisType: "",
      etc: "",
    },
    addressInfo: {
      permanentAddress: {
        country: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
      },
      isSameCorrespondenceAddress: true,
      correspondenceAddress: {
        country: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
      },
    },
    identifyDocument: {
      type: "passport",
      imageFront: null,
      imageBack: null,
      passportPage: null,
    },
    declaration: {
      agreed: false,
      fullName: "",
      dateSigned: null,
    },
  },
  stepStatus: {
    personalInfo:     { isDone: false },
    addressInfo:      { isDone: false },
    identifyDocument: { isDone: false },
    declaration:      { isDone: false },
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

const reducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case "SET_STEP_STATUS":
      return {
        ...state,
        stepStatus: { ...state.stepStatus, ...action.payload },
      };
    default:
      return state;
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function KYCFormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <KYCFormContextProvider value={{ state, dispatch }}>
      {children}
    </KYCFormContextProvider>
  );
}