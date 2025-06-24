import "@/global.css";
("use client");

import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";

import Particles from "@/components/Background/Particles";
import CreditsScreen from "@/components/CreditsScreen";
import GameScreen from "@/components/GameScreen";
import JoinLobbyScreen from "@/components/JoinLobbyScreen";
import LobbyScreen from "@/components/LobbyScreen";
import MainMenu from "@/components/MainMenu";
import SettingsScreen from "@/components/SettingsScreen";
import { View } from "react-native";
import { useGameStore } from "../../lib/useGameStore";

type Screen =
  | "menu"
  | "lobby"
  | "lobby.create"
  | "settings"
  | "game"
  | "joinLobby"
  | "credits";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [playerName, setPlayerName] = useState("Player");
  const [screenParams, setScreenParams] = useState<any>(null);

  useEffect(() => {
    playSoundEffect("click");
  }, [playerName]);

  // Keep a ref to the current music sound
  const bgMusic = useRef<Audio.Sound | null>(null);
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const musicVolume = useGameStore((s) => s.musicVolume);

  const navigateToScreen = (screen: Screen, params?: any) => {
    setCurrentScreen(screen);
    setScreenParams(params || null);
  };

  const renderScreen = () => {
    playSoundEffect("click");
    switch (currentScreen) {
      case "menu":
        return (
          <MainMenu
            onNavigate={navigateToScreen}
            playerName={playerName}
            setPlayerName={setPlayerName}
          />
        );
      case "lobby":
        return (
          <LobbyScreen
            onNavigate={navigateToScreen}
            playerName={playerName}
            isHost={screenParams?.isHost}
            code={screenParams?.code}
          />
        );
      case "lobby.create":
        return (
          <LobbyScreen
            onNavigate={navigateToScreen}
            playerName={playerName}
            isHost={true}
          />
        );
      case "settings":
        return <SettingsScreen onNavigate={navigateToScreen} />;
      case "game":
        return (
          <GameScreen
            onNavigate={navigateToScreen}
            code={screenParams?.code}
            playerName={playerName}
            isHost={screenParams?.isHost}
            data={screenParams?.data}
          />
        );
      case "joinLobby":
        return (
          <JoinLobbyScreen
            onNavigate={navigateToScreen}
            playerName={playerName}
          />
        );
      case "credits":
        return <CreditsScreen onNavigate={navigateToScreen} />;
      default:
        return (
          <MainMenu
            onNavigate={navigateToScreen}
            playerName={playerName}
            setPlayerName={setPlayerName}
          />
        );
    }
  };

  // Load and play music on mount or when enabled
  useEffect(() => {
    let isMounted = true;
    async function loadAndPlayMusic() {
      try {
        if (!musicEnabled) return;
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/audio/bg-music.mp3"),
          { isLooping: true, volume: musicVolume / 100 }
        );
        bgMusic.current = sound;
        if (isMounted) await sound.playAsync();
      } catch (e) {
        // Ignore if file missing
      }
    }
    loadAndPlayMusic();
    return () => {
      isMounted = false;
      if (bgMusic.current) {
        bgMusic.current.stopAsync();
        bgMusic.current.unloadAsync();
        bgMusic.current = null;
      }
    };
  }, [musicEnabled]);

  // Update music volume in real time without restarting
  useEffect(() => {
    if (bgMusic.current) {
      bgMusic.current.setVolumeAsync(musicVolume / 100);
    }
  }, [musicVolume]);

  return (
    <>
      <Head>
        <title>WuzzleRush - Real-Time Multiplayer Word Game</title>
        <meta
          name="description"
          content="Play WuzzleRush, a real-time multiplayer word game with friends!"
        />
        <meta
          property="og:title"
          content="WuzzleRush - Real-Time Multiplayer Word Game"
        />
        <meta
          property="og:description"
          content="Play WuzzleRush, a real-time multiplayer word game with friends!"
        />
        <meta property="og:image" content="/assets/images/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wuzzlerush.brndndiaz.dev/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="WuzzleRush - Real-Time Multiplayer Word Game"
        />
        <meta
          name="twitter:description"
          content="Play WuzzleRush, a real-time multiplayer word game with friends!"
        />
        <meta name="twitter:image" content="/assets/images/og-image.png" />
        <link rel="icon" href="/assets/images/favicon.png" />
      </Head>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#9333ea", "#ec4899", "#f97316"]}
        style={{ flex: 1, userSelect: "none" }}
      >
        {renderScreen()}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
            pointerEvents: "none",
          }}
        >
          <Particles></Particles>
        </View>
      </LinearGradient>
    </>
  );
}

export async function playSoundEffect(
  name:
    | "correct"
    | "error"
    | "start"
    | "press"
    | "press_2"
    | "click"
    | "info"
    | "success"
    | "sonar"
    | "heartbeat"
) {
  const soundEnabled = useGameStore.getState().soundEnabled;
  const soundVolume = useGameStore.getState().soundVolume;
  if (!soundEnabled) return;
  let file;
  if (name === "correct") file = require("@/assets/audio/correct.mp3");
  else if (name === "error") file = require("@/assets/audio/error.mp3");
  else if (name === "start") file = require("@/assets/audio/start.mp3");
  else if (name === "press") file = require("@/assets/audio/press.wav");
  else if (name === "press_2") file = require("@/assets/audio/press_2.wav");
  else if (name === "click") file = require("@/assets/audio/click.wav");
  else if (name === "info") file = require("@/assets/audio/info.wav");
  else if (name === "success") file = require("@/assets/audio/success.wav");
  else if (name === "sonar") file = require("@/assets/audio/sonar.wav");
  else if (name === "heartbeat") file = require("@/assets/audio/heartbeat.wav");
  else return;
  try {
    const { sound } = await Audio.Sound.createAsync(file, {
      volume: soundVolume / 100,
    });
    await sound.playAsync();
    setTimeout(() => sound.unloadAsync(), 2000);
  } catch (e) {}
}
