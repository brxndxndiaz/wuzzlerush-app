console.error = () => {
  // Suppress errors in the console for this file
};
console.warn = () => {
  // Suppress warnings in the console for this file
};
// import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGameStore } from "../lib/useGameStore";
import { playSoundEffect } from "@/app/(tabs)";
import { ChevronLeft, Volume, Volume2 } from "lucide-react-native";

interface SettingsScreenProps {
  onNavigate: (screen: "menu" | "lobby" | "settings" | "game") => void;
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);
  const setSoundVolume = useGameStore((s) => s.setSoundVolume);
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const setMusicEnabled = useGameStore((s) => s.setMusicEnabled);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [colorblindSupport, setColorblindSupport] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              onNavigate("menu");
              playSoundEffect("press_2");
            }}
          >
            {/* <Ionicons name="arrow-back" size={24} color="white" /> */}
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Audio Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* <Ionicons name="volume-high" size={20} color="white" /> */}
            <Volume2 size={20} color="white" />
            <Text style={styles.sectionTitle}>Audio</Text>
          </View>

          <View style={styles.settingsList}>
            {/* Sound Effects */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>
                  Game sounds and notifications
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: "#374151", true: "#10b981" }}
                thumbColor={soundEnabled ? "#ffffff" : "#9ca3af"}
              />
            </View>

            {soundEnabled && Platform.OS !== "web" && (
              <View style={styles.volumeContainer}>
                <View style={styles.volumeRow}>
                  {/* <Ionicons
                    name="volume-low"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  /> */}
                  <Volume size={16} color="rgba(255, 255, 255, 0.6)" />
                  <Slider
                    style={styles.slider}
                    value={soundVolume}
                    onValueChange={setSoundVolume}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    minimumTrackTintColor="white"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  />
                  {/* <Ionicons
                    name="volume-high"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  /> */}
                  <Volume2 size={16} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <Text style={styles.volumeText}>
                  {Math.round(soundVolume)}%
                </Text>
              </View>
            )}

            {/* Background Music */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Background Music</Text>
                <Text style={styles.settingDescription}>
                  Lobby and menu music
                </Text>
              </View>
              <Switch
                value={musicEnabled}
                onValueChange={setMusicEnabled}
                trackColor={{ false: "#374151", true: "#10b981" }}
                thumbColor={musicEnabled ? "#ffffff" : "#9ca3af"}
              />
            </View>

            {musicEnabled && Platform.OS !== "web" && (
              <View style={styles.volumeContainer}>
                <View style={styles.volumeRow}>
                  {/* <Ionicons
                    name="volume-low"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  /> */}
                  <Volume size={16} color="rgba(255, 255, 255, 0.6)" />
                  <Slider
                    style={styles.slider}
                    value={musicVolume}
                    onValueChange={setMusicVolume}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    minimumTrackTintColor="white"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  />
                  {/* <Ionicons
                    name="volume-high"
                    size={16}
                    color="rgba(255, 255, 255, 0.6)"
                  /> */}
                  <Volume2 size={16} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <Text style={styles.volumeText}>
                  {Math.round(musicVolume)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Gameplay Settings */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={20} color="white" />
            <Text style={styles.sectionTitle}>Gameplay</Text>
          </View>

          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>
                  Vibrate on key presses
                </Text>
              </View>
              <Switch
                value={vibrateEnabled}
                onValueChange={setVibrateEnabled}
                trackColor={{ false: "#374151", true: "#10b981" }}
                thumbColor={vibrateEnabled ? "#ffffff" : "#9ca3af"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-Submit</Text>
                <Text style={styles.settingDescription}>
                  Submit word when 5 letters entered
                </Text>
              </View>
              <Switch
                value={autoSubmit}
                onValueChange={setAutoSubmit}
                trackColor={{ false: "#374151", true: "#10b981" }}
                thumbColor={autoSubmit ? "#ffffff" : "#9ca3af"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Show Timer</Text>
                <Text style={styles.settingDescription}>
                  Display countdown timer
                </Text>
              </View>
              <Switch
                value={showTimer}
                onValueChange={setShowTimer}
                trackColor={{ false: "#374151", true: "#10b981" }}
                thumbColor={showTimer ? "#ffffff" : "#9ca3af"}
              />
            </View>
          </View>
        </View> */}

        {/* Display Settings */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={20} color="white" />
            <Text style={styles.sectionTitle}>Display</Text>
          </View>

          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Colorblind Support</Text>
                <Text style={styles.settingDescription}>
                  High contrast colors
                </Text>
              </View>
              <Switch
                value={colorblindSupport}
                onValueChange={setColorblindSupport}
                trackColor={{ false: "#374151", true: "#10b981" }}
                thumbColor={colorblindSupport ? "#ffffff" : "#9ca3af"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reduce Motion</Text>
                <Text style={styles.settingDescription}>
                  Minimize animations
                </Text>
              </View>
              <Switch
                value={reduceMotion}
                onValueChange={setReduceMotion}
                trackColor={{ false: "#374151", true: "#10b981" }}
                thumbColor={reduceMotion ? "#ffffff" : "#9ca3af"}
              />
            </View>
          </View>
        </View> */}
      </ScrollView>

      {/* Back Button */}
      <View style={styles.actionButtons}>
        <View>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => onNavigate("menu")}
          >
            <Text style={styles.buttonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  headerSpacer: {
    width: 24,
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 0.5,
    padding: 24,
    marginBottom: 24,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  settingsList: {
    gap: 24,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backdropFilter: "blur(10px)",
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  volumeContainer: {
    paddingLeft: 16,
  },
  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#ffffff",
    width: 20,
    height: 20,
  },
  volumeText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginTop: 4,
  },
  actionButtons: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    height: 48,
    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});
