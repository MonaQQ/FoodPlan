import { useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FoodItem } from '../types';
import { formatDate } from '../utils/date';
import { pickRandom } from '../utils/random';

type WeeklyPlannerProps = {
  foods: FoodItem[];
  season: FoodItem['seasons'][number];
  onSelectFood: (id: string) => void;
};

type DailyPlan = {
  date: string;
  foodIds: string[];
};

export function WeeklyPlanner({ foods, season, onSelectFood }: WeeklyPlannerProps) {
  const seasonalFoods = useMemo(() => foods.filter((food) => food.seasons.includes(season)), [foods, season]);
  const [plan, setPlan] = useLocalStorage<DailyPlan>('daily-five-plan', { date: '', foodIds: [] });
  const today = formatDate(new Date());

  const pickWithUnique = (pool: FoodItem[], usedIds: Set<string>) => {
    const available = pool.filter((food) => !usedIds.has(food.id));
    const fallback = foods.filter((food) => !usedIds.has(food.id));
    return pickRandom(available.length ? available : fallback);
  };

  const generatePlan = () => {
    const basePool = seasonalFoods.length ? seasonalFoods : foods;
    const usedIds = new Set<string>();
    const foodIds: string[] = [];

    while (foodIds.length < 5) {
      const pick = pickWithUnique(basePool, usedIds);
      if (!pick) break;
      usedIds.add(pick.id);
      foodIds.push(pick.id);
    }

    setPlan({ date: today, foodIds });
  };

  useEffect(() => {
    if (plan.date !== today || plan.foodIds.length !== 5) {
      generatePlan();
    }
  }, [plan.date, plan.foodIds.length, today]);

  const resolvedFoods = plan.foodIds.map((id) => foods.find((food) => food.id === id)).filter(Boolean) as FoodItem[];

  return (
    <section className="panel weekly-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">每日菜单</p>
          <h2>今日 5 道菜</h2>
        </div>
        <button className="secondary-btn" onClick={generatePlan}>
          重新生成
        </button>
      </header>

      <p className="daily-plan-date">日期：{plan.date || today}</p>

      {resolvedFoods.length === 0 && <p className="empty-hint">点击“重新生成”即可获得今日 5 道推荐。</p>}

      <ul className="weekly-list">
        {resolvedFoods.map((food, index) => (
          <li key={food.id} className="weekly-item">
            <div>
              <strong>第 {index + 1} 道</strong>
              <p>{food.name}</p>
            </div>
            <div className="weekly-meta multi">
              <span className="weekly-chip">
                <button className="ghost-link" onClick={() => onSelectFood(food.id)}>
                  查看详情
                </button>
                <small>
                  {food.type === 'meat' ? '荤菜' : '素菜'} · {food.bestTime}
                  {food.isFavorite ? ' · 心动' : ''}
                </small>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
