"use client";

import { db } from "@/lib/instant";
// import { Ionicons } from "@expo/vector-icons";
import { playSoundEffect } from "@/app/(tabs)";
import { id as generateId } from "@instantdb/react-native";
import {
  BarChartBigIcon,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Delete,
  Eye,
  TimerIcon,
  Trophy,
  X,
  Zap,
} from "lucide-react-native";
import { DateTime } from "luxon";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { isValidWord } from "../utils/word-list";
import Toast from "./Toast";

interface GameScreenProps {
  onNavigate: (
    screen: "menu" | "lobby" | "settings" | "game",
    params?: any
  ) => void;
  code?: string | null;
  playerName: string;
  isHost?: boolean;
  userId?: string;
  data: any;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

interface Player {
  id: string;
  name: string;
  score: number;
  wordsSolved: number;
  strikes: number;
  isSelf: boolean;
  isHost?: boolean;
  currentWordIndex?: number;
}

const { width } = Dimensions.get("window");
const GRID_SIZE = Math.min((width - 48) / 5, 50);

// Collapsible Leaderboard Component
function CollapsibleLeaderboard({ players }: { players: Player[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentPlayer = sortedPlayers.find((p) => p.isSelf);
  const currentPlayerRank = sortedPlayers.findIndex((p) => p.isSelf) + 1;

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.minimizedLeaderboard}
        onPress={() => setIsExpanded(true)}
      >
        <View style={styles.minimizedContent}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{currentPlayerRank}</Text>
          </View>
          <Text style={styles.minimizedScore}>
            {currentPlayer?.score.toLocaleString() || 0}
          </Text>
          {/* <Ionicons
            name="chevron-down"
            size={16}
            color="rgba(255,255,255,0.7)"
          /> */}
          <ChevronDown size={16} color="rgba(255,255,255,0.7)" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.expandedLeaderboard}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        <TouchableOpacity onPress={() => setIsExpanded(false)}>
          {/* <Ionicons name="chevron-up" size={20} color="white" /> */}
          <ChevronUp size={20} color="white" />
        </TouchableOpacity>
      </View>

      {sortedPlayers.slice(0, 5).map((player, idx) => (
        <View
          key={player.id}
          style={[
            styles.playerRow,
            player.isSelf && styles.currentPlayerRow,
            idx === 0 && styles.firstPlace,
          ]}
        >
          <View style={styles.playerRank}>
            <Text
              style={[styles.rankNumber, idx === 0 && styles.firstPlaceText]}
            >
              #{idx + 1}
            </Text>
          </View>

          <Text
            style={[
              styles.playerName,
              player.isSelf && styles.currentPlayerName,
            ]}
          >
            {player.name}
            {player.isSelf ? " (You)" : ""}{" "}
            {player.isHost ? (
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>Host</Text>
              </View>
            ) : (
              ""
            )}
          </Text>

          <View style={styles.playerStats}>
            <Text style={styles.playerScore}>
              {player.score.toLocaleString()}
            </Text>
            <Text style={styles.playerWords}>{player.wordsSolved}w</Text>
          </View>
        </View>
      ))}

      {sortedPlayers.length > 5 && (
        <Text style={styles.morePlayersText}>
          +{sortedPlayers.length - 5} more players
        </Text>
      )}
    </View>
  );
}

