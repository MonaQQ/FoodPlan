import { useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FoodItem } from '../types';
import { pickRandom } from '../utils/random';

const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

type WeeklyPlannerProps = {
  foods: FoodItem[];
  season: FoodItem['seasons'][number];
  onSelectFood: (id: string) => void;
};

type WeeklyItem = {
  day: string;
  foodIds: string[];
};

export function WeeklyPlanner({ foods, season, onSelectFood }: WeeklyPlannerProps) {
  const seasonalFoods = useMemo(() => foods.filter((food) => food.seasons.includes(season)), [foods, season]);
  const vegetarians = useMemo(() => foods.filter((food) => food.type === 'vegetarian'), [foods]);
  const meats = useMemo(() => foods.filter((food) => food.type === 'meat'), [foods]);
  const [plan, setPlan] = useLocalStorage<WeeklyItem[]>('weekly-plan', []);

  const normalizedPlan = useMemo<WeeklyItem[]>(() => {
    return plan.map((item) => {
      if (Array.isArray(item.foodIds)) return item;
      const legacyId = (item as unknown as { foodId?: string }).foodId;
      return { day: item.day, foodIds: legacyId ? [legacyId] : [] };
    });
  }, [plan]);

  const pickWithFallback = (pool: FoodItem[], fallback: FoodItem[], usedIds: Set<string>) => {
    const filteredPool = pool.filter((food) => !usedIds.has(food.id));
    const source = filteredPool.length ? filteredPool : fallback.filter((food) => !usedIds.has(food.id));
    return pickRandom(source) ?? fallback[0] ?? pool[0] ?? null;
  };

  const generatePlan = () => {
    const basePool = seasonalFoods.length ? seasonalFoods : foods;
    const vegPool = basePool.filter((food) => food.type === 'vegetarian');
    const meatPool = basePool.filter((food) => food.type === 'meat');
    const nextPlan: WeeklyItem[] = DAY_LABELS.map((day) => {
      const usedIds = new Set<string>();
      const picks: string[] = [];
      const vegPick = pickWithFallback(vegPool, vegetarians, usedIds);
      if (vegPick) {
        picks.push(vegPick.id);
        usedIds.add(vegPick.id);
      }
      const meatPick = pickWithFallback(meatPool, meats, usedIds);
      if (meatPick) {
        picks.push(meatPick.id);
        usedIds.add(meatPick.id);
      }
      while (picks.length < 3) {
        const extraPick = pickWithFallback(basePool, foods, usedIds);
        if (!extraPick) break;
        picks.push(extraPick.id);
        usedIds.add(extraPick.id);
      }
      return { day, foodIds: picks };
    });
    setPlan(nextPlan);
  };

  const resolveFood = (id: string) => foods.find((food) => food.id === id);

  return (
    <section className="panel weekly-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">一周推荐</p>
          <h2>时令 7 日菜谱（每日 3 道）</h2>
        </div>
        <button className="secondary-btn" onClick={generatePlan}>
          一键生成
        </button>
      </header>

      {normalizedPlan.length === 0 && <p className="empty-hint">点击“一键生成”即可获得 7 天推荐。</p>}

      <ul className="weekly-list">
        {normalizedPlan.map((item) => (
          <li key={item.day} className="weekly-item">
            <div>
              <strong>{item.day}</strong>
            </div>
            <div className="weekly-meta multi">
              {item.foodIds.slice(0, 3).map((foodId) => {
                const food = resolveFood(foodId);
                if (!food) return null;
                return (
                  <span key={food.id} className="weekly-chip">
                    <button className="ghost-link" onClick={() => onSelectFood(food.id)}>
                      {food.name}
                    </button>
                    <small>{food.type === 'meat' ? '荤' : '素'} · {food.bestTime}</small>
                  </span>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
