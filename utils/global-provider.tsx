import * as React from "react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSupabase } from "./useSupabase";

// Use Supabase's User type directly for better compatibility
import type { User } from "@supabase/supabase-js";
import { auth } from "./supabase";

// Profile interface matching your complete database schema
interface Profile {
  id: string;
  name: string;
  username?: string;
  profile_picture?: string;
  bio?: string;
  rating_average?: number;
  rating_count?: number;
  follower_count?: number;
  following_count?: number;
  is_verified?: boolean;
  stripe_customer?: string;
  stripe_seller_account?: string;
  is_banned?: boolean;
  created_at: string;
  updated_at?: string;
  hasOnboarded?: boolean;
}

interface GlobalContextType {
  isLoggedIn: boolean;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refetch: (newParams?: Record<string, any>) => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Create a wrapper function that matches the expected signature
  const getUser = useCallback(async () => {
    return auth.getCurrentUser();
  }, []);

  const {
    data: userResult,
    loading,
    refetch,
  } = useSupabase({
    fn: getUser,
    skip: false, // Auto-execute on mount
  });

  // Extract user from the result
  const user = userResult?.user || null;
  const isLoggedIn = !!user;

  // Fetch profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        return;
      }

      setProfileLoading(true);
      try {
        const { data: profileData, error } = await auth.getUserProfile(user.id);
        if (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const refetchProfile = useCallback(async () => {
    if (!user?.id) return;

    setProfileLoading(true);
    try {
      const { data: profileData, error } = await auth.getUserProfile(user.id);
      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  const combinedLoading = loading || profileLoading;

  // Create a wrapper for refetch to match the expected signature
  const refetchWrapper = useCallback(
    async (newParams?: Record<string, any>) => {
      await refetch(newParams || {});
    },
    [refetch]
  );

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        user,
        profile,
        loading: combinedLoading,
        refetch: refetchWrapper,
        refetchProfile,
      }}
    >
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
