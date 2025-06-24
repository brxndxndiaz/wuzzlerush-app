import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface ParticleData {
  id: string;
  initialX: number;
  initialY: number;
  size: number;
  color: string;
  velocityX: number;
  velocityY: number;
  lifetime: number;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Utility function to generate random number between min and max
const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = (): string => {
  const colors = [
    // 'rgba(255, 100, 100, 0.8)',
    // 'rgba(100, 255, 100, 0.8)',
    // 'rgba(100, 100, 255, 0.8)',
    // 'rgba(255, 255, 100, 0.8)',
    // 'rgba(255, 100, 255, 0.8)',
    // 'rgba(100, 255, 255, 0.8)',
    // 'rgba(255, 255, 255, 0.6)',
    "rgba(255, 255, 255, 0.6)",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Create particle data
const createParticleData = (): ParticleData => ({
  id: Math.random().toString(36).substr(2, 9),
  initialX: randomBetween(0, SCREEN_WIDTH),
  initialY: randomBetween(0, SCREEN_HEIGHT),
  size: randomBetween(1, 8),
  color: getRandomColor(),
  velocityX: randomBetween(-25, 25),
  velocityY: randomBetween(-25, 25),
  lifetime: randomBetween(3000, 6000),
});

interface SingleParticleProps {
  data: ParticleData;
  onParticleReset: (id: string) => void;
}

const SingleParticle: React.FC<SingleParticleProps> = ({
  data,
  onParticleReset,
}) => {
  const translateX = useSharedValue(data.initialX);
  const translateY = useSharedValue(data.initialY);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  const resetParticle = () => {
    onParticleReset(data.id);
  };

  useEffect(() => {
    // Initial fade in and scale up
    opacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.quad),
    });
    scale.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
    });

    // Calculate final position based on velocity and lifetime
    const finalX = data.initialX + (data.velocityX * data.lifetime) / 1000;
    const finalY = data.initialY + (data.velocityY * data.lifetime) / 1000;

    // Wrap around screen edges
    let wrappedX = finalX;
    let wrappedY = finalY;

    if (finalX < 0) wrappedX = SCREEN_WIDTH + (finalX % SCREEN_WIDTH);
    if (finalX > SCREEN_WIDTH) wrappedX = finalX % SCREEN_WIDTH;
    if (finalY < 0) wrappedY = SCREEN_HEIGHT + (finalY % SCREEN_HEIGHT);
    if (finalY > SCREEN_HEIGHT) wrappedY = finalY % SCREEN_HEIGHT;

    // Animate movement
    translateX.value = withTiming(wrappedX, {
      duration: data.lifetime,
      easing: Easing.linear,
    });

    translateY.value = withTiming(wrappedY, {
      duration: data.lifetime,
      easing: Easing.linear,
    });

    // Fade out and scale down before death, then reset after 1 second
    const fadeOutDelay = data.lifetime * 0.8;
    const fadeOutDuration = data.lifetime * 0.2;

    setTimeout(() => {
      opacity.value = withSequence(
        withTiming(0, {
          duration: fadeOutDuration,
          easing: Easing.in(Easing.quad),
        }),
        withDelay(
          1000,
          withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })
        )
      );

      scale.value = withSequence(
        withTiming(0, {
          duration: fadeOutDuration,
          easing: Easing.in(Easing.quad),
        }),
        withDelay(
          1000,
          withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) })
        )
      );

      // Reset particle after fade out + 1 second delay + fade in
      setTimeout(() => {
        runOnJS(resetParticle)();
      }, fadeOutDuration + 1000 + 500);
    }, fadeOutDelay);
  }, [data]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: data.size,
          height: data.size,
          backgroundColor: data.color,
          borderRadius: data.size / 2,
          shadowColor: data.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
          elevation: 5,
        },
        animatedStyle,
      ]}
    />
  );
};

interface ParticleGeneratorProps {
  particleCount?: number;
  style?: any;
}

const ParticleGenerator: React.FC<ParticleGeneratorProps> = ({
  particleCount = 25,
  style,
}) => {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  // Initialize particles
  useEffect(() => {
    const initialParticles = Array.from(
      { length: particleCount },
      createParticleData
    );
    setParticles(initialParticles);
  }, [particleCount]);

  // Handle particle reset
  const handleParticleReset = (particleId: string) => {
    setParticles((prevParticles) =>
      prevParticles.map((particle) =>
        particle.id === particleId ? createParticleData() : particle
      )
    );
  };

  return (
    <View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          zIndex: -1,
        },
        style,
      ]}
      pointerEvents="none"
    >
      {particles.map((particle) => (
        <SingleParticle
          key={particle.id}
          data={particle}
          onParticleReset={handleParticleReset}
        />
      ))}
    </View>
  );
};

export default ParticleGenerator;
