import { useGlobalContext } from "@/utils/global-provider";
import { auth } from "@/utils/supabase";
import { Link, router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { refetch } = useGlobalContext();

  const handleLogout = async () => {
    console.log("Logout button clicked");

    try {
      console.log("Calling auth.signOut()...");
      const result = await auth.signOut();

      console.log("SignOut result:", result);

      if (result.error) {
        console.error("Logout error:", result.error);
        return;
      }

      console.log("Logout successful, updating global context...");

      // Update the global context to reflect the logout
      await refetch();

      console.log("Global context updated, navigating to signin...");
      // Navigate back to signin page after successful logout
      router.push("/(auth)/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Welcome to CampusFlip!
      </Text>

      <Link href="/signin">Sign In</Link>
      <Link href="/signup">Sign Up</Link>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: "#ff6b35",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
