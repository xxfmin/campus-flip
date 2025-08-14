import { useGlobalContext } from "@/utils/global-provider";
import { storage } from "@/utils/storage";
import { auth, supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OnboardingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profilePicture: null as string | null,
  });
  const [errors, setErrors] = useState({
    username: "",
    bio: "",
  });
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");

  const { profile, refetchProfile } = useGlobalContext();

  // Username validation constants
  const USERNAME_MIN_LENGTH = 3;
  const USERNAME_MAX_LENGTH = 20;
  const BIO_MAX_LENGTH = 500;

  // Username validation regex (alphanumeric and underscores only)
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

  // Check username uniqueness
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < USERNAME_MIN_LENGTH) {
      setUsernameStatus("invalid");
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      setUsernameStatus("invalid");
      return;
    }

    setIsCheckingUsername(true);
    try {
      // Check if username exists in profiles table
      const { data, error } = await supabase
        .from("Profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .neq("id", profile?.id || "") // Exclude current user
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows returned (username available)
        console.error("Error checking username:", error);
        setUsernameStatus("invalid");
        return;
      }

      if (data) {
        setUsernameStatus("taken");
      } else {
        setUsernameStatus("available");
      }
    } catch (error) {
      console.error("Username check error:", error);
      setUsernameStatus("invalid");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username.trim()) {
        checkUsernameAvailability(formData.username.trim());
      } else {
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  // Validate form
  const validateForm = () => {
    const newErrors = {
      username: "",
      bio: "",
    };

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < USERNAME_MIN_LENGTH) {
      newErrors.username = `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
    } else if (formData.username.trim().length > USERNAME_MAX_LENGTH) {
      newErrors.username = `Username must be ${USERNAME_MAX_LENGTH} characters or less`;
    } else if (!USERNAME_REGEX.test(formData.username.trim())) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    } else if (usernameStatus === "taken") {
      newErrors.username = "Username is already taken";
    } else if (usernameStatus === "checking") {
      newErrors.username = "Checking username availability...";
    } else if (usernameStatus === "invalid") {
      newErrors.username = "Username is invalid";
    }

    // Bio validation
    if (formData.bio.trim().length > BIO_MAX_LENGTH) {
      newErrors.bio = `Bio must be ${BIO_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, profilePicture: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;

    // Clear previous errors
    setErrors({ username: "", bio: "" });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Update the profile with onboarding data
      const { error } = await auth.updateProfileData(profile.id, {
        username: formData.username.trim().toLowerCase(),
        bio: formData.bio.trim() || undefined,
        hasOnboarded: true,
      });

      if (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to save profile");
        return;
      }

      // Handle profile picture upload if selected
      if (formData.profilePicture) {
        const { url, error: uploadError } = await storage.uploadProfilePicture(
          profile.id,
          formData.profilePicture
        );

        if (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          // Continue without profile picture if upload fails
        } else if (url) {
          // Profile picture URL is automatically updated by storage utility
          console.log("Profile picture uploaded successfully");
        }
      }

      // Refresh profile data
      await refetchProfile();

      // Navigate to main app
      router.replace("/(root)/(tabs)");
    } catch (error) {
      console.error("Onboarding error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUsernameStatusColor = () => {
    switch (usernameStatus) {
      case "available":
        return "text-green-600";
      case "taken":
        return "text-red-600";
      case "checking":
        return "text-yellow-600";
      case "invalid":
        return "text-red-600";
      default:
        return "text-blue/60";
    }
  };

  const getUsernameStatusText = () => {
    switch (usernameStatus) {
      case "available":
        return "✓ Username available";
      case "taken":
        return "✗ Username taken";
      case "checking":
        return "Checking...";
      case "invalid":
        return "Invalid username";
      default:
        return "";
    }
  };

  const isFormValid = () => {
    return (
      formData.username.trim().length >= USERNAME_MIN_LENGTH &&
      formData.username.trim().length <= USERNAME_MAX_LENGTH &&
      USERNAME_REGEX.test(formData.username.trim()) &&
      usernameStatus === "available" &&
      formData.bio.trim().length <= BIO_MAX_LENGTH
    );
  };

  return (
    <SafeAreaView className="bg-cream h-full">
      <View className="flex-1 px-8">
        {/* Header Section */}
        <View className="mb-8 mt-8">
          <Text className="text-4xl font-worksans-bold text-blue text-center leading-tight mb-3">
            Complete Your Profile
          </Text>
          <Text className="text-lg font-worksans text-blue/60 text-center">
            Let's get you set up on CampusFlip
          </Text>
        </View>

        {/* Profile Picture Section */}
        <View className="mb-8 items-center">
          <TouchableOpacity
            onPress={pickImage}
            className="w-32 h-32 rounded-full bg-white/80 border-2 border-white/50 items-center justify-center mb-4"
          >
            {formData.profilePicture ? (
              <Image
                source={{ uri: formData.profilePicture }}
                className="w-full h-full rounded-full"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="camera-outline" size={40} color="#3d405b" />
                <Text className="font-worksans text-blue text-sm mt-2 text-center">
                  Add Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="font-worksans text-blue/60 text-sm text-center">
            Tap to add a profile picture (optional)
          </Text>
        </View>

        {/* Username Input */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-worksans-semibold text-blue">
              Username <Text className="text-red-500">*</Text>
            </Text>
            <Text className="text-sm font-worksans text-blue/60">
              {formData.username.length}/{USERNAME_MAX_LENGTH}
            </Text>
          </View>
          <View className="flex-row items-center bg-white/80 rounded-2xl px-4 py-4 border border-white/50">
            <Ionicons name="at-outline" size={22} color="#3d405b" />
            <TextInput
              className="flex-1 ml-4 font-worksans text-blue text-base"
              placeholder="Choose a username"
              placeholderTextColor="#3d405b60"
              value={formData.username}
              onChangeText={(text) =>
                setFormData({ ...formData, username: text })
              }
              autoCapitalize="none"
              maxLength={USERNAME_MAX_LENGTH}
              style={{
                paddingVertical: 4,
                textAlignVertical: "center",
                minHeight: 20,
              }}
            />
          </View>

          {/* Username status and errors */}
          {usernameStatus !== "idle" && (
            <Text
              className={`text-sm font-worksans mt-2 ${getUsernameStatusColor()}`}
            >
              {getUsernameStatusText()}
            </Text>
          )}
          {errors.username && (
            <Text className="text-red-600 text-sm font-worksans mt-2">
              {errors.username}
            </Text>
          )}

          {/* Username requirements */}
          <Text className="text-xs font-worksans text-blue/60 mt-2">
            • {USERNAME_MIN_LENGTH}-{USERNAME_MAX_LENGTH} characters
          </Text>
          <Text className="text-xs font-worksans text-blue/60">
            • Letters, numbers, and underscores only
          </Text>
        </View>

        {/* Bio Input */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-worksans-semibold text-blue">
              Bio{" "}
              <Text className="font-worksans text-xs text-blue/60">
                (optional)
              </Text>
            </Text>
            <Text className="text-sm font-worksans text-blue/60">
              {formData.bio.length}/{BIO_MAX_LENGTH}
            </Text>
          </View>
          <View className="bg-white/80 rounded-2xl px-4 py-4 border border-white/50">
            <TextInput
              className="font-worksans text-blue text-base"
              placeholder="Tell us a bit about yourself..."
              placeholderTextColor="#3d405b60"
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={BIO_MAX_LENGTH}
              style={{
                minHeight: 100,
              }}
            />
          </View>

          {/* Bio errors */}
          {errors.bio && (
            <Text className="text-red-600 text-sm font-worksans mt-2">
              {errors.bio}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`rounded-2xl py-5 mb-8 shadow-sm ${
            !isFormValid() || isSubmitting ? "bg-gray-400" : "bg-orange"
          }`}
          onPress={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
        >
          <Text className="text-center font-worksans-bold text-white text-lg">
            {isSubmitting ? "Setting up..." : "Get Started!"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingPage;
