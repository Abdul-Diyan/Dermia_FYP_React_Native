import BottomTabNavigation from "@/components/bottom-tab-navigation";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../config/firebaseConfig";

export default function ImageCatalogPage() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const isSmallScreen = width < 400;

  // Catch the mode ("manage", "select", or "upload")
  const { mode } = useLocalSearchParams<{ mode: string }>();

  const [images, setImages] = useState<any[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerRow = 3;
  const itemSize = (width - 60) / itemsPerRow - 10;

  // Dynamic status bar colors
  const topBarColor = isDarkMode ? "#000000" : "#FFFFFF";
  const topBarTextStyle = isDarkMode ? "light-content" : "dark-content";

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const imagesRef = collection(db, "users", user.uid, "images");
        const q = query(imagesRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const fetchedImages: any[] = [];
        snapshot.forEach((doc) => {
          fetchedImages.push({ id: doc.id, ...doc.data() });
        });

        setImages(fetchedImages);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();

    // Auto-open gallery if they clicked "Upload New Photo" on dashboard
    if (mode === "upload") {
      pickAndUploadImage();
    }
  }, [mode]);

  const pickAndUploadImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) return;

    setIsUploading(true);
    const imageUri = result.assets[0].uri;

    try {
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: `lesion_${Date.now()}.jpg`,
      } as any);
      data.append(
        "upload_preset",
        process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
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
      if (!response.ok)
        throw new Error(responseData.error?.message || "Upload failed");

      const secureImageUrl = responseData.secure_url;

      // Save to Firestore
      const user = auth.currentUser;
      let newDocId = Date.now().toString();

      if (user) {
        const imagesRef = collection(db, "users", user.uid, "images");
        const docRef = await addDoc(imagesRef, {
          url: secureImageUrl,
          createdAt: serverTimestamp(),
        });
        newDocId = docRef.id;
      }

      setImages((prev) => [{ id: newDocId, url: secureImageUrl }, ...prev]);

      // If uploading for a new diagnosis, jump straight to the diagnosis page
      if (mode === "upload") {
        router.push({
          pathname: "/startdiagnosis_page",
          params: { imageUrl: secureImageUrl },
        });
      } else {
        Alert.alert("Success", "Image saved to your catalog!");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagePress = (item: any) => {
    if (mode === "manage") {
      Alert.alert(
        "Image Options",
        "What would you like to do with this image?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteImage(item.id),
          },
          {
            text: "Diagnose",
            onPress: () =>
              router.push({
                pathname: "/startdiagnosis_page",
                params: { imageUrl: item.url },
              }),
          },
        ],
      );
    } else {
      setSelectedImageId(item.id);
    }
  };

  const deleteImage = async (docId: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteDoc(doc(db, "users", user.uid, "images", docId));
        setImages((prev) => prev.filter((img) => img.id !== docId));
        Alert.alert("Deleted", "Image removed from your catalog.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error", "Could not delete image.");
    }
  };

  const renderImageItem = ({ item }: { item: any }) => (
    <Pressable
      style={[
        styles.imageItem,
        { width: itemSize, height: itemSize },
        selectedImageId === item.id &&
          mode !== "manage" &&
          styles.imageItemSelected,
      ]}
      onPress={() => handleImagePress(item)}
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
              backgroundColor: item.color || "#E8B4B8",
            },
          ]}
        />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: topBarColor }]}>
      <StatusBar
        translucent={false}
        backgroundColor={topBarColor}
        barStyle={topBarTextStyle}
      />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text
            style={[styles.headerText, isSmallScreen && styles.headerTextSmall]}
          >
            {mode === "manage" ? "Image Catalog" : "Select Image"}
          </Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#3B9FE5"
                style={{ marginTop: 50 }}
              />
            ) : (
              <>
                <FlatList
                  data={images}
                  renderItem={renderImageItem}
                  keyExtractor={(item) => item.id}
                  numColumns={itemsPerRow}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.columnWrapper}
                />
                <Pressable
                  style={[
                    styles.addButton,
                    { width: itemSize, height: itemSize },
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
              </>
            )}
          </View>
        </ScrollView>

        {/* Select Button (Hidden in Manage mode) */}
        {mode !== "manage" && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.doneButton,
                isSmallScreen && styles.doneButtonSmall,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => {
                const selectedObj = images.find(
                  (img) => img.id === selectedImageId,
                );
                if (!selectedObj) {
                  Alert.alert("Wait!", "Please select an image first.");
                  return;
                }
                router.push({
                  pathname: "/startdiagnosis_page",
                  params: { imageUrl: selectedObj.url },
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
        )}

        {/* Bottom Tab Navigation */}
        <BottomTabNavigation isSmallScreen={isSmallScreen} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerSection: {
    backgroundColor: "#0a73ff",
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
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 15,
    marginBottom: 16,
  },
  imageItem: {
    borderRadius: 12,
    padding: 3,
    backgroundColor: "transparent",
  },
  imageItemSelected: {
    borderWidth: 4,
    borderColor: "#0a73ff",
  },
  imagePlaceholder: {
    borderRadius: 10,
    backgroundColor: "#E8B4B8",
  },
  addButton: {
    backgroundColor: "#0a73ff",
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
    backgroundColor: "#0a73ff",
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
