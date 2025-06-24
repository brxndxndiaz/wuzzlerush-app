"use client";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  show: boolean;
  onHide: () => void;
}
export default function Toast({ message, type, show, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [show, onHide]);

  if (!show) return null;

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return styles.successToast;
      case "error":
        return styles.errorToast;
      default:
        return styles.infoToast;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      default:
        return "flash";
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.toast, getToastStyle()]}>
        <Ionicons name={getIcon()} size={20} color="white" />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    gap: 12,
  },
  successToast: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    borderColor: "#10b981",
    borderWidth: 1,
  },
  errorToast: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    borderColor: "#ef4444",
    borderWidth: 1,
  },
  infoToast: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  message: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
