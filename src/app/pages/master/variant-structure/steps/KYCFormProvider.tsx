import { useReducer } from "react";
import { FormAction, FormState, KYCFormContextProvider } from "./KYCFormContext";

// ─── Initial State ────────────────────────────────────────────────────────────

const baseState: FormState = {
  variantStructureId: undefined,
  variantId: "",
  variantSummary: null,
  formData: {
    personalInfo: {
      bodyLength: "", bodyWidth: "", bodyHeight: "", capacity: "", axleCount: "",
      suspensionType: "", tyreSize: "", kingPin: "", brakeSystem: "",
      hydraulicDetails: "", paintType: "", floorPlateThk: "", sidePlateThk: "",
      chassisType: "", etc: "",
    },
    addressInfo: {},
    identifyDocument: {},
    declaration: {
      productImage: null,
      brochurePdf: null,
      drawingPdf: null,
      specSheet: null,
    },
  },
  stepStatus: {
    personalInfo: { isDone: false },
    addressInfo: { isDone: false },
    identifyDocument: { isDone: false },
    declaration: { isDone: false },
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

const reducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case "SET_STEP_STATUS":
      return { ...state, stepStatus: { ...state.stepStatus, ...action.payload } };
    case "SET_VARIANT":
      return { ...state, variantId: action.payload.variantId, variantSummary: action.payload.variantSummary };
    default:
      return state;
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function KYCFormProvider({
  children,
  preset,
}: {
  children: React.ReactNode;
  preset?: Partial<FormState>;
}) {
  const initialState: FormState = preset
    ? { ...baseState, ...preset, formData: { ...baseState.formData, ...preset.formData } }
    : baseState;

  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <KYCFormContextProvider value={{ state, dispatch }}>
      {children}
    </KYCFormContextProvider>
  );
}