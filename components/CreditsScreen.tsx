import { playSoundEffect } from "@/app/(tabs)";
import { ArrowLeft } from "lucide-react-native";
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CONTRIBUTORS = [
  {
    name: "Brandon Diaz",
    role: "Lead Developer, Design, Audio, UX",
    link: "https://brndndiaz.dev",
  },
  //   {
  //     name: "InstantDB Team",
  //     role: "Realtime DB Platform",
  //     link: "https://instantdb.com",
  //   },
  //   { name: "Expo", role: "Framework & Libraries", link: "https://expo.dev" },

  { name: "Friends & Playtesters", role: "Feedback & Support" },
  { name: "You", role: "For playing and supporting WuzzleRush!" },

  //   buy me a coffee
  {
    name: "Support WuzzleRush",
    role: "Support the project",
    link: "https://ko-fi.com/brndndiaz",
  },
];

export default function CreditsScreen({
  onNavigate,
}: {
  onNavigate: (screen: any) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              onNavigate("menu");
              playSoundEffect("press_2");
            }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Credits</Text>
          <View style={styles.headerSpacer} />
        </View>
        {/* Main Content */}
        <View style={styles.mainContent}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {CONTRIBUTORS.map((c, i) => (
              <View key={i} style={styles.creditItem}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.role}>{c.role}</Text>
                {c.link && (
                  <Text
                    style={styles.link}
                    onPress={() => Linking.openURL(c.link)}
                  >
                    {c.link.replace(/^https?:\/\//, "")}
                  </Text>
                )}
              </View>
            ))}
            <Text style={styles.footer}>
              WuzzleRush © {new Date().getFullYear()}
            </Text>
          </ScrollView>
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
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  headerSpacer: {
    width: 24,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
  },
  creditItem: {
    marginBottom: 28,
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  role: {
    fontSize: 16,
    color: "#fff",
    marginTop: 2,
    marginBottom: 2,
    opacity: 0.85,
  },
  link: {
    color: "#a5b4fc",
    textDecorationLine: "underline",
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    marginTop: 32,
    color: "#fff",
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});
