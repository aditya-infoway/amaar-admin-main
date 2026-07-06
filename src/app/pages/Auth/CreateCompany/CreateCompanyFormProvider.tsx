import { useReducer } from "react";
import {
  CreateCompanyFormContextProvider,
  FormAction,
  FormState,
} from "./CreateCompanyFormContext";

const initialState: FormState = {
  formData: {
    companyInfo: {
      companyName: "",
      natureOfBusiness: "",
      taxSystem: "",
    },
    basicDetails: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      pinCode: "",
      country: "",
      state: "",
      stateCode: "",
      district: "",
      mobile: "",
      phone: "",
      email: "",
      website: "",
      dateFormat: "",
    },
    registrationDetails: {
      gstNo: "",
      vatNo: "",
      panNo: "",
      tanNo: "",
    },
    licensing: {
      dlNo1: "",
      dlNo2: "",
      dealsIn: "",
    },
    financialYear: {
      startDate: "",
      endDate: "",
    },
    bankDetails: {
      bankDetails: "",
    },
    superUser: {
      username: "",
      password: "",
    },
  },
  stepStatus: {
    companyInfo: { isDone: false },
    basicDetails: { isDone: false },
    registrationDetails: { isDone: false },
    licensing: { isDone: false },
    financialYear: { isDone: false },
    bankDetails: { isDone: false },
    superUser: { isDone: false },
  },
};

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
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
};

export function CreateCompanyFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <CreateCompanyFormContextProvider value={{ state, dispatch }}>
      {children}
    </CreateCompanyFormContextProvider>
  );
}
