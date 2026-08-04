import { Platform } from "react-native";
import { Audio } from "expo-av";

type SoundType = "success" | "fail" | "celebration";

let nativeSuccess: Audio.Sound | null = null;
let nativeFail: Audio.Sound | null = null;
let nativeCelebration: Audio.Sound | null = null;

const webAudioCache: Record<SoundType, HTMLAudioElement | null> = {
  success: null,
  fail: null,
  celebration: null,
};

const successAsset = require("@/assets/sounds/success.mp3");
const failAsset = require("@/assets/sounds/fail.mp3");
const celebrationAsset = require("@/assets/sounds/celebration.mp3");

function resolveWebPath(asset: number | string): string {
  if (typeof asset === "string") {
    return asset;
  }
  if (typeof window !== "undefined" && (window as any).__EXPO_ASSETS__) {
    const resolved = (window as any).__EXPO_ASSETS__[asset];
    if (resolved) return resolved;
  }
  const fallback = `/assets/sounds/${asset}.mp3`;
  return fallback;
}

function getWebAudio(type: SoundType): HTMLAudioElement | null {
  if (webAudioCache[type]) return webAudioCache[type];

  if (typeof window === "undefined") return null;

  const assetMap: Record<SoundType, number | string> = {
    success: successAsset,
    fail: failAsset,
    celebration: celebrationAsset,
  };

  const path = resolveWebPath(assetMap[type]);

  try {
    const audio = new window.Audio(path);
    audio.preload = "auto";
    audio.load();
    webAudioCache[type] = audio;
    return audio;
  } catch (err) {
    console.warn(`[sounds] Failed to create audio for ${type}:`, err);
    return null;
  }
}

export async function loadSounds() {
  if (Platform.OS === "web") {
    console.log("[sounds] Web platform detected, preloading audio...");
    ["success", "fail", "celebration"].forEach((type) => {
      const audio = getWebAudio(type as SoundType);
      if (audio) {
        console.log(`[sounds] Preloaded ${type}:`, audio.src || audio.currentSrc);
      } else {
        console.warn(`[sounds] Failed to preload ${type}`);
      }
    });
    return;
  }

  try {
    const { sound: s } = await Audio.Sound.createAsync(successAsset);
    nativeSuccess = s;
  } catch {
    nativeSuccess = null;
  }

  try {
    const { sound: f } = await Audio.Sound.createAsync(failAsset);
    nativeFail = f;
  } catch {
    nativeFail = null;
  }

  try {
    const { sound: c } = await Audio.Sound.createAsync(celebrationAsset);
    nativeCelebration = c;
  } catch {
    nativeCelebration = null;
  }
}

export async function playSound(type: SoundType) {
  if (Platform.OS === "web") {
    const audio = getWebAudio(type);
    if (!audio) {
      console.warn(`[sounds] Web audio not loaded for: ${type}`);
      return;
    }
    try {
      audio.currentTime = 0;
      await audio.play();
      console.log(`[sounds] Played ${type} on web`);
    } catch (err) {
      console.warn(`[sounds] Web playback failed for ${type}:`, err);
    }
    return;
  }

  let sound: Audio.Sound | null = null;
  switch (type) {
    case "success":
      sound = nativeSuccess;
      break;
    case "fail":
      sound = nativeFail;
      break;
    case "celebration":
      sound = nativeCelebration;
      break;
  }

  if (!sound) {
    console.warn(`[sounds] Native sound not loaded for: ${type}`);
    return;
  }
  try {
    await sound.replayAsync();
  } catch {
    // ignore playback errors
  }
}

export async function playSuccess() {
  return playSound("success");
}

export async function playFail() {
  return playSound("fail");
}

export async function playCelebration() {
  if (Platform.OS === "web") {
    const webAudio = getWebAudio("celebration");
    if (webAudio) {
      try {
        webAudio.currentTime = 0;
        await webAudio.play();
        return;
      } catch {
        // fallback
      }
    }
    return playSound("success");
  }

  if (nativeCelebration) {
    try {
      await nativeCelebration.replayAsync();
      return;
    } catch {
      // fallback to success
    }
  }
  await playSuccess();
}
