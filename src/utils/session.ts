// src/utils/session.ts

const TOKEN_KEY = "authToken";
const COMPANY_ID_KEY = "companyId";

export const setCompanySession = (
  token: string | null,
  companyId: string | number | null,
) => {
  if (token && companyId !== null && companyId !== undefined) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(COMPANY_ID_KEY, String(companyId));
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(COMPANY_ID_KEY);
  }
};

export const getCompanySession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const companyId = localStorage.getItem(COMPANY_ID_KEY);
  return { token, companyId };
};

export const isCompanySessionValid = () => {
  const { token, companyId } = getCompanySession();
  return Boolean(token && companyId);
};