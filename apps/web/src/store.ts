import { create } from 'zustand';
import type { CategoryId } from '../../../packages/content/src/categories';
import { applyCommand, type Command } from '../../../packages/simulation/src/commands';
import { createGame } from '../../../packages/simulation/src/setup';
import { advanceWeeks } from '../../../packages/simulation/src/week';
import type { GameState } from '../../../packages/simulation/src/types';

export type ScreenId =
  | 'title' | 'office' | 'meeting' | 'lab' | 'developmentMeeting'
  | 'factory' | 'sales' | 'finance' | 'personnel' | 'archive';

export type FundsPrompt = { required: number; cash: number; weeks: number };

/** 研究所で作った「たたき台」を開発会議へ引き継ぐための、GameStateとは別の下書き状態。 */
export type DevelopmentDraft = {
  categoryId: CategoryId;
  moduleIds: string[];
  qualityLevel: number;
  name: string;
  featureIds: string[];
};

export type GameStore = {
  game: GameState | null;
  screen: ScreenId;
  notice: { kind: 'info' | 'error'; text: string } | null;
  fundsPrompt: FundsPrompt | null;
  developmentDraft: DevelopmentDraft | null;
  startGame: (options: { companyName: string; seed: number }) => void;
  quitToTitle: () => void;
  setScreen: (screen: ScreenId) => void;
  dispatch: (command: Command) => boolean;
  advance: (weeks: number, allowShortfall?: boolean) => void;
  dismissNotice: () => void;
  dismissFundsPrompt: () => void;
  setDevelopmentDraft: (draft: DevelopmentDraft) => void;
  updateDevelopmentFeatureIds: (featureIds: string[]) => void;
  clearDevelopmentDraft: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  screen: 'title',
  notice: null,
  fundsPrompt: null,
  developmentDraft: null,

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

  setDevelopmentDraft: draft => set({ developmentDraft: draft }),
  updateDevelopmentFeatureIds: featureIds => set(store => (
    store.developmentDraft ? { developmentDraft: { ...store.developmentDraft, featureIds } } : store
  )),
  clearDevelopmentDraft: () => set({ developmentDraft: null }),
}));
