// Import Dependencies
import { useEffect, useReducer, useRef, ReactNode } from "react";


// Local Imports
import axios from "@/utils/axios";
import { isTokenValid, setSession } from "@/utils/jwt";
import { clearSelectedCompany } from "@/utils/companyStorage";
import { AuthProvider as AuthContext, AuthContextType } from "./context";
import { User } from "@/@types/user";


// ----------------------------------------------------------------------


interface AuthAction {
  type:
    | "INITIALIZE"
    | "LOGIN_REQUEST"
    | "LOGIN_SUCCESS"
    | "LOGIN_ERROR"
    | "LOGOUT"
    | "OTP_SUCCESS"
    | "OTP_ERROR";
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
  verifyOtp: async () => {},
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
  }),


  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    errorMessage: null,
    user: action.payload?.user ?? null,
  }),


  LOGIN_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload?.errorMessage ?? "An error occurred",
    isLoading: false,
  }),


  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),


  OTP_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user: action.payload?.user ?? null,
  }),


  OTP_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload?.errorMessage ?? "Invalid OTP",
    isLoading: false,
  }),
};


// Reducer function
const reducer = (
  state: AuthContextType,
  action: AuthAction,
): AuthContextType => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};


const FIXED_OTP = "1111";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const pendingAuthTokenRef = useRef<string | null>(null);


  useEffect(() => {
    const init = async () => {
      try {
        const authToken = window.localStorage.getItem("authToken");


        if (authToken && isTokenValid(authToken)) {
          setSession(authToken);


          const response = await axios.get<{ user: User }>("/user/profile");
          const { user } = response.data;


          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };


    init();
  }, []);


  const login = async (credentials: { username: string; password: string }) => {
    dispatch({ type: "LOGIN_REQUEST" });


    try {
      const response = await axios.post<{ authToken: string; user: User }>(
        "/login",
        credentials,
      );
      const { authToken, user } = response.data;


      if (
        typeof authToken !== "string" ||
        typeof user !== "object" ||
        user === null
      ) {
        throw new Error("Response is not valid");
      }


      pendingAuthTokenRef.current = authToken;

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user },
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err instanceof Error ? err.message : "Login failed",
        },
      });
      throw err;
    }
  };


  const verifyOtp = async (otp: string) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      if (otp !== FIXED_OTP) {
        throw new Error("Invalid OTP");
      }

      if (!state.user) {
        throw new Error("Session expired. Please login again.");
      }

      if (pendingAuthTokenRef.current) {
        setSession(pendingAuthTokenRef.current);
        pendingAuthTokenRef.current = null;
      }

      dispatch({ type: "OTP_SUCCESS", payload: { user: state.user } });
    } catch (err) {
      dispatch({
        type: "OTP_ERROR",
        payload: {
          errorMessage: err instanceof Error ? err.message : "OTP verification failed",
        },
      });
      throw err;
    }
  };


  const logout = async () => {
    pendingAuthTokenRef.current = null;
    clearSelectedCompany();
    setSession(null);
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
        verifyOtp,
      }}
    >
      {children}
    </AuthContext>
  );
}