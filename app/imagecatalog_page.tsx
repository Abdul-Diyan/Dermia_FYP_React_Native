import BottomTabNavigation from "@/components/bottom-tab-navigation";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

export default function ImageCatalogPage() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const [selectedImage, setSelectedImage] = useState(0);

  const [isUploading, setIsUploading] = useState(false);

  // Changed to state so we can add real images to it!
  const [images, setImages] = useState([
    { id: "1", color: "#E8B4B8", url: null },
    { id: "2", color: "#D4A574", url: null },
  ]);

  const itemsPerRow = 3;
  const itemSize = (width - 60) / itemsPerRow - 10; // Account for padding and margins

  const pickAndUploadImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    setIsUploading(true);
    const imageUri = result.assets[0].uri;

    try {
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: `lesion_${Date.now()}.jpg`,
      } as any);

      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary environment variables are missing.");
      }

      data.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error?.message || "Upload failed");
      }

      const secureImageUrl = responseData.secure_url;
      console.log("Upload Success! Live URL:", secureImageUrl);

      // Add the new image to our grid
      setImages((prevImages) => [
        ...prevImages,
        {
          id: Date.now().toString(),
          color: "transparent",
          url: secureImageUrl,
        },
      ]);
    } catch (error: any) {
      console.error("Cloudinary upload failed:", error);
      Alert.alert("Upload Failed", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const renderImageItem = ({
    item,
    index,
  }: {
    item: { id: string; color: string; url: string | null };
    index: number;
  }) => (
    <Pressable
      style={[
        styles.imageItem,
        {
          width: itemSize,
          height: itemSize,
        },
        selectedImage === index && styles.imageItemSelected,
      ]}
      onPress={() => setSelectedImage(index)}
    >
      {item.url ? (
        <Image
          source={{ uri: item.url }}
          style={[
            styles.imagePlaceholder,
            { width: itemSize - 6, height: itemSize - 6 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.imagePlaceholder,
            {
              width: itemSize - 6,
              height: itemSize - 6,
              backgroundColor: item.color,
            },
          ]}
        />
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text
          style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
        >
          Select Image
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Images Grid */}
        <View style={styles.gridContainer}>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={itemsPerRow}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
          />

          {/* Add Image Button */}
          <Pressable
            style={[
              styles.addButton,
              {
                width: itemSize,
                height: itemSize,
              },
            ]}
            onPress={pickAndUploadImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <Text style={styles.addButtonText}>+</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Done Button */}
      {/* Select Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.doneButton,
            isSmallScreen && styles.doneButtonSmall,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => {
            const selectedUrl = images[selectedImage]?.url;

            // Prevent them from clicking dummy colored boxes
            if (!selectedUrl) {
              Alert.alert(
                "Wait!",
                "Please upload and select a real image first.",
              );
              return;
            }

            console.log("Sending to model:", selectedUrl);

            // Route to the diagnosis page AND pass the image URL with it!
            router.push({
              pathname: "/startdiagnosis_page", // <-- Double check this matches your exact filename!
              params: { imageUrl: selectedUrl },
            });
          }}
        >
          <Text
            style={[
              styles.doneButtonText,
              isSmallScreen && styles.doneButtonTextSmall,
            ]}
          >
            Select & Analyze
          </Text>
        </Pressable>
      </View>

      {/* Bottom Tab Navigation */}
      <BottomTabNavigation isSmallScreen={isSmallScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerSection: {
    backgroundColor: "#3B9FE5",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  headerTextSmall: {
    fontSize: 20,
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 100,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  gridContainer: {
    width: "100%",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  imageItem: {
    borderRadius: 12,
    padding: 3,
    backgroundColor: "transparent",
  },
  imageItemSelected: {
    borderWidth: 4,
    borderColor: "#3B9FE5",
  },
  imagePlaceholder: {
    borderRadius: 10,
    backgroundColor: "#E8B4B8",
  },
  addButton: {
    backgroundColor: "#3B9FE5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  doneButton: {
    backgroundColor: "#3B9FE5",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 80,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 240,
  },
  doneButtonSmall: {
    paddingVertical: 13,
    paddingHorizontal: 60,
    minWidth: 200,
  },
  doneButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  doneButtonTextSmall: {
    fontSize: 17,
  },
});