// Modal Leaderboard Component
function ModalLeaderboard({
  players,
  visible,
  onClose,
}: {
  players: Player[];
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Full Leaderboard</Text>
          <TouchableOpacity onPress={onClose}>
            {/* <Ionicons name="close" size={24} color="white" /> */}
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScrollView}>
          {sortedPlayers.map((player, idx) => (
            <View
              key={player.id}
              style={[
                styles.modalPlayerRow,
                player.isSelf && styles.modalCurrentPlayer,
              ]}
            >
              <View
                style={[
                  styles.modalRankBadge,
                  idx === 0 && styles.goldBadge,
                  idx === 1 && styles.silverBadge,
                  idx === 2 && styles.bronzeBadge,
                ]}
              >
                <Text style={styles.modalRankText}>#{idx + 1}</Text>
              </View>

              <View style={styles.modalPlayerInfo}>
                <Text style={styles.modalPlayerName}>
                  {player.name}
                  {player.isSelf ? " (You)" : ""}{" "}
                  {player.isHost ? (
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>Host</Text>
                    </View>
                  ) : (
                    ""
                  )}
                </Text>
                <View style={styles.modalPlayerStats}>
                  <Text style={styles.modalStatText}>
                    Score: {player.score.toLocaleString()}
                  </Text>
                  <Text style={styles.modalStatText}>
                    Words: {player.wordsSolved}
                  </Text>
                  <Text style={styles.modalStatText}>
                    Strikes: {player.strikes}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
}

// Powerup Modal Component
function PowerupModal({
  visible,
  powerups,
  onUse,
  onClose,
}: {
  visible: boolean;
  powerups: Powerup[];
  onUse: (index: number) => void;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={styles.modalOverlay}
      onPress={onClose}
      activeOpacity={1}
    >
      <View style={[styles.modalContent, { maxWidth: 340 }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Powerups</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
        {powerups.length === 0 && (
          <Text
            style={{ color: "white", textAlign: "center", marginVertical: 24 }}
          >
            No powerups available.
          </Text>
        )}
        <ScrollView style={{ maxHeight: 300 }}>
          {powerups.map((p, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                gap: 12,
              }}
            >
              <View>{p.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontWeight: "700" }}>
                  {p.title}
                </Text>
                <Text style={{ color: "#ccc", fontSize: 12 }}>
                  {p.description}
                </Text>
                <Text style={{ color: "#fbbf24", fontSize: 12 }}>
                  Uses left: {p.uses}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: p.uses > 0 ? "#10b981" : "#6b7280",
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  opacity: p.uses > 0 ? 1 : 0.5,
                }}
                disabled={p.uses === 0}
                onPress={() => onUse(i)}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>Use</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
}

// BouncingLetter component for animated letter appearance
function BouncingLetter({ letter, style }: { letter: string; style?: any }) {
  const scale = useSharedValue(0.5);

  React.useEffect(() => {
    if (letter) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 120 }),
        withTiming(1, { duration: 120 })
      );
    }
  }, [letter]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Text style={styles.letterText}>{letter}</Text>
    </Animated.View>
  );
}
// BouncingLetterBox component for animated box and letter appearance
function BouncingLetterBox({ letter, style }: { letter: string; style?: any }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (letter) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 120 }),
        withTiming(1, { duration: 120 })
      );
    }
  }, [letter]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Text style={styles.letterText}>{letter}</Text>
    </Animated.View>
  );
}

