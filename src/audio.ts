type AudioPlayer = (volume?: number) => void

export interface SoundEffects {
  bootUp: AudioPlayer
}

function createSingleAudioPlayer(path: string): Promise<HTMLAudioElement> {
  return new Promise((resolve) => {
    const player = new Audio(path)
    player.addEventListener("canplaythrough", () => resolve(player), false)
  })
}

async function createAudioPlayer(path: string) {
  const players: HTMLAudioElement[] = []
  for (let i = 0; i < 4; i++) {
    players.push(await createSingleAudioPlayer(path))
  }
  let currentIndex = 0
  return function (volume: number = 1.0) {
    players[currentIndex].volume = volume
    players[currentIndex].play()
    currentIndex++
    if (currentIndex >= players.length) currentIndex = 0
  }
}

export async function createSoundEffects() {
  return {
    bootUp: await createAudioPlayer("audio/BBC Boot Sound.mp3"),
  } as SoundEffects
}
