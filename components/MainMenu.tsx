import { playSoundEffect } from "@/app/(tabs)";
import { InfoIcon, Settings, Trophy, User, Zap } from "lucide-react-native";
import { useEffect } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import appConfig from "../app.json";

interface MainMenuProps {
  onNavigate: (screen: any) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
}

const BouncingText = ({ children, delay = 0, color = "white" }: { 
  children: string; 
  delay?: number; 
  color?: string; 
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const startRandomBounce = () => {
    // Random bounce every 3-8 seconds
    const randomDelay = Math.random() * 5000 + 3000;
    
    setTimeout(() => {
      translateY.value = withSequence(
        withTiming(-15, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 300, easing: Easing.bounce })
      );
      
      scale.value = withSequence(
        withTiming(1.1, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 300, easing: Easing.bounce })
      );
      
      runOnJS(startRandomBounce)();
    }, randomDelay);
  };

  useEffect(() => {
    // Initial bounce animation
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-20, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(0, { duration: 400, easing: Easing.bounce })
      )
    );
    
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 400, easing: Easing.bounce })
      )
    );

    // Start random bouncing after initial animation
    setTimeout(() => {
      runOnJS(startRandomBounce)();
    }, delay + 700);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text style={[{ color, fontSize: 48, fontWeight: "900" }, animatedStyle]}>
      {children}
    </Animated.Text>
  );
};

const BouncingLogo = ({ delay = 0 }: { delay?: number }) => {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Initial bounce with rotation
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-25, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(0, { duration: 500, easing: Easing.bounce })
      )
    );
    
    rotate.value = withDelay(
      delay,
      withSequence(
        withTiming(15, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(-10, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 300, easing: Easing.bounce })
      )
    );
    
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.3, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1, { duration: 500, easing: Easing.bounce })
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Zap size={48} color="#fde047" fill={"#fde047"} />
    </Animated.View>
  );
};

export default function MainMenu({
  onNavigate,
  playerName,
  setPlayerName,
}: MainMenuProps) {
  useEffect(() => {
    if (playerName.toLowerCase() === "chicunguña") {
      if (Platform.OS === "web") {
        window.alert("In this economy?!!\nYou must be joking!");
        setPlayerName("");
        const input = document.querySelector("input");
        if (input) {
          (input as HTMLInputElement).value = "";
        }
      } else {
        Alert.alert("In this economy?!!", "You must be joking!", [
          { text: "OK", onPress: () => setPlayerName("") },
        ]);
      }
    }
  }, [playerName]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title with Bouncing Animation */}
        <View style={styles.titleContainer}>
          <View style={styles.logoContainer}>
            <BouncingLogo delay={0} />
            <View style={styles.titleTextContainer}>
              <BouncingText delay={200} color="#fde047">Wuzzle</BouncingText>
              <BouncingText delay={400} color="white">Rush</BouncingText>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Fast-paced multiplayer word battles
          </Text>
        </View>

        {/* Player Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Enter your name"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            style={styles.textInput}
            maxLength={12}
            onFocus={() => {
              if (playerName.trim().toLowerCase() === "player") {
                setPlayerName("");
              }
            }}
          />
        </View>

        {/* Main Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              onNavigate("joinLobby");
              playSoundEffect("press");
            }}
          >
            <User size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Join Lobby</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              onNavigate("lobby.create");
              playSoundEffect("press_2");
            }}
          >
            <View style={[styles.button, styles.secondaryButton]}>
              <Trophy size={24} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Create Lobby</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            onNavigate("settings");
            playSoundEffect("press_2");
          }}
        >
          <Settings size={20} color="white" />
        </TouchableOpacity>

        {/* Credits Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            onNavigate("credits");
            playSoundEffect("press_2");
          }}
        >
          <InfoIcon size={20} color="white" />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            v{appConfig.expo.version} • Made for voice chat chaos
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  titleTextContainer: {
    flexDirection: "row",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "white",
    opacity: 0.9,
    fontWeight: "500",
  },
  inputContainer: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  textInput: {
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 0.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 32,
  },
  button: {
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  primaryButton: {
    backgroundColor: "#10b981",
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  settingsButton: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 0.5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  footer: {
    position: "absolute",
    bottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: "white",
    opacity: 0.7,
  },
});