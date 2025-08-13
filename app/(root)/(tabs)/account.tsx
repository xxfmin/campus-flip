import icons from "@/constants/icons";
import images from "@/constants/images";
import { useGlobalContext } from "@/utils/global-provider";
import { auth } from "@/utils/supabase";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AccountItemProps {
  icon: ImageSourcePropType;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const AccountItem = ({ icon, title, subtitle, onPress }: AccountItemProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View className="flex flex-row items-center">
        <View className="size-14 items-center justify-center rounded-full bg-gray-100">
          <Image source={icon} className="size-6" />
        </View>

        <View className="flex flex-col pl-4 justify-center">
          <Text className="text-xl font-worksans-medium text-blue">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm font-worksans text-gray-500">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Account = () => {
  const { user, profile, refetch } = useGlobalContext();

  const handleLogout = async () => {
    const result = await auth.signOut();

    if (result.error) {
      Alert.alert("Error", "An error occured while logging out");
    } else {
      await refetch();
      router.replace("/(auth)/signin");
    }
  };

  return (
    <SafeAreaView className="h-full bg-gray-100/90">
      {/* Header */}
      <View className="flex flex-row items-center my-3 ml-5">
        <TouchableOpacity>
          <Image
            source={images.blankProfilePicture}
            className="size-14 rounded-full"
          />
        </TouchableOpacity>
        <TouchableOpacity className="flex flex-col pl-4 justify-center">
          <Text className="text-2xl font-worksans-bold text-blue">
            {profile?.name ||
              (user?.user_metadata?.first_name && user?.user_metadata?.last_name
                ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                : user?.email || "User")}
          </Text>
          <Text className="text-sm font-worksans">View profile 〉</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View className="pb-32 px-5 bg-white h-full">
        <View className="flex flex-col mt-6 gap-y-4">
          <Text className="font-worksans-bold text-2xl text-blue">
            Shopping
          </Text>
          <AccountItem
            icon={icons.heart}
            title="Wishlist"
            subtitle="Keep tabs on wished items"
          />
          <AccountItem
            icon={icons.orders}
            title="Purchases"
            subtitle="Your order history"
          />
          <AccountItem
            icon={icons.history}
            title="Recently viewed"
            subtitle="Listings you recently viewed"
          />
        </View>

        <View className="h-px bg-gray-200 my-6" />

        <View className="flex flex-col gap-y-4">
          <Text className="font-worksans-bold text-2xl text-blue">Selling</Text>
          <AccountItem
            icon={icons.plus}
            title="List an item"
            subtitle="Put your items up to sale"
          />

          <AccountItem
            icon={icons.pricetag}
            title="My listings"
            subtitle="Manage your listings and sales"
          />
        </View>

        <View className="h-px bg-gray-200 my-6" />

        <View className="flex flex-col">
          <Text className="font-worksans-bold text-2xl mb-4 text-blue">
            Account
          </Text>
          <AccountItem icon={icons.settings} title="Settings" />
          <TouchableOpacity onPress={handleLogout}>
            <Text className="text-md font-worksans-medium mt-6 text-blue">
              Sign out
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Account;
