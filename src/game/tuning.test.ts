import { describe, it, expect } from 'vitest';
import { TUNING } from './tuning';

describe('TUNING constants', () => {
  it('matches the values in the spec', () => {
    expect(TUNING.v0).toBe(8);
    expect(TUNING.vmax).toBe(22);
    expect(TUNING.T_ramp).toBe(60);
    expect(TUNING.T_smooth).toBe(20);
    expect(TUNING.T_tight).toBe(45);
    expect(TUNING.toleranceEasy).toBe(25);
    expect(TUNING.toleranceHard).toBe(8);
    expect(TUNING.basePoints).toBe(100);
    expect(TUNING.maxBonusGain).toBe(0.5);
    expect(TUNING.powerupDropP).toBe(0.05);
    expect(TUNING.detents).toBe(8);
    expect(TUNING.laneCount).toBe(3);
  });

  it('exposes powerup durations', () => {
    expect(TUNING.powerups.slowMo.duration).toBe(4);
    expect(TUNING.powerups.slowMo.timeScale).toBe(0.4);
    expect(TUNING.powerups.gradient.barrierCount).toBe(3);
    expect(TUNING.powerups.magnet.duration).toBe(3);
    expect(TUNING.powerups.magnet.snapRadius).toBe(10);
  });
});
