import * as Yup from "yup";

const optionalString = Yup.string().trim().default("");

export const companyInfoSchema = Yup.object().shape({
  companyName: Yup.string().trim().required("Company name is required"),
  natureOfBusiness: Yup.string().trim().required("Nature of business is required"),
  taxSystem: Yup.string().required("Please select tax system"),
});

export const basicDetailsSchema = Yup.object().shape({
  addressLine1: Yup.string().trim().required("Address line 1 is required"),
  addressLine2: optionalString,
  city: Yup.string().trim().required("City is required"),
  pinCode: Yup.string()
    .trim()
    .matches(/^\d{6}$/, "Enter a valid 6-digit pin code")
    .required("Pin code is required"),
  country: Yup.string().required("Please select country"),
  state: Yup.string().required("Please select state"),
  stateCode: Yup.string().trim().required("State code is required"),
  district: Yup.string().required("Please select district"),
  mobile: Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .required("Mobile is required"),
  phone: optionalString,
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  website: optionalString,
  dateFormat: Yup.string().required("Please select date format"),
});

export const registrationDetailsSchema = Yup.object().shape({
  gstNo: optionalString,
  vatNo: optionalString,
  panNo: optionalString,
  tanNo: optionalString,
});

export const licensingSchema = Yup.object().shape({
  dlNo1: optionalString,
  dlNo2: optionalString,
  dealsIn: optionalString,
});

export const financialYearSchema = Yup.object().shape({
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string()
    .required("End date is required")
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return new Date(value) >= new Date(startDate);
      },
    ),
});

export const bankDetailsSchema = Yup.object().shape({
  bankDetails: Yup.string().trim().required("Bank details are required"),
});

export const superUserSchema = Yup.object().shape({
  username: Yup.string().trim().required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export type CompanyInfoType = Yup.InferType<typeof companyInfoSchema>;
export type BasicDetailsType = Yup.InferType<typeof basicDetailsSchema>;
export type RegistrationDetailsType = Yup.InferType<typeof registrationDetailsSchema>;
export type LicensingType = Yup.InferType<typeof licensingSchema>;
export type FinancialYearType = Yup.InferType<typeof financialYearSchema>;
export type BankDetailsType = Yup.InferType<typeof bankDetailsSchema>;
export type SuperUserType = Yup.InferType<typeof superUserSchema>;
