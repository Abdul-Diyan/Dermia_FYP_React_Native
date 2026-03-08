import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import BottomTabNavigation from "@/components/bottom-tab-navigation";

export default function ImageCatalogPage() {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const [selectedImage, setSelectedImage] = useState(0);

  // Sample image data with different colors representing different skin conditions
  const images = [
    { id: 1, color: "#E8B4B8" }, // Reddish
    { id: 2, color: "#D4A574" }, // Brownish
    { id: 3, color: "#C9B5B0" }, // Grayish
    { id: 4, color: "#E8B4B8" }, // Reddish
  ];

  const itemsPerRow = 3;
  const itemSize = (width - 60) / itemsPerRow - 10; // Account for padding and margins

  const renderImageItem = ({
    item,
    index,
  }: {
    item: { id: number; color: string };
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
            onPress={() => console.log("Add image")}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Done Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.doneButton,
            isSmallScreen && styles.doneButtonSmall,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => {
            console.log("Image selected:", selectedImage);
            router.back();
          }}
        >
          <Text
            style={[
              styles.doneButtonText,
              isSmallScreen && styles.doneButtonTextSmall,
            ]}
          >
            Done
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
