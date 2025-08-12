import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView className="bg-cream h-full">
      <View className="flex-1 px-8 justify-center">
        {/* Header Section */}
        <View className="mb-8">
          <Text className="text-center font-worksans-medium text-blue text-lg mb-3">
            Join{" "}
            <Text className="font-worksans-bold text-orange">CampusFlip</Text>
          </Text>
          <Text className="text-4xl font-worksans-bold text-blue text-center leading-tight mb-2">
            Your Campus Marketplace
          </Text>
          <Text className="text-lg font-worksans text-blue/60 text-center">
            Where students buy and sell
          </Text>
        </View>

        {/* Name Inputs */}
        <View className="mb-4">
          <View className="flex-row">
            {/* First Name Input */}
            <View className="flex-1 mr-3">
              <Text className="text-base font-worksans-semibold text-blue mb-2">
                First Name
              </Text>
              <View className="bg-white/80 rounded-2xl px-4 py-4 border border-white/50">
                <TextInput
                  className="font-worksans text-blue text-base"
                  placeholder="John"
                  placeholderTextColor="#3d405b60"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  style={{
                    paddingVertical: 4,
                    textAlignVertical: "center",
                    minHeight: 20,
                  }}
                />
              </View>
            </View>

            {/* Last Name Input */}
            <View className="flex-1 ml-3">
              <Text className="text-base font-worksans-semibold text-blue mb-2">
                Last Name
              </Text>
              <View className="bg-white/80 rounded-2xl px-4 py-4 border border-white/50">
                <TextInput
                  className="font-worksans text-blue text-base"
                  placeholder="Doe"
                  placeholderTextColor="#3d405b60"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  style={{
                    paddingVertical: 4,
                    textAlignVertical: "center",
                    minHeight: 20,
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* University Email Input */}
        <View className="mb-4">
          <Text className="text-base font-worksans-semibold text-blue mb-2">
            University Email
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
        <View className="mb-6">
          <Text className="text-base font-worksans-semibold text-blue mb-2">
            Password
          </Text>
          <View className="flex-row items-center bg-white/80 rounded-2xl px-4 py-4 border border-white/50">
            <Ionicons name="lock-closed-outline" size={22} color="#3d405b" />
            <TextInput
              className="flex-1 ml-4 font-worksans text-blue text-base"
              placeholder="Create a strong password"
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

        {/* Sign Up Button */}
        <TouchableOpacity className="bg-orange rounded-2xl py-5 mb-6 shadow-sm">
          <Text className="text-center font-worksans-bold text-white text-lg">
            Create Account
          </Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="flex-row justify-center items-center">
          <Text className="font-worksans text-blue text-base">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity>
            <Text className="font-worksans-bold text-orange text-base">
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
