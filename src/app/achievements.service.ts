import { Injectable, signal } from '@angular/core';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'FIRST_BLOOD', name: 'First Blood', description: 'Fire your first employee.', icon: '🔥' },
  { id: 'HR_MENACE', name: 'HR Menace', description: 'Fire 50 employees total.', icon: '💀' },
  { id: 'CORPORATE_ASSASSIN', name: 'Corporate Assassin', description: 'Fire 500 employees total.', icon: '🥷' },
  { id: 'CAFFEINE_ADDICT', name: 'Caffeine Addict', description: 'Take 100 coffee breaks.', icon: '☕' },
  { id: 'SYNERGY_OVERLOAD', name: 'Synergy Overload', description: 'Reach 10,000 lifetime synergy.', icon: '⚡' },
  { id: 'PLATFORMER', name: 'Platformer', description: 'Jump 500 times.', icon: '🦘' },
  { id: 'Q3_CHAMPION', name: 'Q3 Champion', description: 'Complete a Q3 Sprint mode.', icon: '🏆' },
  { id: 'HOSTILE_TAKEOVER', name: 'Hostile Takeover', description: 'Complete Hostile Takeover mode.', icon: '⚔️' },
  { id: 'SILENT_ASSASSIN', name: 'Silent Assassin', description: 'Complete Quiet Quitting mode.', icon: '🤫' },
];

@Injectable({ providedIn: 'root' })
export class AchievementService {
  readonly ACHIEVEMENTS = ACHIEVEMENTS;
  unlocked = signal<string[]>([]);
  stats = signal<{ fired: number; coffees: number; jumps: number }>({
    fired: 0,
    coffees: 0,
    jumps: 0,
  });

  onAchievementUnlocked = signal<Achievement | null>(null);

  constructor() {
    this.loadLocalStats();
  }

  loadLocalStats() {
    try {
      const s = localStorage.getItem('company_stats');
      if (s) {
        this.stats.set({ ...this.stats(), ...JSON.parse(s) });
      }
    } catch (e) {
      // Ignored
    }
  }

  saveLocalStats() {
    try {
      localStorage.setItem('company_stats', JSON.stringify(this.stats()));
    } catch (e) {
      // Ignored
    }
  }

  initUnlocked(achievements: string[]) {
    this.unlocked.set(achievements);
  }

  track(action: 'fire' | 'coffee' | 'jump', amount = 1) {
    this.stats.update(s => {
      if (action === 'fire') s.fired += amount;
      if (action === 'coffee') s.coffees += amount;
      if (action === 'jump') s.jumps += amount;
      return { ...s };
    });
    this.saveLocalStats();
    this.checkAchievements();
  }

  checkAchievements() {
    const s = this.stats();
    if (s.fired >= 1) this.unlock('FIRST_BLOOD');
    if (s.fired >= 50) this.unlock('HR_MENACE');
    if (s.fired >= 500) this.unlock('CORPORATE_ASSASSIN');
    if (s.coffees >= 100) this.unlock('CAFFEINE_ADDICT');
    if (s.jumps >= 500) this.unlock('PLATFORMER');
  }

  checkSynergy(lifetime: number) {
    if (lifetime >= 10000) this.unlock('SYNERGY_OVERLOAD');
  }

  checkGameMode(mode: string) {
    if (mode === 'championship') this.unlock('Q3_CHAMPION');
    if (mode === 'takeover') this.unlock('HOSTILE_TAKEOVER');
    if (mode === 'quiet') this.unlock('SILENT_ASSASSIN');
  }

  unlock(id: string) {
    let changed = false;
    this.unlocked.update(list => {
      if (!list.includes(id)) {
        changed = true;
        return [...list, id];
      }
      return list;
    });

    if (changed) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        this.onAchievementUnlocked.set(ach);
        setTimeout(() => {
           if (this.onAchievementUnlocked()?.id === ach.id) {
               this.onAchievementUnlocked.set(null);
           }
        }, 4000);
      }
    }
    return changed;
  }
}
