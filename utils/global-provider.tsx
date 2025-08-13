import { createContext, ReactNode, useCallback, useContext } from "react";
import { useSupabase } from "./useSupabase";

// Use Supabase's User type directly for better compatibility
import type { User } from "@supabase/supabase-js";
import { auth } from "./supabase";

interface GlobalContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  refetch: (newParams?: Record<string, any>) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  // Create a wrapper function that matches the expected signature
  const getUser = useCallback(async () => {
    return auth.getCurrentUser();
  }, []);

  const {
    data: user,
    loading,
    refetch,
  } = useSupabase({
    fn: getUser,
    skip: false, // Auto-execute on mount
  });

  const isLoggedIn = !!user;

  return (
    <GlobalContext.Provider value={{ isLoggedIn, user, loading, refetch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }

  return context;
};

export default GlobalProvider;
