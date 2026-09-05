import { create } from 'zustand';
import { applyCommand, type Command } from '../../../packages/simulation/src/commands';
import { createGame } from '../../../packages/simulation/src/setup';
import { advanceWeeks } from '../../../packages/simulation/src/week';
import type { GameState } from '../../../packages/simulation/src/types';

export type ScreenId = 'title' | 'office' | 'lab' | 'factory' | 'sales' | 'finance';

export type FundsPrompt = { required: number; cash: number; weeks: number };

export type GameStore = {
  game: GameState | null;
  screen: ScreenId;
  notice: { kind: 'info' | 'error'; text: string } | null;
  fundsPrompt: FundsPrompt | null;
  startGame: (options: { companyName: string; seed: number }) => void;
  quitToTitle: () => void;
  setScreen: (screen: ScreenId) => void;
  dispatch: (command: Command) => boolean;
  advance: (weeks: number, allowShortfall?: boolean) => void;
  dismissNotice: () => void;
  dismissFundsPrompt: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  screen: 'title',
  notice: null,
  fundsPrompt: null,

  startGame: ({ companyName, seed }) => {
    const game = createGame({ scenarioId: 'SC01', seed, companyName });
    set({ game, screen: 'office', notice: null, fundsPrompt: null });
  },

  quitToTitle: () => set({ game: null, screen: 'title', notice: null, fundsPrompt: null }),

  setScreen: screen => set({ screen }),

  dispatch: command => {
    const game = get().game;
    if (!game) return false;
    const result = applyCommand(game, command);
    if (!result.ok) {
      set({ notice: { kind: 'error', text: result.error } });
      return false;
    }
    set({ game: result.state, notice: null });
    return true;
  },

  advance: (weeks, allowShortfall = false) => {
    const game = get().game;
    if (!game) return;
    const result = advanceWeeks(game, weeks, { allowShortfall });
    if (!result.ok) {
      set({
        game: result.state,
        fundsPrompt: { required: result.required, cash: result.cash, weeks: weeks - result.weeksAdvanced },
        notice: { kind: 'error', text: '必須の支払いに現金が足りません。週送りを中断しました。' },
      });
      return;
    }
    set({ game: result.state, fundsPrompt: null, notice: null });
  },

  dismissNotice: () => set({ notice: null }),
  dismissFundsPrompt: () => set({ fundsPrompt: null }),
}));
