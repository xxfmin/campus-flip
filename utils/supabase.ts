import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import "react-native-url-polyfill/auto";

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Authentication types
export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Authentication functions
export const auth = {
  // Check if email is already registered
  async checkEmailExists(email: string) {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;

      // Check if any user has this email
      const userExists = data.users.some((user) => user.email === email);
      return { exists: userExists, error: null };
    } catch (error) {
      // If admin access is not available, we'll handle it in signUp
      return { exists: false, error };
    }
  },

  // Sign up with email and password
  async signUp({ email, password, firstName, lastName }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      // If user was created successfully, create a profile
      if (data.user) {
        const { error: profileError } = await supabase.from("Profiles").insert({
          id: data.user.id,
          name: `${firstName} ${lastName}`,
          hasOnboarded: false,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation failed:", profileError);
          console.error("Profile error details:", profileError);
        } else {
          console.log("Profile created successfully for user:", data.user.id);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email and password
  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Get user profile from profiles table
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("Profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update specific profile fields
  async updateProfileField(userId: string, field: string, value: any) {
    try {
      const { data, error } = await supabase
        .from("Profiles")
        .update({
          [field]: value,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update follower/following counts
  async updateFollowCounts(
    userId: string,
    type: "follower" | "following",
    increment: boolean
  ) {
    const field = type === "follower" ? "follower_count" : "following_count";
    const currentValue = increment ? 1 : -1;

    try {
      const { data, error } = await supabase
        .from("Profiles")
        .update({
          [field]: supabase.rpc("increment", {
            row_id: userId,
            column_name: field,
            amount: currentValue,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update rating
  async updateRating(userId: string, newRating: number) {
    try {
      // Get current rating data
      const { data: currentProfile } = await this.getUserProfile(userId);
      if (!currentProfile) throw new Error("Profile not found");

      const currentAverage = currentProfile.rating_average || 0;
      const currentCount = currentProfile.rating_count || 0;

      // Calculate new average
      const newCount = currentCount + 1;
      const newAverage = (currentAverage * currentCount + newRating) / newCount;

      const { data, error } = await supabase
        .from("Profiles")
        .update({
          rating_average: newAverage,
          rating_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "campusflip://reset-password",
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Update user profile
  async updateProfile(updates: { first_name?: string; last_name?: string }) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update profile in profiles table
  async updateProfileData(
    userId: string,
    profileData: {
      name?: string;
      username?: string;
      bio?: string;
      profile_picture?: string;
      hasOnboarded?: boolean;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from("Profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create or update profile in profiles table
  async createOrUpdateProfile(
    userId: string,
    profileData: {
      name?: string;
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
      hasOnboarded?: boolean;
    }
  ) {
    try {
      const { data, error } = await supabase.from("Profiles").upsert(
        {
          id: userId,
          name: profileData.name,
          username: profileData.username,
          profile_picture: profileData.profile_picture,
          bio: profileData.bio,
          rating_average: profileData.rating_average,
          rating_count: profileData.rating_count,
          follower_count: profileData.follower_count,
          following_count: profileData.following_count,
          is_verified: profileData.is_verified,
          stripe_customer: profileData.stripe_customer,
          stripe_seller_account: profileData.stripe_seller_account,
          is_banned: profileData.is_banned,
          hasOnboarded: profileData.hasOnboarded ?? false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
