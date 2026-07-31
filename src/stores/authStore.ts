import { create } from 'zustand';
import { api, setToken, clearToken } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  avatar: string;
  isVerified: boolean;
  onboarded: boolean;
  xp: number;
  level: number;
  streak: number;
  hearts: number;
  gems: number;
  ageGroup: string | null;
  createdAt: string;
  updatedAt: string;
};

type Badge = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  xpReward: number;
  gemsReward: number;
};

type DailyQuest = {
  id: string;
  key: string;
  title: string;
  description: string;
  type: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  xpReward: number;
  gemsReward: number;
  expiresAt: string;
};

type InventoryItem = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  rarity: string;
  quantity: number;
  equipped: boolean;
  purchasedAt: string;
};

type ModuleProgress = {
  id: string;
  lectureId: string;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  badgeName: string;
  status: string;
  score: number;
  stars: number;
  xpEarned: number;
  completedAt: string | null;
};

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  pendingEmail: string | null;
  modules: ModuleProgress[];
  badges: Badge[];
  dailyQuests: DailyQuest[];
  inventory: InventoryItem[];
  setPendingEmail: (email: string | null) => void;
  setModules: (modules: ModuleProgress[]) => void;
  setBadges: (badges: Badge[]) => void;
  setDailyQuests: (quests: DailyQuest[]) => void;
  setInventory: (inventory: InventoryItem[]) => void;
  login: (token: string) => Promise<void>;
  signup: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  status: 'idle',
  pendingEmail: null,
  modules: [],
  badges: [],
  dailyQuests: [],
  inventory: [],

  setPendingEmail: (email) => set({ pendingEmail: email }),
  setModules: (modules) => set({ modules }),
  setBadges: (badges) => set({ badges }),
  setDailyQuests: (quests) => set({ dailyQuests: quests }),
  setInventory: (inventory) => set({ inventory }),

  async login(token) {
    set({ status: 'loading' });
    try {
      await setToken(token);
      const res = await api.auth.getMe();
      const user = res.data.user as User;
      set({ user, token, status: 'authenticated' });
    } catch {
      await clearToken();
      set({ user: null, token: null, status: 'unauthenticated' });
    }
  },

  async signup(token) {
    set({ status: 'loading' });
    try {
      await setToken(token);
      const res = await api.auth.getMe();
      const user = res.data.user as User;
      set({ user, token, status: 'authenticated' });
    } catch {
      await clearToken();
      set({ user: null, token: null, status: 'unauthenticated' });
    }
  },

  async logout() {
    await clearToken();
    set({ user: null, token: null, status: 'unauthenticated', pendingEmail: null, modules: [], badges: [], dailyQuests: [], inventory: [] });
  },

  async refreshUser() {
    const { token } = get();
    if (!token) {
      set({ status: 'unauthenticated', user: null, pendingEmail: null, modules: [], badges: [], dailyQuests: [], inventory: [] });
      return;
    }
    try {
      const res = await api.auth.getMe();
      const user = res.data.user as User;
      set({ user, status: 'authenticated' });
    } catch {
      await clearToken();
      set({ user: null, token: null, status: 'unauthenticated', pendingEmail: null, modules: [], badges: [], dailyQuests: [], inventory: [] });
    }
  },
}));
