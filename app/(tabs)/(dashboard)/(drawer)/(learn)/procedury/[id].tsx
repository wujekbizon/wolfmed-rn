import React, { useLayoutEffect } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import ProcedureContent from "@/components/ProcedureContent";
import proceduresData from "@/data/procedures.json";
import { Procedure } from "@/types/dataTypes";
import CustomHeader from "@/components/ui/CustomHeader";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  interpolate,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const IMG_HEIGHT = 400;

export default function ProcedureDetailsScreen() {
  const { id, image } = useLocalSearchParams<{ id: string; image: any }>();
  const navigation = useNavigation();
  const procedure: Procedure = proceduresData[Number(id)];
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  useLayoutEffect(() => {
    if (procedure?.data?.name) {
      navigation.setOptions({
        headerTitle: "",
        headerTransparent: true,
        headerBackground: () => (
          <Animated.View style={[headerAnimatedStyle, styles.header]} />
        ),
        header: () => (
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={"#000"} />
          </TouchableOpacity>
        ),
      });
    }
  }, [procedure]);

  const scrollOffset = useScrollViewOffset(scrollRef);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollOffset.value, [0, IMG_HEIGHT / 2], [0, 1]),
    };
  }, []);

  return (
    <>
      <StatusBar backgroundColor="rgba(255,255,255,0)" />
 
        <View className="flex-1 bg-white">
          <Animated.ScrollView
            contentContainerStyle={{ paddingBottom: 10 }}
            ref={scrollRef}
            scrollEventThrottle={16}
          >
            {image && (
              <Animated.Image
                source={image}
                style={[styles.image, imageAnimatedStyle]}
                resizeMode="cover"
              />
            )}
            <View style={styles.infoContainer}>
              <ProcedureContent procedure={procedure} />
            </View>
          </Animated.ScrollView>
        </View>

    </>
  );
}

const styles = StyleSheet.create({
  image: {
    height: IMG_HEIGHT,
    width: width,
  },
  infoContainer: {
    padding: 24,
    backgroundColor: "#fff",
  },
  roundButton: {
    width: 100,
    height: 140,
    borderRadius: 50,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: "#fff",
    height: 100,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
});
