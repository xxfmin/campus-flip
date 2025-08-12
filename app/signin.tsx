import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView className="bg-cream h-full">
      <View className="flex-1 px-8 justify-center">
        {/* Header Section */}
        <View className="mb-16">
          <Text className="text-center font-worksans-medium text-blue text-lg mb-4">
            Welcome to{" "}
            <Text className="font-worksans-bold text-orange">CampusFlip</Text>
          </Text>
          <Text className="text-4xl font-worksans-bold text-blue text-center leading-tight mb-3">
            Discover Campus Treasures
          </Text>
          <Text className="text-lg font-worksans text-blue/60 text-center">
            From Students, For Students
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-6">
          <Text className="text-base font-worksans-semibold text-blue mb-3">
            Email
          </Text>
          <View className="flex-row items-center bg-white/80 rounded-2xl px-4 py-4 border border-white/50">
            <Ionicons name="mail-outline" size={22} color="#3d405b" />
            <TextInput
              className="flex-1 ml-4 font-worksans text-blue text-base"
              placeholder="Enter your university email"
              placeholderTextColor="#3d405b60"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                paddingVertical: 4,
                textAlignVertical: "center",
                minHeight: 20,
              }}
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="text-base font-worksans-semibold text-blue mb-3">
            Password
          </Text>
          <View className="flex-row items-center bg-white/80 rounded-2xl px-4 py-4 border border-white/50">
            <Ionicons name="lock-closed-outline" size={22} color="#3d405b" />
            <TextInput
              className="flex-1 ml-4 font-worksans text-blue text-base"
              placeholder="Enter your password"
              placeholderTextColor="#3d405b60"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              style={{
                paddingVertical: 4,
                textAlignVertical: "center",
                minHeight: 20,
              }}
            />
          </View>
        </View>

        {/* Forgot Password */}
        <View className="items-end mb-10">
          <TouchableOpacity>
            <Text className="font-worksans-light text-orange text-base">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity className="bg-orange rounded-2xl py-5 mb-12 shadow-sm">
          <Text className="text-center font-worksans-bold text-white text-lg">
            Login
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center">
          <Text className="font-worksans text-blue text-base">
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity>
            <Text className="font-worksans-bold text-orange text-base">
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;
