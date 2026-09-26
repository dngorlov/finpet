/** Keep lesson tests off the native audio module. Playback is covered in playCue.test.ts. */
jest.mock("expo-audio", () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    volume: 1,
    loop: false,
  })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));
