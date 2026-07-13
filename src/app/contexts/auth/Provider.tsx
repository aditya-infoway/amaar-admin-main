// Import Dependencies
import { useEffect, useReducer, ReactNode } from "react";

// Local Imports
import { Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { setCompanySession, getCompanySession, isCompanySessionValid } from "@/utils/session";
import { clearSelectedCompany } from "@/utils/companyStorage";
import { AuthProvider as AuthContext, AuthContextType } from "./context";
import { User } from "@/@types/user";

// ----------------------------------------------------------------------

interface AuthAction {
  type: "INITIALIZE" | "LOGIN_REQUEST" | "LOGIN_SUCCESS" | "LOGIN_ERROR" | "LOGOUT";
  payload?: Partial<AuthContextType>;
}

// Initial state
const initialState: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  login: async () => {},
  logout: async () => {},
};

// Reducer handlers
const reducerHandlers: Record<
  AuthAction["type"],
  (state: AuthContextType, action: AuthAction) => AuthContextType
> = {
  INITIALIZE: (state, action) => ({
    ...state,
    isAuthenticated: action.payload?.isAuthenticated ?? false,
    isInitialized: true,
    user: action.payload?.user ?? null,
  }),

  LOGIN_REQUEST: (state) => ({
    ...state,
    isLoading: true,
    errorMessage: null,
  }),

  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    errorMessage: null,
    user: action.payload?.user ?? null,
  }),

  LOGIN_ERROR: (state, action) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    errorMessage: action.payload?.errorMessage ?? "An error occurred",
  }),

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

// Reducer function
const reducer = (state: AuthContextType, action: AuthAction): AuthContextType => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        if (isCompanySessionValid()) {
          const { companyId } = getCompanySession();

          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user: { companyId } as unknown as User,
            },
          });
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INITIALIZE",
          payload: { isAuthenticated: false, user: null },
        });
      }
    };

    init();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      // Post(fileName, data, useHeader) - useHeader=false => application/json
      const response = await Post("superadmin/login", credentials, false);

      const result = response.data;

      if (!result || result.status !== 200 || !result.data) {
        const msg = result?.message || "Invalid Email or Password";
        toasterrormsg(msg);
        throw new Error(msg);
      }

      const { token, companyId } = result.data;

      if (!token || !companyId) {
        throw new Error("Invalid response from server");
      }

      // Store token + companyId in session
      setCompanySession(token, companyId);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: result.data as unknown as User },
      });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Login failed";

      dispatch({
        type: "LOGIN_ERROR",
        payload: { errorMessage },
      });
      throw err;
    }
  };

  const logout = async () => {
    clearSelectedCompany();
    setCompanySession(null, null);
    dispatch({ type: "LOGOUT" });
  };

  if (!children) {
    return null;
  }

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}