// BouncingKey component for animated keyboard key press
function BouncingKey({
  letter,
  onPress,
  style,
  children,
  disabled,
  bounce,
}: {
  letter: string;
  onPress: () => void;
  style?: any;
  children?: React.ReactNode;
  disabled?: boolean;
  bounce?: boolean;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    onPress();
  };

  React.useEffect(() => {
    if (bounce) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  }, [bounce]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
interface Powerup {
  title: string;
  description: string;
  icon: React.ReactNode;
  onUse: () => void;
  uses: number;
}

export default function GameScreen({
  onNavigate,
  code,
  playerName,
  isHost = false,
  userId,
  data,
}: GameScreenProps) {
  // Use the lobby code to join the correct room
  const roomCode = code || "GAME";
  const room = db.room("lobby", roomCode);
  const [user] = useState(() => ({
    name: playerName,
    id: userId || generateId(),
    isHost,
    ready: true,
    score: 0,
    wordsSolved: 0,
  }));
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [wordsFailed, setWordsFailed] = useState(0);
  const [gamePhase, setGamePhase] = useState<"playing" | "gameEnd">("playing");
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "info",
  });
  const [strikes, setStrikes] = useState(0);
  const [isSpectator, setIsSpectator] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [powerupModalVisible, setPowerupModalVisible] = useState(false);
  const [bouncingKey, setBouncingKey] = useState<string | null>(null);
  const maxStrikes = 3;
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info") => {
      setToast({ show: true, message, type });
      playSoundEffect(type);
    },
    []
  );
  // Use shared word sequence if provided, otherwise generate fallback
  const [wordSequence] = useState(() => JSON.parse(data.wordSequence) || []);
  // Track revealed letter indices for overlay (allow stacking)
  const [revealedLetterIndices, setRevealedLetterIndices] = useState<number[]>(
    []
  );
  const handleRevealLetter = useCallback(() => {
    const currentWord = wordSequence[currentWordIndex];
    if (currentWord) {
      // Get the current revealed indices (this will always be up-to-date)
      const currentRevealed = revealedLetterIndices;

      // Find all unrevealed indices
      const unrevealed = currentWord
        .split("")
        .map((_: string, i: number) => i)
        .filter((i: number) => !currentRevealed.includes(i));

      if (unrevealed.length === 0) {
        showToast("All letters have already been revealed!", "info");
        return;
      }

      // Pick a random unrevealed letter (guaranteed unique)
      const randomIndex =
        unrevealed[Math.floor(Math.random() * unrevealed.length)];

      // Update revealed indices with the new letter
      setRevealedLetterIndices((prev) => {
        const newRevealed = [...prev, randomIndex];

        // Show the updated word with the newly revealed letter
        const revealedWord = currentWord
          .split("")
          .map((l: string, i: number) => (newRevealed.includes(i) ? l : "_"))
          .join(" ");

        showToast(`Revealed letter: ${revealedWord}`, "info");
        return newRevealed;
      });
    }
  }, [currentWordIndex, wordSequence, revealedLetterIndices, showToast]);

  // Track revealed letter index for overlay
  const [revealedLetterIndex, setRevealedLetterIndex] = useState<number | null>(
    null
  );

  const [powerups, setPowerups] = useState<Powerup[]>([
    {
      title: "Reveal letter",
      description: "Reveal a random correct letter in the current word.",
      icon: <Zap size={24} color="#fbbf24" />,
      onUse: () => {
        handleRevealLetter();
      }, // This will be handled by handleUsePowerup
      uses: 10,
    },
  ]);

  // Set up presence for the game
  const {
    user: myPresence,
    peers,
    publishPresence,
  } = db.rooms.usePresence(room, { initialData: { ...user } });

  db.rooms.useTopicEffect(room, "sendBroadcast", (event: any) => {
    if (event.type === "wordSolved") {
      showToast(`${event.message}`, "info");
      playSoundEffect("info");
    }
  });

  // Use shared startTime from data, fallback to now if missing
  const startTime = data.startTime
    ? DateTime.fromISO(data.startTime).toUTC()
    : DateTime.utc();
  const totalGameTime = data.timeLimit * 60; // seconds

  const [timeLeft, setTimeLeft] = useState(() => {
    const now = DateTime.utc();
    const diff = Math.max(
      0,
      totalGameTime - Math.floor(now.diff(startTime, "seconds").seconds)
    );
    return diff;
  });

  // Become spectator if all words are completed before timer ends
  useEffect(() => {
    if (
      !isSpectator &&
      gamePhase === "playing" &&
      currentWordIndex >= wordSequence.length &&
      wordSequence.length > 0
    ) {
      setIsSpectator(true);
      showToast("You've completed all words! Waiting for others...", "info");
    }
  }, [
    currentWordIndex,
    isSpectator,
    gamePhase,
    wordSequence.length,
    showToast,
  ]);

  const currentWord = wordSequence[currentWordIndex];
  const maxGuesses = 6;

  const hideToast = useCallback(() => {
    setToast({ show: false, message: "", type: "info" });
  }, []);

  // Only reset revealedLetterIndices when moving to a new word
  const moveToNextWord = useCallback(() => {
    const nextIndex = currentWordIndex + 1;
    setCurrentWordIndex(nextIndex);
    setGuesses([]);
    setCurrentGuess("");
    setRevealedLetterIndices([]); // <-- reset only here
    // If player finished all words before timer ends, make them a spectator
    if (
      nextIndex >= wordSequence.length &&
      gamePhase === "playing" &&
      !isSpectator
    ) {
      setIsSpectator(true);
      showToast("You finished! Waiting for others...", "info");
    }
  }, [
    currentWordIndex,
    gamePhase,
    isSpectator,
    wordSequence.length,
    showToast,
  ]);

  const publishBroadcast = db.rooms.usePublishTopic(room, "sendBroadcast");
  const handleWordSolved = useCallback(() => {
    const newWordsCompleted = wordsCompleted + 1;
    setWordsCompleted(newWordsCompleted);

    const guessBonus = (maxGuesses - guesses.length) * 50;
    const baseScore = 200;
    const newScore = score + baseScore + guessBonus;
    setScore(newScore);

    showToast(`Word solved! +${baseScore + guessBonus} points`, "success");
    publishBroadcast({
      message: `${user.name} solve a word!`,
      type: "wordSolved",
      data: {},
    });

    moveToNextWord();
  }, [
    wordsCompleted,
    maxGuesses,
    guesses.length,
    score,
    showToast,
    publishBroadcast,
    user.name,
    moveToNextWord,
  ]);

  const handleWordFailed = useCallback(() => {
    const newWordsFailed = wordsFailed + 1;
    const newStrikes = strikes + 1;
    setWordsFailed(newWordsFailed);
    setStrikes(newStrikes);

    if (newStrikes >= maxStrikes) {
      setIsSpectator(true);
      showToast("3 strikes! You're now spectating.", "error");
    } else {
      showToast(
        `Strike ${newStrikes}/3! Here's a new word! The last word was "${currentWord}".`,
        "error"
      );
    }

    moveToNextWord();
  }, [
    wordsFailed,
    strikes,
    maxStrikes,
    currentWord,
    showToast,
    moveToNextWord,
  ]);

  const handleKeyPress = useCallback(
    (letter: string) => {
      if (gamePhase !== "playing" || isSpectator || currentGuess.length >= 5)
        return;

      const newGuess = currentGuess + letter;
      setCurrentGuess(newGuess);

      if (newGuess.length === 5) {
        setTimeout(() => {
          if (!isValidWord(newGuess)) {
            showToast("Not a valid word! Try again.", "error");
            setCurrentGuess("");
            return;
          }

          const newGuesses = [...guesses, newGuess];
          setGuesses(newGuesses);
          setCurrentGuess("");

          if (newGuess === currentWord) {
            handleWordSolved();
          } else if (newGuesses.length >= maxGuesses) {
            handleWordFailed();
          }
        }, 100);
      } else {
        playSoundEffect("click");
      }
    },
    [
      currentGuess,
      gamePhase,
      guesses,
      currentWord,
      showToast,
      playSoundEffect,
      handleWordSolved,
      handleWordFailed,
      isSpectator,
    ]
  );

  const handleBackspace = useCallback(() => {
    if (gamePhase === "playing" && !isSpectator) {
      playSoundEffect("press_2");
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  }, [currentGuess, gamePhase, isSpectator, playSoundEffect]);

  // Improved getLetterColor to handle duplicate letters correctly
  const getLetterColor = (letter: string, position: number, guess: string) => {
    // Step 1: Mark all correct (green) letters
    const answer = currentWord.split("");
    const guessArr = guess.split("");
    const answerUsed = Array(answer.length).fill(false);
    const guessColors = Array(guessArr.length).fill("unused");

    // First pass: mark correct (green)
    for (let i = 0; i < guessArr.length; i++) {
      if (guessArr[i] === answer[i]) {
        guessColors[i] = "correct";
        answerUsed[i] = true;
      }
    }
    // Second pass: mark wrong position (orange)
    for (let i = 0; i < guessArr.length; i++) {
      if (guessColors[i] === "unused") {
        for (let j = 0; j < answer.length; j++) {
          if (!answerUsed[j] && guessArr[i] === answer[j]) {
            guessColors[i] = "wrongPosition";
            answerUsed[j] = true;
            break;
          }
        }
      }
    }
    // All others are wrong (gray)
    for (let i = 0; i < guessArr.length; i++) {
      if (guessColors[i] === "unused") {
        guessColors[i] = "wrong";
      }
    }
    // Return the color for this letter/position
    if (guessColors[position] === "correct") {
      return styles.correctLetter;
    } else if (guessColors[position] === "wrongPosition") {
      return styles.wrongPositionLetter;
    } else {
      return styles.wrongLetter;
    }
  };

  const getKeyboardLetterStatus = (letter: string) => {
    let status = "unused";

    guesses.forEach((guess) => {
      guess.split("").forEach((guessLetter, index) => {
        if (guessLetter === letter) {
          if (currentWord[index] === letter) {
            status = "correct";
          } else if (currentWord.includes(letter) && status !== "correct") {
            status = "wrongPosition";
          } else if (status === "unused") {
            status = "wrong";
          }
        }
      });
    });

    return status;
  };

  const getKeyboardButtonStyle = (letter: string) => {
    const status = getKeyboardLetterStatus(letter);

    switch (status) {
      case "correct":
        return [styles.keyboardButton, styles.correctKey];
      case "wrongPosition":
        return [styles.keyboardButton, styles.wrongPositionKey];
      case "wrong":
        return [styles.keyboardButton, styles.wrongKey];
      default:
        return [styles.keyboardButton, styles.unusedKey];
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  // Update presence when score, wordsCompleted, strikes, or finished state changes
  useEffect(() => {
    // Player is finished if they completed all words or became a spectator
    const isFinished =
      (currentWordIndex >= wordSequence.length && wordSequence.length > 0) ||
      (isSpectator &&
        (strikes >= maxStrikes || currentWordIndex >= wordSequence.length));
    publishPresence({
      ...user,
      score,
      wordsSolved: wordsCompleted,
      strikes,
      isSpectator,
      isFinished,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    score,
    wordsCompleted,
    strikes,
    isSpectator,
    currentWordIndex,
    wordSequence.length,
    publishPresence,
    user,
  ]);

  // End game early if all players are finished (isFinished or isSpectator)
  useEffect(() => {
    if (gamePhase !== "playing") return;
    const allPlayers = [
      { ...myPresence, isSelf: true },
      ...Object.values(peers).map((p) => ({ ...p, isSelf: false })),
    ];
    if (
      allPlayers.length > 0 &&
      allPlayers.every((p) => p.isFinished || p.isSpectator)
    ) {
      setGamePhase("gameEnd");
      showToast("Game ended early! All players finished.", "info");
    }
  }, [myPresence, peers, gamePhase, showToast]);

  // Combine self and peers for scoreboard - convert to Player interface
  const players: Player[] = [
    {
      ...myPresence,
      isSelf: true,
      id: myPresence?.id || user.id,
      name: myPresence?.name || user.name,
      score: myPresence?.score || score,
      wordsSolved: myPresence?.wordsSolved || wordsCompleted,
      strikes: myPresence?.strikes || strikes,
    },
    ...Object.values(peers).map((p) => ({
      ...p,
      isSelf: false,
      id: p?.id || "",
      name: p?.name || "",
      score: p?.score || 0,
      wordsSolved: p?.wordsSolved || 0,
      strikes: p?.strikes || 0,
    })),
  ].filter((p) => p && p.name);

  // Timer: run independently of re-renders
  useEffect(() => {
    if (gamePhase !== "playing") return;
    let animationFrame: number;
    let lastSecond = -1;
    const tick = () => {
      const now = DateTime.utc();
      const diff = Math.max(
        0,
        totalGameTime - Math.floor(now.diff(startTime, "seconds").seconds)
      );
      setTimeLeft(diff);

      if (diff === 0) {
        setGamePhase("gameEnd");
        showToast(`Game Over! You solved ${wordsCompleted} words!`, "info");
        return;
      }
      animationFrame = requestAnimationFrame(tick);
    };
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [gamePhase, startTime, totalGameTime, wordsCompleted, showToast]);

  useEffect(() => {
    if (timeLeft <= 30 && timeLeft > 0) {
      playSoundEffect("heartbeat");
    }
    if (timeLeft <= 10 && timeLeft > 0) {
      playSoundEffect("sonar");
    }
  }, [timeLeft, playSoundEffect]);

  // Native keyboard support for web
  useEffect(() => {
    if (Platform.OS !== "web") return;
    function onKeyDown(e: KeyboardEvent) {
      if (
        document.activeElement &&
        ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      )
        return;
      if (gamePhase !== "playing" || isSpectator) return;
      if (e.key === "Backspace") {
        setBouncingKey("BACKSPACE");
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        setBouncingKey(e.key.toUpperCase());
        handleKeyPress(e.key.toUpperCase());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gamePhase, isSpectator, handleKeyPress, handleBackspace, bouncingKey]);

  // Reset bouncingKey after animation
  useEffect(() => {
    if (bouncingKey) {
      const timeout = setTimeout(() => setBouncingKey(null), 200);
      return () => clearTimeout(timeout);
    }
  }, [bouncingKey]);

  // Calculate correct letters by position
  const correctLettersByPosition = Array(5).fill(null);
  guesses.forEach((guess) => {
    guess.split("").forEach((letter, idx) => {
      if (currentWord[idx] === letter) {
        correctLettersByPosition[idx] = letter;
      }
    });
  });

  if (gamePhase === "gameEnd") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameEndContainer}>
          <View style={styles.gameEndContent}>
            <View style={styles.trophyContainer}>
              {/* <Ionicons name="trophy" size={48} color="#fbbf24" /> */}
              <Trophy size={48} color="#fbbf24" fill={"#fbbf24"} />
            </View>
            <Text style={styles.gameEndTitle}>Time's Up!</Text>
            <Text style={styles.gameEndSubtitle}>Final Results</Text>

            <View style={styles.resultsContainer}>
              <View className="flex-row justify-between items-center mb-4">
                <Text style={styles.resultLabel}>Words Solved:</Text>
                <Text style={[styles.resultValue, { color: "white" }]}>
                  {wordsCompleted}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <Text style={styles.resultLabel}>Words Missed:</Text>
                <Text style={[styles.resultValue, { color: "white" }]}>
                  {wordsFailed}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <Text style={styles.resultLabel}>Final Score:</Text>
                <Text style={[styles.resultValue, { color: "white" }]}>
                  {score.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <Text style={styles.resultLabel}>Words/Min:</Text>
                <Text style={[styles.resultValue, { color: "white" }]}>
                  {Math.round((wordsCompleted / 5) * 10) / 10}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <Text style={styles.resultLabel}>Your Last Word:</Text>
                <Text style={[styles.resultValue, { color: "#fbbf24" }]}>
                  {wordSequence[currentWordIndex ?? 0] || "-"}
                </Text>
              </View>
            </View>

            {/* Final Leaderboard */}
            <View style={styles.finalLeaderboard}>
              <Text style={styles.finalLeaderboardTitle}>Final Standings</Text>
              {players
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((player, idx) => (
                  <View
                    key={player.id}
                    style={[
                      styles.finalPlayerRow,
                      player.isSelf && styles.finalCurrentPlayer,
                    ]}
                  >
                    <View
                      style={[
                        styles.finalRankBadge,
                        idx === 0 && styles.goldBadge,
                        idx === 1 && styles.silverBadge,
                        idx === 2 && styles.bronzeBadge,
                      ]}
                    >
                      <Text style={styles.finalRankText}>#{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.finalPlayerName}>
                        {player.name}
                        {player.isSelf ? " (You)" : ""}{" "}
                        {player.isHost ? (
                          <View style={styles.hostBadge}>
                            <Text style={styles.hostBadgeText}>Host</Text>
                          </View>
                        ) : (
                          ""
                        )}
                      </Text>
                      <Text style={{ color: "#fbbf24", fontSize: 12 }}>
                        Last Solved Word:{" "}
                        {wordSequence[player.wordsSolved] || "-"}
                      </Text>
                    </View>
                    <Text style={styles.finalPlayerScore}>
                      {player.score.toLocaleString()}
                    </Text>
                  </View>
                ))}
            </View>

            <View style={styles.gameEndButtons}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => {
                  onNavigate("lobby", { code: roomCode, isHost });
                }}
              >
                <Text style={styles.buttonText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => onNavigate("menu")}
              >
                <Text style={styles.buttonText}>Main Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Handler for using a powerup from the modal
  const handleUsePowerup = (index: number) => {
    const p = powerups[index];
    if (p && p.uses > 0) {
      // Handle reveal letter powerup specifically

      const result = p.onUse();

      setPowerups((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, uses: item.uses - 1 } : item
        )
      );
      setPowerupModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Toast {...toast} onHide={hideToast} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("lobby", { code: roomCode, isHost })}
        >
          {/* <Ionicons name="arrow-back" size={24} color="white" /> */}
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Word {currentWordIndex + 1}</Text>
          </View>
          <View
            style={[
              styles.timerContainer,
              timeLeft <= 30 && styles.timerWarning,
            ]}
          >
            {/* <Ionicons name="time" size={16} color="white" /> */}
            <TimerIcon size={16} color="white" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {/* <Ionicons name="podium" size={24} color="white" /> */}
          <BarChartBigIcon size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Collapsible Leaderboard */}
      <CollapsibleLeaderboard players={players} />

      {/* Player Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <View style={styles.scoreContainer}>
            {/* <Ionicons name="trophy" size={20} color="#fbbf24" /> */}
            <Trophy size={20} color="#fbbf24" fill={"#fbbf24"} />
            <Text style={styles.scoreText}>
              Score: {score.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {/* <Ionicons name="checkmark-circle" size={16} color="#10b981" /> */}
              <CheckCircle size={16} color="#10b981" />
              <Text style={styles.statText}>{wordsCompleted}</Text>
            </View>
            <View style={styles.strikesContainer}>
              {Array.from({ length: maxStrikes }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.strikeIndicator,
                    i < strikes ? styles.strikeActive : styles.strikeInactive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.wpmText}>
              {Math.round(
                wordsCompleted / ((totalGameTime - timeLeft) / 60) || 0
              )}{" "}
              WPM
            </Text>
          </View>
        </View>
      </View>

      {/* Game Grid */}
      <View style={styles.gameContainer}>
        {isSpectator ? (
          <View style={styles.spectatorContainer}>
            <View style={styles.spectatorIcon}>
              {/* <Ionicons name="eye" size={32} color="rgba(255, 255, 255, 0.6)" /> */}
              <Eye size={32} color="rgba(255, 255, 255, 0.6)" />
            </View>
            <Text style={styles.spectatorTitle}>You're Spectating</Text>
            <Text style={styles.spectatorText}>
              {currentWordIndex >= wordSequence.length
                ? "You finished all words! Waiting for others to finish."
                : "You got 3 strikes, but you can watch others play!"}
            </Text>
            {currentWordIndex < wordSequence.length && (
              <Text style={styles.currentWordText}>
                Current word: {currentWord}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {/* Previous guesses */}
            {guesses.map((guess, guessIndex) => (
              <View key={guessIndex} style={styles.guessRow}>
                {guess.split("").map((letter, letterIndex) => (
                  <View
                    key={letterIndex}
                    style={[
                      styles.letterBox,
                      getLetterColor(letter, letterIndex, guess),
                    ]}
                  >
                    <Text style={styles.letterText}>{letter}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Current guess */}
            {guesses.length < maxGuesses && (
              <View style={styles.guessRow}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const letter = currentGuess[i] || "";
                  const overlayLetter = correctLettersByPosition[i];
                  const isRevealed =
                    revealedLetterIndices.includes(i) &&
                    currentGuess[i] !== wordSequence[currentWordIndex][i];
                  return (
                    <View
                      key={`current-${guesses.length}-${i}`}
                      style={{ position: "relative" }}
                    >
                      <BouncingLetterBox
                        letter={letter}
                        style={[
                          styles.letterBox,
                          letter ? styles.currentGuessBox : styles.emptyBox,
                        ]}
                      />
                      {/* Overlay for correct letter from previous guesses */}
                      {overlayLetter && !letter && !isRevealed && (
                        <View
                          style={[
                            styles.letterBox,
                            letter ? styles.currentGuessBox : styles.emptyBox,
                          ]}
                          className="absolute inset-0 flex items-center justify-center bg-green-400/50"
                        >
                          <Text
                            style={[
                              styles.letterText,
                              {
                                textAlign: "center",
                                textAlignVertical: "center",
                                zIndex: 1,
                                opacity: 0.2,
                              },
                            ]}
                          >
                            {overlayLetter}
                          </Text>
                        </View>
                      )}
                      {/* Overlay for revealed letter powerup */}
                      {isRevealed && (
                        <View
                          style={[
                            styles.letterBox,
                            styles.currentGuessBox,
                            {
                              backgroundColor: "#fbbf24",
                              opacity: 0.7,
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              alignItems: "center",
                              justifyContent: "center",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.letterText,
                              {
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 24,
                                opacity: 1,
                              },
                            ]}
                          >
                            {wordSequence[currentWordIndex][i]}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Empty rows */}
            {Array.from({ length: maxGuesses - guesses.length - 1 }).map(
              (_, index) => (
                <View key={index} style={styles.guessRow}>
                  {Array.from({ length: 5 }).map((_, letterIndex) => {
                    const overlayLetter = correctLettersByPosition[letterIndex];
                    return (
                      <View key={letterIndex} style={{ position: "relative" }}>
                        <View style={[styles.letterBox, styles.emptyBox]}>
                          <Text style={styles.letterText}></Text>
                        </View>
                        {overlayLetter && (
                          <View
                            style={[styles.letterBox, styles.emptyBox]}
                            className="absolute inset-0 flex items-center justify-center bg-green-400/50"
                          >
                            <Text
                              style={[
                                styles.letterText,
                                {
                                  textAlign: "center",
                                  textAlignVertical: "center",
                                  zIndex: 1,
                                  opacity: 0.2,
                                },
                              ]}
                            >
                              {overlayLetter}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )
            )}
          </View>
        )}
      </View>

      {/* Keyboard */}
      <View style={styles.keyboardContainer}>
        {keyboard.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {rowIndex === 2 && (
              <BouncingKey
                letter={"FLASH"}
                onPress={() => setPowerupModalVisible(true)}
                style={[styles.keyboardButton, styles.specialKey]}
                disabled={
                  isSpectator ||
                  gamePhase !== "playing" ||
                  powerups.length === 0
                }
                bounce={false}
              >
                <Zap size={16} color="white" fill={"white"} />
              </BouncingKey>
            )}
            {row.map((letter) => (
              <BouncingKey
                key={letter}
                letter={letter}
                onPress={() => handleKeyPress(letter)}
                style={getKeyboardButtonStyle(letter)}
                disabled={isSpectator || gamePhase !== "playing"}
                bounce={bouncingKey === letter}
              >
                <Text
                  style={[
                    styles.keyboardButtonText,
                    {
                      color:
                        getKeyboardLetterStatus(letter) === "correct"
                          ? "#fff"
                          : getKeyboardLetterStatus(letter) === "wrongPosition"
                          ? "#fff"
                          : getKeyboardLetterStatus(letter) === "wrong"
                          ? "#fff"
                          : "#000",
                    },
                  ]}
                >
                  {letter}
                </Text>
              </BouncingKey>
            ))}
            {rowIndex === 2 && (
              <BouncingKey
                letter={"BACKSPACE"}
                onPress={handleBackspace}
                style={[
                  styles.keyboardButton,
                  styles.backspaceKey,
                  ...[
                    {
                      borderColor: "red",
                    },
                  ],
                ]}
                disabled={isSpectator || gamePhase !== "playing"}
                bounce={bouncingKey === "BACKSPACE"}
              >
                <Delete size={16} color="white" />
              </BouncingKey>
            )}
          </View>
        ))}
      </View>

      {/* Modal Leaderboard */}
      <ModalLeaderboard
        players={players}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      {/* Powerup Modal */}
      <PowerupModal
        visible={powerupModalVisible}
        powerups={powerups}
        onUse={handleUsePowerup}
        onClose={() => setPowerupModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  timerWarning: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  timerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },

  // Collapsible Leaderboard Styles
  minimizedLeaderboard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  minimizedContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  rankBadge: {
    backgroundColor: "rgba(16,185,129,0.3)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rankText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
  },
  minimizedScore: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  expandedLeaderboard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
  },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leaderboardTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  currentPlayerRow: {
    backgroundColor: "rgba(16,185,129,0.15)",
  },
  firstPlace: {
    backgroundColor: "rgba(251,191,36,0.15)",
  },
  playerRank: {
    width: 32,
  },
  rankNumber: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  firstPlaceText: {
    color: "#fbbf24",
  },
  playerName: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  currentPlayerName: {
    fontWeight: "700",
  },
  playerStats: {
    flexDirection: "row",
    gap: 8,
  },
  playerScore: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 50,
    textAlign: "right",
  },
  playerWords: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    minWidth: 25,
    textAlign: "right",
  },
  morePlayersText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  // Modal Leaderboard Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "rgba(30,30,30,0.95)",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalCurrentPlayer: {
    backgroundColor: "rgba(16,185,129,0.2)",
  },
  modalRankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goldBadge: {
    backgroundColor: "#fbbf24",
  },
  silverBadge: {
    backgroundColor: "#9ca3af",
  },
  bronzeBadge: {
    backgroundColor: "#cd7c2f",
  },
  modalRankText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  modalPlayerInfo: {
    flex: 1,
  },
  modalPlayerName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalPlayerStats: {
    flexDirection: "row",
    gap: 16,
  },
  modalStatText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },

  statusContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  strikesContainer: {
    flexDirection: "row",
    gap: 4,
  },
  strikeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  strikeActive: {
    backgroundColor: "#ef4444",
  },
  strikeInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  wpmText: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
  },
  gameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  spectatorContainer: {
    alignItems: "center",
  },
  spectatorIcon: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(107, 114, 128, 0.2)",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  spectatorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  spectatorText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 8,
  },
  currentWordText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
  },
  gridContainer: {
    gap: 8,
  },
  guessRow: {
    flexDirection: "row",
    gap: 8,
  },
  letterBox: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  currentGuessBox: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.75)",
  },
  invalidGuessBox: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
    borderColor: "#ef4444",
    color: "white",
  },
  emptyBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  correctLetter: {
    backgroundColor: "#10b981",
  },
  wrongPositionLetter: {
    backgroundColor: "#f59e0b",
  },
  wrongLetter: {
    backgroundColor: "#6b7280",
    color: "white",
  },
  letterText: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },
  keyboardContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
  keyboardRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  keyboardButton: {
    height: 48,
    minWidth: 32,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  unusedKey: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  correctKey: {
    backgroundColor: "#059669",
    borderColor: "#10b981",
  },
  wrongPositionKey: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  wrongKey: {
    backgroundColor: "#4b5563",
    borderColor: "#6b7280",
    opacity: 0.25,
  },
  specialKey: {
    backgroundColor: "#6b7280",
    opacity: 0.5,
  },
  backspaceKey: {
    backgroundColor: "#dc2626",
    borderColor: "White",
  },
  keyboardButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  gameEndContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  gameEndContent: {
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  trophyContainer: {
    width: 96,
    height: 96,
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  gameEndTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    marginBottom: 8,
  },
  gameEndSubtitle: {
    fontSize: 20,
    color: "white",
    opacity: 0.9,
    marginBottom: 32,
  },
  resultsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    marginBottom: 24,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 18,
    color: "white",
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "700",
  },

  // Final Leaderboard Styles
  finalLeaderboard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 32,
  },
  finalLeaderboardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  finalPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  finalCurrentPlayer: {
    backgroundColor: "rgba(16,185,129,0.2)",
  },
  finalRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  finalRankText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  finalPlayerName: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  finalPlayerScore: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },

  gameEndButtons: {
    width: "100%",
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#10b981",
  },
  secondaryButton: {
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
