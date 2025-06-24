"use client"

import { playSoundEffect } from "@/app/(tabs)"
import { db } from "@/lib/instant"
import { AlertCircle, ArrowLeft, User, Zap } from "lucide-react-native"
import { useEffect, useState } from "react"
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

const nanoidAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-"
const isNanoidChar = (char: string) => nanoidAlphabet.includes(char)

interface JoinLobbyScreenProps {
  onNavigate: (
    screen: "menu" | "lobby" | "settings" | "game" | "joinLobby",
    params?: { code?: string; isHost?: boolean },
  ) => void
  playerName: string
}

export default function JoinLobbyScreen({ onNavigate, playerName }: JoinLobbyScreenProps) {
  const [lobbyCode, setLobbyCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const [pendingNav, setPendingNav] = useState<null | {
    code: string
    userId: string
  }>(null)

  // Always create a room reference, but use a dummy code when pendingNav is null
  const room = db.room("lobby", pendingNav?.code || "dummy")

  // Call usePresence with a flag to determine if it should be active
  const presenceData = db.rooms.usePresence(room, {
    initialData: {
      name: playerName,
      id: pendingNav?.userId || "",
      isHost: false,
      ready: false,
      score: 0,
      wordsSolved: 0,
    },
  })

  // Only use presence data when we have valid pendingNav
  const validPresenceData = pendingNav ? presenceData : null

  useEffect(() => {
    playSoundEffect("click")
  }, [lobbyCode])

  useEffect(() => {
    if (!pendingNav || !validPresenceData) return

    const timer = setTimeout(() => {
      const peerList = Object.values(validPresenceData.peers || {})
      if (peerList.length === 0) {
        onNavigate("lobby", { code: pendingNav.code, isHost: true })
      } else {
        onNavigate("lobby", { code: pendingNav.code, isHost: false })
      }
      setIsJoining(false)
      setPendingNav(null)
    }, 300)

    return () => clearTimeout(timer)
  }, [pendingNav, validPresenceData, onNavigate])

  const handleJoinLobby = async () => {
    playSoundEffect("press_2")
    if (lobbyCode.length !== 6) {
      setError("Lobby code must be 6 characters")
      return
    }
    setIsJoining(true)
    setError("")
    const userId = Math.random().toString(36).slice(2, 10)
    setPendingNav({ code: lobbyCode, userId })
  }

  const handleCodeChange = (value: string) => {
    const cleanCode = value
      .split("")
      .filter((c) => isNanoidChar(c))
      .join("")
      .slice(0, 6)
      .toUpperCase()
    setLobbyCode(cleanCode)
    setError("")
  }

  const isValidCode = lobbyCode.length === 6

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              onNavigate("menu")
              playSoundEffect("press_2")
            }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Join Lobby</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <User size={48} color="white" />
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Enter Lobby Code</Text>
            <Text style={styles.instructionsText}>Ask your friend for the 6-character lobby code</Text>
            {/* if the lobby does not exist, you will be appointed as host */}
            <Text style={styles.instructionsText}>You will be appointed as host if the lobby does not exist</Text>
          </View>

          {/* Code Input */}
          <View style={styles.inputContainer}>
            <TextInput
              value={lobbyCode}
              onChangeText={handleCodeChange}
              placeholder="RUSH42"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              style={styles.codeInput}
              editable={!isJoining}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
            />
            <Text style={styles.characterCounter}>{lobbyCode.length}/6 characters</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#fca5a5" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </View>
          )}

          {/* Join Button */}
          <View style={styles.joinButtonContainer}>
            <TouchableOpacity
              style={[styles.joinButton, (!isValidCode || isJoining) && styles.joinButtonDisabled]}
              onPress={handleJoinLobby}
              disabled={!isValidCode || isJoining}
            >
              {isJoining ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingSpinner} />
                  <Text style={styles.joinButtonText}>Joining...</Text>
                </View>
              ) : (
                <>
                  <Zap size={24} color="white" fill={"white"} />
                  <Text style={styles.joinButtonText}>Join Game</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Player Info */}
          <View style={styles.playerInfoContainer}>
            <View style={styles.playerInfoBox}>
              <Text style={styles.playerInfoLabel}>Joining as</Text>
              <Text style={styles.playerInfoName}>{playerName}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.createLobbyButton]}
            onPress={() => {
              onNavigate("lobby")
              playSoundEffect("press_2")
            }}
          >
            <Text style={styles.buttonText}>Create New Lobby Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
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
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionsContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 24,
  },
  codeInput: {
    height: 64,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    letterSpacing: 4,
  },
  characterCounter: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginTop: 8,
  },
  errorContainer: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 14,
    flex: 1,
  },
  joinButtonContainer: {
    width: "100%",
    maxWidth: 320,
    marginBottom: 32,
  },
  joinButton: {
    height: 56,
    backgroundColor: "#10b981",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  joinButtonDisabled: {
    backgroundColor: "rgba(16, 185, 129, 0.5)",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    borderRadius: 10,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  playerInfoContainer: {
    width: "100%",
    maxWidth: 320,
  },
  playerInfoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  playerInfoLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  playerInfoName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  actionButtons: {
    paddingBottom: 24,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createLobbyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
})
