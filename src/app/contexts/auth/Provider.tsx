import { useEffect, useReducer, ReactNode } from "react";
import { Post, toastsuccessmsg, toasterrormsg } from "@/ApiHelper";
import { isTokenValid, setSession } from "@/utils/jwt";
import { AuthProvider as AuthContext, AuthContextType } from "./context";
import { User } from "@/@types/user";

interface AuthAction {
  type:
    | "INITIALIZE"
    | "LOGIN_REQUEST"
    | "LOGIN_SUCCESS"
    | "LOGIN_ERROR"
    | "LOGOUT"
    | "SESSION_ESTABLISHED";
  payload?: Partial<AuthContextType>;
}

const initialState: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  pendingToken: null,
  pendingEmail: null,
  login: async () => {},
  completeAuth: () => {},
  logout: async () => {},
};

const EXPIRES_AT_KEY = "authExpiresAt";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours inactivity

const isSessionExpired = () => {
  const expiresAt = window.localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAt) return true;
  return Date.now() > Number(expiresAt);
};

// call this on login AND on every user activity to slide the window
const resetExpiry = () => {
  window.localStorage.setItem(
    EXPIRES_AT_KEY,
    String(Date.now() + SESSION_DURATION_MS),
  );
};

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

  // ✅ CHANGE #1 — ab user bhi set hoga (pehle sirf pendingToken/pendingEmail set hote the)
  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: false,
    isLoading: false,
    errorMessage: null,
    pendingToken: action.payload?.pendingToken ?? null,
    pendingEmail: action.payload?.pendingEmail ?? null,
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
    pendingToken: null,
    pendingEmail: null,
  }),

  SESSION_ESTABLISHED: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    errorMessage: null,
    user: action.payload?.user ?? state.user,
    pendingToken: null,
  }),
};

const reducer = (
  state: AuthContextType,
  action: AuthAction,
): AuthContextType => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

const PENDING_TOKEN_KEY = "pendingToken";
const PENDING_EMAIL_KEY = "pendingEmail";
const COMPANY_ID_KEY = "companyId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const authToken = window.localStorage.getItem("authToken");
        const companyId = window.localStorage.getItem(COMPANY_ID_KEY);

        if (
          authToken &&
          isTokenValid(authToken) &&
          companyId &&
          !isSessionExpired()
        ) {
          setSession(authToken);
          const userStr = window.localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          dispatch({
            type: "INITIALIZE",
            payload: { isAuthenticated: true, user },
          });
        } else {
          // clear stale/expired session
          window.localStorage.removeItem("authToken");
          window.localStorage.removeItem(COMPANY_ID_KEY);
          window.localStorage.removeItem("user");
          window.localStorage.removeItem(EXPIRES_AT_KEY);
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

  useEffect(() => {
    const handleForceLogout = () => {
      logout();
    };

    window.addEventListener("force-logout", handleForceLogout);

    return () => {
      window.removeEventListener("force-logout", handleForceLogout);
    };
  }, []);

  useEffect(() => {
    if (!state.isAuthenticated) return;

    let timer: ReturnType<typeof setTimeout>;

    const scheduleCheck = () => {
      clearTimeout(timer);
      const expiresAt = Number(window.localStorage.getItem(EXPIRES_AT_KEY));
      const msLeft = expiresAt - Date.now();

      if (msLeft <= 0) {
        logout();
        toasterrormsg("Session expired due to inactivity.");
        return;
      }
      timer = setTimeout(scheduleCheck, msLeft);
    };

    const handleActivity = () => {
      resetExpiry();
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, handleActivity));

    scheduleCheck();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [state.isAuthenticated]);

  // STEP 1: login validate — OTP nahi
  const login = async (credentials: { email: string; password: string }) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const response = await Post(
        "superadmin/login",
        { email: credentials.email, password: credentials.password },
        false,
      );
      const result = response.data;

      if (result.status !== 200) {
        throw new Error(result.message || "Login failed");
      }

      // ✅ CHANGE #2 — companyId/companyName bhi destructure kiya
      const { token, email, companyId, companyName } = result.data;

      window.localStorage.setItem(PENDING_TOKEN_KEY, token);
      window.localStorage.setItem(PENDING_EMAIL_KEY, email);
      setSession(token); // axios Authorization header set karega

      toastsuccessmsg(result.message);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          pendingToken: token,
          pendingEmail: email,
          user: { companyId, companyName, email } as unknown as User,
        },
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Login failed";
      toasterrormsg(message);
      dispatch({ type: "LOGIN_ERROR", payload: { errorMessage: message } });
      throw err;
    }
  };

  // STEP 2: company select/create hone ke baad final auth
  const completeAuth = (companyId: string) => {
    const token =
      state.pendingToken || window.localStorage.getItem(PENDING_TOKEN_KEY);

    if (!token) {
      toasterrormsg("Session expired. Please login again.");
      return;
    }

    setSession(token);

    window.localStorage.setItem("authToken", token);
    window.localStorage.setItem(COMPANY_ID_KEY, companyId);
    window.localStorage.setItem("authToken", token); // (duplicate line, already existed)
    window.localStorage.setItem("user", JSON.stringify(state.user));
    resetExpiry(); // was setExpiry() — wrong name, causes ReferenceError
    window.localStorage.removeItem(PENDING_TOKEN_KEY);
    window.localStorage.removeItem(PENDING_EMAIL_KEY);

    dispatch({ type: "SESSION_ESTABLISHED", payload: { user: state.user } });
  };

  const logout = async () => {
    setSession(null);
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem(COMPANY_ID_KEY);
    window.localStorage.removeItem("authToken"); // (duplicate line, already existed)
    window.localStorage.removeItem("user");
    window.localStorage.removeItem(PENDING_TOKEN_KEY);
    window.localStorage.removeItem(PENDING_EMAIL_KEY);
    window.localStorage.removeItem(EXPIRES_AT_KEY); // add alongside the other removeItem calls
    dispatch({ type: "LOGOUT" });
  };

  if (!children) return null;

  return (
    <AuthContext value={{ ...state, login, completeAuth, logout }}>
      {children}
    </AuthContext>
  );
}
