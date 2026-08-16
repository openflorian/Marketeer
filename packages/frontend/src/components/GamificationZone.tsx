// components/GamificationZone.tsx
import { useEffect, useState } from 'preact/hooks';
import { signal } from '@preact/signals';

interface DayNode {
  day: number;
  isOpened: boolean;
  reward: string;
  icon: string;
}

const dailyNodes = signal<DayNode[]>(
  Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    isOpened: false,
    reward: `NERD_LOOT_DAY_${String(i + 1).padStart(2, '0')}`,
    icon: ['🔒', '🎁', '🎯', '🚀', '💎', '⚡', '🏆'][i],
  }))
);

function openDailyNode(index: number) {
  const updated = dailyNodes.value.slice();
  updated[index].isOpened = true;
  dailyNodes.value = updated;

  // Tracking
  console.log(`[GAMIFICATION] Day ${index + 1} opened. Reward: ${updated[index].reward}`);
}

export default function GamificationZone() {
  const [todayDay, setTodayDay] = useState(1);

  useEffect(() => {
    const today = new Date().getDate() % 7 || 7;
    setTodayDay(today);
  }, []);

  return (
    <section id="gamification" class="mb-20">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
        <span>⚡</span>
        <span>DAILY_LOOT_CRATE</span>
        <span class="ml-auto text-xs text-gray-500">Gamified Engagement</span>
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {dailyNodes.value.map((node, idx) => (
          <div
            key={node.day}
            onClick={() => openDailyNode(idx)}
            class={`glass-card p-4 rounded-xl text-center cursor-pointer transition-all transform hover:scale-105 ${
              node.isOpened
                ? 'border-green-500/50 bg-green-500/10'
                : idx < todayDay
                  ? 'border-indigo-500/30 hover:border-indigo-500/50'
                  : 'border-dashed border-gray-500/20 opacity-50'
            }`}
          >
            <div class="text-xs text-gray-500 font-mono mb-2">
              {node.isOpened ? '✓ UNLOCKED' : `DAY_${String(node.day).padStart(2, '0')}`}
            </div>

            <div class="text-3xl my-2 transition-transform hover:scale-125">
              {node.isOpened ? '🎁' : node.icon}
            </div>

            <div class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
              {node.isOpened ? 'Claimed' : 'Unbox'}
            </div>

            {node.isOpened && (
              <div class="text-[9px] text-green-400 font-mono mt-2 truncate">
                {node.reward}
              </div>
            )}
          </div>
        ))}
      </div>

      <!-- Daily Quest Status -->
      <div class="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-semibold text-purple-300">Tägliche Überraschung verfügbar</p>
            <p class="text-xs text-gray-400 mt-1">Wöchliche Inhalte werden regeneriert – neue Deals jeden Tag!</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-purple-400">{dailyNodes.value.filter(n => n.isOpened).length}/7</div>
            <div class="text-xs text-gray-500">Diese Woche</div>
          </div>
        </div>
      </div>
    </section>
  );
}
