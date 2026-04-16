import { useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FoodItem, WeeklyPlan, WeeklyPlanDay } from '../types';
import { formatDate } from '../utils/date';
import { pickRandom } from '../utils/random';

type WeeklyPlannerProps = {
  foods: FoodItem[];
  season: FoodItem['seasons'][number];
  onSelectFood: (id: string) => void;
};

const DEFAULT_DAILY_COUNT = 3;

export function WeeklyPlanner({ foods, season, onSelectFood }: WeeklyPlannerProps) {
  const [dailyCount, setDailyCount] = useLocalStorage<number>('weekly-daily-count', DEFAULT_DAILY_COUNT);
  const [plan, setPlan] = useLocalStorage<WeeklyPlan>('weekly-plan-v2', {
    startDate: '',
    dailyCount: DEFAULT_DAILY_COUNT,
    days: []
  });

  const today = formatDate(new Date());

  const generatePlan = (count = dailyCount) => {
    const nextPlan: WeeklyPlan = {
      startDate: today,
      dailyCount: count,
      days: Array.from({ length: 7 }, (_, index) => buildDayPlan(foods, season, today, index, count))
    };
    setPlan(nextPlan);
  };

  useEffect(() => {
    if (plan.startDate !== today || plan.dailyCount !== dailyCount || plan.days.length !== 7) {
      generatePlan(dailyCount);
    }
  }, [dailyCount, plan.dailyCount, plan.days.length, plan.startDate, season, today]);

  return (
    <section className="panel weekly-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">一周推荐</p>
          <h2>每日 n 道菜</h2>
        </div>
        <div className="weekly-controls">
          <label className="inline-number-control">
            每日数量
            <input
              type="number"
              min="1"
              max="10"
              value={dailyCount}
              onChange={(event) => setDailyCount(Math.max(1, Math.min(10, Number(event.target.value) || 1)))}
            />
          </label>
          <button className="secondary-btn" type="button" onClick={() => generatePlan(dailyCount)}>
            重新生成
          </button>
        </div>
      </header>

      <p className="daily-plan-date">开始日期：{plan.startDate || today}，当前按每日 {dailyCount} 道菜生成。</p>

      {plan.days.length === 0 ? (
        <p className="empty-hint">点击“重新生成”即可得到一周推荐。</p>
      ) : (
        <ul className="weekly-list weekly-grid">
          {plan.days.map((day) => (
            <li key={day.date} className="weekly-item weekly-day-card">
              <div>
                <strong>{formatWeekday(day.date)}</strong>
                <p>{day.date}</p>
              </div>
              <div className="weekly-meta multi weekly-chip-grid">
                {day.foodIds.map((foodId, index) => {
                  const food = foods.find((item) => item.id === foodId);
                  if (!food) return null;
                  return (
                    <span key={`${day.date}-${food.id}`} className="weekly-chip">
                      <button className="ghost-link" onClick={() => onSelectFood(food.id)}>
                        第 {index + 1} 道：{food.name}
                      </button>
                      <small>
                        {food.type === 'meat' ? '荤菜' : '素菜'} · {food.bestTime}
                        {food.isFavorite ? ' · 心动' : ''}
                      </small>
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function buildDayPlan(
  foods: FoodItem[],
  season: FoodItem['seasons'][number],
  startDate: string,
  offset: number,
  dailyCount: number
): WeeklyPlanDay {
  const baseDate = new Date(`${startDate}T00:00:00`);
  baseDate.setDate(baseDate.getDate() + offset);
  const date = formatDate(baseDate);
  const seasonalFoods = foods.filter((food) => food.seasons.includes(season));
  const source = seasonalFoods.length ? seasonalFoods : foods;
  const usedIds = new Set<string>();
  const foodIds: string[] = [];

  while (foodIds.length < dailyCount) {
    const available = source.filter((food) => !usedIds.has(food.id));
    const fallback = foods.filter((food) => !usedIds.has(food.id));
    const picked = pickRandom(available.length ? available : fallback);
    if (!picked) break;
    usedIds.add(picked.id);
    foodIds.push(picked.id);
  }

  return { date, foodIds };
}

function formatWeekday(dateText: string) {
  const day = new Date(`${dateText}T00:00:00`).getDay();
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day];
}
