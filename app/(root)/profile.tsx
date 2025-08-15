import icons from "@/constants/icons";
import images from "@/constants/images";
import { useGlobalContext } from "@/utils/global-provider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { profile, user } = useGlobalContext();
  const [imageError, setImageError] = useState(false);

  return (
    <SafeAreaView className="h-full bg-gray-100/90">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Top Section */}
        <View className="bg-orange h-32 relative">
          {/* Back Button */}
          <TouchableOpacity
            className="absolute top-4 left-4 w-10 h-10 bg-white rounded-lg items-center justify-center shadow-sm"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-lg items-center justify-center shadow-sm"
            onPress={() => router.push("/account")}
          >
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Main Content Card */}
        <View className="bg-orange">
          <View className="bg-white rounded-t-3xl px-5 pt-6 pb-8">
            {/* Profile Picture and Add Friends Button */}
            <View className="flex-row items-start justify-between mb-6">
              <Image
                source={
                  profile?.profile_picture && !imageError
                    ? { uri: profile.profile_picture }
                    : images.blankProfilePicture
                }
                className="w-24 h-24 rounded-full"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />

              <TouchableOpacity className="bg-white border-2 border-orange-500 rounded-lg px-4 py-2">
                <Text className="text-orange-500 font-worksans-semibold text-base">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </View>

            {/* User Info and Stats */}
            <View className="flex-row items-start justify-between mb-8">
              <View className="flex-1">
                <Text className="text-2xl font-worksans-bold text-black mb-1">
                  {profile?.name || "User"}
                </Text>
                <Text className="text-base font-worksans text-black/70">
                  {profile?.username ? `@${profile.username}` : "No username"}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-2xl font-worksans-bold text-black">
                  {profile?.follower_count || 0}
                </Text>
                <Text className="text-sm font-worksans text-black/70">
                  Followers
                </Text>
              </View>

              <View className="items-end ml-6">
                <Text className="text-2xl font-worksans-bold text-black">
                  {profile?.following_count || 0}
                </Text>
                <Text className="text-sm font-worksans text-black/70">
                  Following
                </Text>
              </View>
            </View>

            {/* Additional Profile Content */}
            {/* Bio Section */}
            {profile?.bio && (
              <View className="mb-6">
                <Text className="text-base font-worksans text-black leading-6">
                  {profile.bio}
                </Text>
              </View>
            )}

            {/* Rating Section */}
            <View className="mb-6">
              <View className="flex-row items-center">
                <View className="flex-row mr-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = profile?.rating_average || 0;
                    const isFilled = star <= Math.round(rating);
                    return (
                      <Image
                        key={star}
                        source={icons.star}
                        className={`w-5 h-5 mr-1 ${isFilled ? "opacity-100" : "opacity-30"}`}
                        style={{
                          tintColor: isFilled ? "#f97316" : "#9ca3af", // Orange for filled, gray for empty
                        }}
                      />
                    );
                  })}
                </View>
                {profile?.rating_count &&
                  profile.rating_count > 1 &&
                  profile?.rating_average && (
                    <View className="flex-row items-center">
                      <Text className="text-base font-worksans-semibold text-black mr-1">
                        {profile.rating_average.toFixed(1)}
                      </Text>
                      <Text className="text-sm font-worksans text-black/50">
                        /5
                      </Text>
                    </View>
                  )}
              </View>
              <Text className="text-sm font-worksans text-black/70 mt-2">
                {profile?.rating_count || 0} reviews
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
