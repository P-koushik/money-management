"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import Cookies from "js-cookie";

import { auth, googleProvider } from "@/lib/firebase";

// 🔹 Define context types
type TAuthContextType = {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

type TSyncUserRequest = {
  uid: string;
  email: string | null;
  name: string | null;
};

// 🔹 Create context with undefined as initial value
const AuthContext = createContext<TAuthContextType | undefined>(undefined);

// 🔹 useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 🔹 AuthProvider Props type
type TAuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: TAuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const lastSyncedUid = useRef<string | null>(null);
  const isNewRegistration = useRef<boolean>(false);
  const skipAutoRedirect = useRef<boolean>(false);

  // 🔹 Sync Firebase user on change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged triggered:", firebaseUser?.email);
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          const token = await getIdToken(firebaseUser, true);
          setTokenCookie(token);

          if (skipAutoRedirect.current) {
            skipAutoRedirect.current = false;
            return;
          }

          if (lastSyncedUid.current !== firebaseUser.uid) {
            lastSyncedUid.current = firebaseUser.uid;
            await syncUserToBackend(firebaseUser, token, false);
          }
        } catch (error: unknown) {
          console.error("Error syncing user:", error);
        }
      } else {
        removeTokenCookie();
        lastSyncedUid.current = null;
        isNewRegistration.current = false;
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Sync to backend (no RBAC now)
  const syncUserToBackend = async (
    firebaseUser: FirebaseUser,
    token: string,
    forceRedirect?: boolean
  ) => {
    try {
      const body: TSyncUserRequest = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
      };

      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Backend sync success:", data);

        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        const isOnAuthPage = currentPath.includes("/auth/");

        if (forceRedirect) {
          router.push("/dashboard");
        } else if (isOnAuthPage) {
          router.push("/dashboard");
        }

        isNewRegistration.current = false;
      } else {
        console.error("Backend sync failed with status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (err: unknown) {
      console.error("Backend sync failed:", err);
    }
  };

  const setTokenCookie = (token: string) => {
    Cookies.set("token", token, { path: "/", sameSite: "strict" });
  };

  const removeTokenCookie = () => {
    Cookies.remove("token", { path: "/" });
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("========== REGISTRATION STARTED ==========");
      isNewRegistration.current = true;
      skipAutoRedirect.current = true;

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCred.user, { displayName: name });
      const token = await getIdToken(userCred.user, true);
      setTokenCookie(token);
      setUser(userCred.user);

      await syncUserToBackend(userCred.user, token, true);

      console.log("========== REGISTRATION COMPLETED ==========");
    } catch (error) {
      console.error("Registration error:", error);
      isNewRegistration.current = false;
      skipAutoRedirect.current = false;
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("========== LOGIN STARTED ==========");
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdToken(userCred.user, true);
      setTokenCookie(token);

      await syncUserToBackend(userCred.user, token, true);
      console.log("========== LOGIN COMPLETED ==========");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log("========== GOOGLE LOGIN STARTED ==========");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await getIdToken(user, true);
      setTokenCookie(token);

      await syncUserToBackend(user, token, true);
      console.log("========== GOOGLE LOGIN COMPLETED ==========");
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      removeTokenCookie();
      router.push("/login");
    } catch (err: unknown) {
      alert("Logout failed: " + err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
