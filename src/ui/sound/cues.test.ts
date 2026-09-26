import { cueForVerdict, readSoundVolume, stepVolume } from "./cues";

describe("громкость", () => {
  it("starts at 80 when nothing is stored, and keeps an explicit mute", () => {
    expect(readSoundVolume(null)).toBe(80);
    expect(readSoundVolume("")).toBe(80);
    expect(readSoundVolume("нет")).toBe(80);
    expect(readSoundVolume("0")).toBe(0);
    expect(readSoundVolume("70")).toBe(70);
    expect(readSoundVolume("140")).toBe(100);
    expect(readSoundVolume("-4")).toBe(0);
  });

  it("steps by 10 and stops at the ends", () => {
    expect(stepVolume(80, -1)).toBe(70);
    expect(stepVolume(80, 1)).toBe(90);
    expect(stepVolume(3, -1)).toBe(0);
    expect(stepVolume(96, 1)).toBe(100);
  });
});

describe("cue for a verdict", () => {
  it("maps a right answer, a priced answer, and a miss", () => {
    expect(cueForVerdict("good")).toBe("correct");
    expect(cueForVerdict("warn")).toBe("almost");
    expect(cueForVerdict("bad")).toBe("wrong");
  });
});
