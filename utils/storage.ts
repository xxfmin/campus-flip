import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

// Storage bucket names
export const BUCKETS = {
  PROFILES: "profile-pictures",
  LISTINGS: "listing-images",
} as const;

// Image upload utilities
export const storage = {
  // Upload profile picture
  async uploadProfilePicture(userId: string, imageUri: string) {
    try {
      // Read the image file
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate unique filename
      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKETS.PROFILES)
        .upload(fileName, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: true, // Replace if exists
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKETS.PROFILES).getPublicUrl(data.path);

      // Update user profile with new picture URL in the profile_picture field
      const { error: updateError } = await supabase
        .from("Profiles")
        .update({
          profile_picture: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error("Upload profile picture error:", error);
      return { url: null, error };
    }
  },

  // Upload listing images (multiple)
  async uploadListingImages(
    listingId: string,
    imageUris: string[],
    userId: string
  ) {
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < imageUris.length; i++) {
        const imageUri = imageUris[i];

        // Read the image file
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Generate unique filename
        const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${userId}/${listingId}/image-${Date.now()}-${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(BUCKETS.LISTINGS)
          .upload(fileName, decode(base64), {
            contentType: `image/${fileExt}`,
          });

        if (error) throw error;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKETS.LISTINGS).getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      return { urls: uploadedUrls, error: null };
    } catch (error) {
      console.error("Upload listing images error:", error);
      return { urls: [], error };
    }
  },

  // Delete profile picture
  async deleteProfilePicture(userId: string, currentPictureUrl?: string) {
    try {
      // If there's a current picture URL, extract the path and delete from storage
      if (currentPictureUrl && currentPictureUrl.includes("profile-pictures")) {
        const urlParts = currentPictureUrl.split("/profile-pictures/");
        if (urlParts[1]) {
          const path = urlParts[1].split("?")[0]; // Remove any query params
          await supabase.storage.from(BUCKETS.PROFILES).remove([path]);
        }
      }

      // Update profile to remove picture URL
      const { error } = await supabase
        .from("Profiles")
        .update({
          profile_picture: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Delete profile picture error:", error);
      return { success: false, error };
    }
  },

  // Delete listing images
  async deleteListingImages(paths: string[]) {
    try {
      const { error } = await supabase.storage
        .from(BUCKETS.LISTINGS)
        .remove(paths);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error("Delete listing images error:", error);
      return { success: false, error };
    }
  },

  // Get optimized image URL with transformations
  getOptimizedImageUrl(
    originalUrl: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    }
  ) {
    if (!originalUrl || !originalUrl.includes("supabase")) {
      return originalUrl;
    }

    const { width = 800, height, quality = 75 } = options || {};

    // Supabase Storage supports image transformations
    const params = new URLSearchParams();
    if (width) params.append("width", width.toString());
    if (height) params.append("height", height.toString());
    params.append("quality", quality.toString());

    return `${originalUrl}?${params.toString()}`;
  },

  // Pick image from gallery
  async pickImage(options?: ImagePicker.ImagePickerOptions) {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Camera roll permissions are required");
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect || [1, 1],
      quality: options?.quality || 0.8,
      allowsMultipleSelection: options?.allowsMultipleSelection || false,
    });

    if (!result.canceled) {
      return result.assets;
    }

    return null;
  },

  // Take photo with camera
  async takePhoto(options?: ImagePicker.ImagePickerOptions) {
    // Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      throw new Error("Camera permissions are required");
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect || [1, 1],
      quality: options?.quality || 0.8,
    });

    if (!result.canceled) {
      return result.assets[0];
    }

    return null;
  },

  // Helper to extract storage path from public URL
  getStoragePathFromUrl(
    publicUrl: string,
    bucket: keyof typeof BUCKETS
  ): string | null {
    if (!publicUrl) return null;

    const bucketName = BUCKETS[bucket];
    const parts = publicUrl.split(`/${bucketName}/`);

    if (parts.length > 1) {
      return parts[1].split("?")[0]; // Remove query params if any
    }

    return null;
  },
};
