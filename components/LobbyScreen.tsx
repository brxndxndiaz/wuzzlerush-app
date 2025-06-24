"use client";

import { playSoundEffect } from "@/app/(tabs)";
import { db } from "@/lib/instant";
import { createLobbyCode } from "@/lib/Lobby/createLobbyCode";
import { getWordSequence } from "@/utils/word-list";
// import { Ionicons } from "@expo/vector-icons";
import { id } from "@instantdb/react-native";
import * as Clipboard from "expo-clipboard";
import {
  ArrowLeft,
  CheckIcon,
  Copy,
  CrownIcon,
  Gamepad2,
  Minus,
  MinusCircle,
  Plus,
  PlusCircle,
  User,
  ZapIcon,
} from "lucide-react-native";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LobbyScreenProps {
  onNavigate: (
    screen: "menu" | "lobby" | "settings" | "game",
    params?: any
  ) => void;
  playerName: string;
  onCreateLobby?: (lobbyid: string) => void;
  isHost?: boolean;
  code?: string | null;
}

export default function LobbyScreen({
  onNavigate,
  playerName,
  onCreateLobby,
  isHost = false,
  code = null,
}: LobbyScreenProps) {
  const [lobbyCode] = useState(() => code || createLobbyCode());
  const [wordlist, setWordlist] = useState<string[]>([]);
  const [isHostState, setIsHostState] = useState(isHost);

  const room = db.room("lobby", lobbyCode);
  const [user, setUser] = useState(() => ({
    name: `${playerName}`,
    id: id(),
    score: 0,
    wordsSolved: 0,
    isHost: isHostState || false, // Set isHost based on prop
    ready: isHostState || false, // Add ready property for presence
  }));

  const {
    user: myPresence,
    peers,
    publishPresence,
  } = db.rooms.usePresence(room, { initialData: { ...user } });

  useEffect(() => {
    publishPresence({ ...user });
  }, [user.name]);

  db.rooms.useTopicEffect(room, "sendBroadcast", (event: any) => {
    if (event.type === "kick" && event.to === user.id) {
      Alert.alert("Kicked", "You have been removed from the lobby.", [
        {
          text: "OK",
          onPress: () => onNavigate("menu"),
        },
      ]);
    }

    if (event.type === "start" && !isHostState) {
      setStartingGame(false);
      onNavigate("game", {
        code: lobbyCode,
        isHost: isHostState,
        data: event.data,
      });
    }

    if (event.type === "setting") {
      setRounds(event.data.rounds);
      setTimeLimit(event.data.timeLimit);
      setDifficulty(event.data.difficulty);
      setMode(event.data.mode);
    }

    if (event.type === "assignHost" && event.to === user.id) {
      const updatedUser = { ...user, isHost: true };
      setUser(updatedUser);
      setIsHostState(true);
      // Publish the updated presence data so other players see the host change
      publishPresence({ ...updatedUser, ready: true } as any);
    }
  });

  // Combine self and peers for player list
  const players = [myPresence, ...Object.values(peers)].filter(Boolean);

  const copyLobbyCode = async () => {
    await Clipboard.setStringAsync(lobbyCode);
    Alert.alert("Copied!", "Lobby code copied to clipboard");
  };

  // Check if all players are ready
  const allReady = players.length > 0 && players.every((p: any) => p.ready);

  // Get the publish function for sendBroadcast
  const publishKick = db.rooms.usePublishTopic(room, "sendBroadcast");
  const publishStart = db.rooms.usePublishTopic(room, "sendBroadcast");

  // Kick player by id (host only)
  const handleKickPlayer = (playerId: string) => {
    if (!isHostState) return;
    Alert.alert("Kick Player", "Are you sure you want to kick this player?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Kick",
        style: "destructive",
        onPress: () => {
          publishKick({
            message: "You have been kicked from the lobby.",
            to: playerId,
            type: "kick",
          });
        },
      },
    ]);
  };

  // Listen for kick broadcast and leave if targeted

  // Check if the current user is ready
  const isSelfReady = user?.ready;

  // Host loading state for starting game
  const [startingGame, setStartingGame] = useState(false);

  // Game settings state (host can edit)
  const [rounds, setRounds] = useState(5);
  const [timeLimit, setTimeLimit] = useState(5); // in minutes
  const [difficulty, setDifficulty] = useState("Normal");
  const [mode, setMode] = useState("Rush");

  function handleSettingChange() {
    if (!isHostState) return;
    const data = {
      rounds,
      timeLimit,
      difficulty,
      mode,
    };
    publishStart({
      type: "setting",
      message: "Game settings updated",
      data,
    });
  }
  useEffect(() => {
    handleSettingChange();
  }, [rounds, timeLimit, difficulty, mode]);

  // Host leave logic: if host leaves, assign next player as host
  function handleLeaveLobby() {
    playSoundEffect("press_2");
    if (isHostState && players.length > 1) {
      // Filter out undefined players and self, then pick the next
      const nextHost = players.filter((p) => p && p.id !== user.id)[0];

      if (nextHost) {
        publishStart({
          type: "assignHost",
          to: nextHost.id,
          message: "You are now the host.",
        });
        // Add a small delay to ensure the message is sent before leaving
        setTimeout(() => {
          onNavigate("menu");
        }, 100);
        return;
      }
    }
    onNavigate("menu");
  }

  // If lobby has no host, make self host (web fix)
  useEffect(() => {
    // Get all players including self
    const allPlayers = [myPresence, ...Object.values(peers)].filter(Boolean);

    // Check if there's already a host
    const existingHost = allPlayers.find((p) => p && p.isHost);

    if (existingHost) {
      //check how many hosts there are
      const hostCount = allPlayers.filter((p) => p && p.isHost).length;

      // If there's already a host and current user thinks they're host but they're not the existing host
      if (isHostState && existingHost.id !== user.id) {
        // Unhost the current user since someone else is already host
        setIsHostState(false);
        const updatedUser = { ...user, isHost: false };
        setUser(updatedUser);
        publishPresence({ ...updatedUser, ready: false } as any);
      }

      if (isHost) {
        // If the user is marked as host but there's already an existing host, update their state
        setIsHostState(true);
        const updatedUser = { ...user, isHost: true };
        setUser(updatedUser);
        publishPresence({ ...updatedUser, ready: true } as any);
      }
    } else {
      // // No host exists, assign first player as host
      // if (allPlayers.length > 0 && !isHostState) {
      //   // Make the first player (by order in the array) the host
      //   const firstPlayer = allPlayers[0];
      //   if (firstPlayer && firstPlayer.id === user.id) {
      //     setIsHostState(true);
      //     const updatedUser = { ...user, isHost: true };
      //     setUser(updatedUser);
      //     publishPresence({ ...updatedUser, ready: true } as any);
      //   }
      // }
    }
  }, [players.length, isHostState, players, myPresence, peers]);

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
              playSoundEffect("press");
            }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Lobby</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Lobby Code */}
        <View style={styles.lobbyCodeContainer}>
          <Text style={styles.lobbyCodeLabel}>Lobby Code</Text>
          <View style={styles.lobbyCodeRow}>
            <Text style={styles.lobbyCodeText}>{lobbyCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => {
                copyLobbyCode();
                // Play sound effect for copy action
                playSoundEffect("click");
              }}
            >
              <Copy size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.lobbyCodeSubtext}>
            Share this code with friends
          </Text>
        </View>

        {/* Players List */}
        <View style={styles.playersContainer}>
          <View style={styles.playersHeader}>
            <View style={styles.playersTitle}>
              <User size={20} color="white" />
              <Text style={styles.playersTitleText}>
                Players ({players.length}/8)
              </Text>
            </View>
          </View>

          <View style={styles.playersList}>
            {players.map((player, index) => {
              if (!player) return null;
              const isSelf = player.id === user.id;
              return (
                <TouchableOpacity
                  key={player.id || index}
                  style={styles.playerItem}
                  onLongPress={() => {
                    if (isHostState && !isSelf) handleKickPlayer(player.id);
                  }}
                  delayLongPress={400}
                  disabled={!isHostState || isSelf}
                >
                  <View style={styles.playerInfo}>
                    {player.isHost && <CrownIcon size={16} color={"white"} />}
                    <Text style={styles.playerName}>
                      {player.name || "Unknown"}
                    </Text>
                    {player.id === user.id && (
                      <Text style={styles.playerName}>(You)</Text>
                    )}
                    {player.isHost && (
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostBadgeText}>Host</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.playerStatus}>
                    <View
                      style={[
                        styles.statusIndicator,
                        (player as any).ready
                          ? styles.readyIndicator
                          : styles.notReadyIndicator,
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {(player as any).ready ? "Ready" : "Not Ready"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Game Settings Preview */}
        <View style={styles.settingsContainer}>
          <View style={styles.settingsHeader}>
            <ZapIcon size={16} color="white" fill={"white"} />
            <Text style={styles.settingsTitle}>Game Settings</Text>
          </View>
          <View style={styles.settingsGrid}>
            {/* Rounds */}
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Rounds:</Text>
              {isHostState ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => setRounds(Math.max(1, rounds - 1))}
                    style={{ padding: 4 }}
                  >
                    {/* <Ionicons name="remove-circle" size={20} color="#fbbf24" /> */}
                    <Minus size={20} color="white" fill={"#fbbf24"} />
                  </TouchableOpacity>
                  <Text style={styles.settingValue}>{rounds}</Text>
                  <TouchableOpacity
                    onPress={() => setRounds(Math.min(20, rounds + 1))}
                    style={{ padding: 4 }}
                  >
                    <Plus size={20} color="white" fill={"#10b981"} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.settingValue}>{rounds}</Text>
              )}
            </View>
            {/* Time Limit */}
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Time Limit:</Text>
              {isHostState ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => setTimeLimit(Math.max(1, timeLimit - 1))}
                    style={{ padding: 4 }}
                  >
                    <Minus size={20} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.settingValue}>{timeLimit}min</Text>
                  <TouchableOpacity
                    onPress={() => setTimeLimit(Math.min(30, timeLimit + 1))}
                    style={{ padding: 4 }}
                  >
                    <Plus size={20} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.settingValue}>{timeLimit}min</Text>
              )}
            </View>
            {/* Difficulty */}
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Difficulty:</Text>
              {isHostState ? (
                <TouchableOpacity
                  onPress={() => {
                    const order = ["Easy", "Normal", "Hard"];
                    let nextIdx =
                      (order.indexOf(difficulty) + 1) % order.length;
                    // Support web: fallback if indexOf fails (e.g. lowercase or typo)
                    if (nextIdx === -1 || !order.includes(difficulty))
                      nextIdx = 0;
                    setDifficulty(order[nextIdx]);
                  }}
                  style={{ padding: 4 }}
                >
                  <Text
                    style={[
                      styles.settingValue,
                      { textDecorationLine: "underline" },
                    ]}
                  >
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.settingValue}>{difficulty}</Text>
              )}
            </View>
            {/* Mode */}
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Mode:</Text>
              {isHostState ? (
                <TouchableOpacity
                  onPress={() => setMode(mode === "Rush" ? "Classic" : "Rush")}
                  style={{ padding: 4 }}
                >
                  <Text
                    style={[
                      styles.settingValue,
                      { textDecorationLine: "underline" },
                    ]}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.settingValue}>{mode}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isHostState ? (
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              (!allReady || startingGame) && { opacity: 0.5 },
            ]}
            onPress={() => {
              if (allReady && !startingGame) {
                setStartingGame(true);
                const wordSequence = getWordSequence(rounds * 10, difficulty); // Example: 10 words per round
                const startTime = DateTime.utc().toISO(); // Luxon UTC timestamp

                const data = {
                  wordSequence: JSON.stringify(wordSequence),
                  startTime, // Pass startTime
                  rounds,
                  timeLimit,
                  difficulty,
                  mode,
                };

                publishStart({
                  type: "start",
                  message: "Game is starting!",
                  data,
                });
                // Host immediately joins the game
                onNavigate("game", {
                  code: lobbyCode,
                  isHost: true,
                  data,
                });
              }
            }}
            disabled={!allReady || startingGame}
          >
            <Gamepad2 size={24} color="white" />
            <Text style={styles.buttonText}>
              {startingGame ? "Starting..." : "Start Game"}
            </Text>
          </TouchableOpacity>
        ) : isSelfReady ? (
          <View style={[styles.button, styles.waitingButton]}>
            <Text style={styles.buttonText}>Waiting for host...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={() => {
              playSoundEffect("press");
              publishPresence({ ...myPresence, ready: true } as any);
              user.ready = true; // Update local state
            }}
          >
            <CheckIcon size={24} color="white" />
            <Text style={styles.buttonText}>Ready Up</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.leaveButton]}
          onPress={handleLeaveLobby}
        >
          <Text style={styles.buttonText}>Leave Lobby</Text>
        </TouchableOpacity>
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
  lobbyCodeContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 0.5,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  lobbyCodeLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  lobbyCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lobbyCodeText: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    letterSpacing: 4,
  },
  copyButton: {
    padding: 8,
  },
  lobbyCodeSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 8,
  },
  playersContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 0.5,
    padding: 24,
    marginBottom: 24,
  },
  playersHeader: {
    marginBottom: 16,
  },
  playersTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playersTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  playersList: {
    gap: 12,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 0.5,
    padding: 12,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  hostBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderColor: "rgba(251, 191, 36, 0.5)",
    borderWidth: 0.5,
  },
  hostBadgeText: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
  },
  playerStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  readyIndicator: {
    backgroundColor: "#10b981",
  },
  notReadyIndicator: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  settingsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 24,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  settingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  settingItem: {
    flex: 1,
    minWidth: "45%",
  },
  settingLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  settingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  actionButtons: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  startButton: {
    backgroundColor: "#10b981",
  },
  waitingButton: {
    backgroundColor: "rgba(59, 130, 246, 0.6)",
  },
  leaveButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
});
