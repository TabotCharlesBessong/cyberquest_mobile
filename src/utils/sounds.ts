import { Audio } from "expo-av";

let successSound: Audio.Sound | null = null;
let failSound: Audio.Sound | null = null;

export async function loadSounds() {
  try {
    const { sound: s } = await Audio.Sound.createAsync(
      require("@/assets/sounds/success.mp3")
    );
    successSound = s;
  } catch {
    successSound = null;
  }

  try {
    const { sound: f } = await Audio.Sound.createAsync(
      require("@/assets/sounds/fail.mp3")
    );
    failSound = f;
  } catch {
    failSound = null;
  }
}

export async function playSuccess() {
  if (!successSound) return;
  try {
    await successSound.replayAsync();
  } catch {
    // ignore playback errors
  }
}

export async function playFail() {
  if (!failSound) return;
  try {
    await failSound.replayAsync();
  } catch {
    // ignore playback errors
  }
}
