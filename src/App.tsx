import { useEffect, useMemo, useState } from 'react';
import { CustomSpinner } from './components/CustomSpinner';
import { DailySpinner } from './components/DailySpinner';
import { FilterState, FoodCatalog } from './components/FoodCatalog';
import { FoodDetailModal } from './components/FoodDetailModal';
import { SpinRecordList } from './components/SpinRecordList';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { dateTagLabels, seasonLabels } from './constants';
import { FOODS } from './data/foods';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getCurrentSeason } from './utils/date';
import { randomId } from './utils/id';
import { CustomFoodItem, DateTag, FoodDetailDraft, FoodItem, SpinnerOption, SpinRecord } from './types';
import './App.css';

const initialFilters: FilterState = {
  season: 'all',
  dateTag: 'all',
  traffic: 'all',
  type: 'all'
};

const defaultSelectedIds = FOODS.filter((food) => food.type === 'meat')
  .slice(0, 3)
  .map((food) => food.id);

type AppTab = 'catalog' | 'daily' | 'custom' | 'weekly' | 'records';

const tabs: { id: AppTab; label: string; hint: string }[] = [
  { id: 'catalog', label: '食材分类', hint: '按时令、日期和红绿灯筛选' },
  { id: 'daily', label: '每日推荐', hint: '按当前时令抽取今日菜品' },
  { id: 'custom', label: '随心转盘', hint: '勾选食材并录入自定义做法' },
  { id: 'weekly', label: '每日 5 道菜', hint: '生成今天的 5 道菜单' },
  { id: 'records', label: '历史记录', hint: '按日期查看并总结点评' }
];

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('catalog');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [now, setNow] = useState(() => new Date());
  const [records, setRecords] = useLocalStorage<SpinRecord[]>('spin-records', []);
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>('custom-selected-ids', defaultSelectedIds);
  const [customFoods, setCustomFoods] = useLocalStorage<CustomFoodItem[]>('custom-foods', []);
  const [foodEdits, setFoodEdits] = useLocalStorage<Record<string, FoodDetailDraft>>('food-detail-edits', {});
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>('favorite-food-ids', []);
  const [detailFoodId, setDetailFoodId] = useState<string | null>(null);

  const currentSeason = useMemo(() => getCurrentSeason(now), [now]);
  const currentDateTag = useMemo<DateTag>(() => {
    const day = now.getDay();
    return day === 0 || day === 6 ? 'weekend' : 'weekday';
  }, [now]);

  const allFoods = useMemo(() => {
    const mergedBaseFoods = FOODS.map((food) => enrichFood(mergeFoodDraft(food, foodEdits[food.id]), favoriteIds));
    const mergedCustomFoods = customFoods.map((food) => enrichFood(mergeFoodDraft(food, foodEdits[food.id]), favoriteIds));
    return [...mergedBaseFoods, ...mergedCustomFoods];
  }, [customFoods, favoriteIds, foodEdits]);

  const foodMap = useMemo(() => new Map(allFoods.map((food) => [food.id, food])), [allFoods]);
  const detailFood = useMemo(() => (detailFoodId ? foodMap.get(detailFoodId) ?? null : null), [detailFoodId, foodMap]);
  const favoriteCount = favoriteIds.filter((id) => foodMap.has(id)).length;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const pushRecord = (option: SpinnerOption, source: SpinRecord['source']) => {
    const matchedFood = foodMap.get(option.id);
    const record: SpinRecord = {
      id: randomId(),
      option: matchedFood ? toRecordOption(matchedFood) : option,
      source,
      timestamp: new Date().toISOString()
    };
    setRecords((prev) => [...prev, record]);
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const showFoodDetail = (id: string) => {
    if (foodMap.has(id)) {
      setDetailFoodId(id);
    }
  };

  const saveFoodDetail = (id: string, draft: FoodDetailDraft) => {
    setFoodEdits((prev) => ({
      ...prev,
      [id]: draft
    }));

    setCustomFoods((prev) =>
      prev.map((food) => {
        if (food.id !== id) return food;
        return {
          ...food,
          ingredients: draft.ingredients,
          cookingMethod: draft.cookingMethod,
          cookingSteps: draft.cookingSteps
        };
      })
    );
  };

  const closeFoodDetail = () => setDetailFoodId(null);
  const hasFood = (id: string) => foodMap.has(id);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">饮食推荐助手</p>
          <h1>吃什么？交给分类、转盘和每日菜单</h1>
          <p className="hero-subtitle">
            当前时令：<strong>{seasonLabels[currentSeason]}</strong> · 日期类型：<strong>{dateTagLabels[currentDateTag]}</strong> ·
            现在支持心动标记、每日 5 道推荐和按日汇总历史记录。
          </p>
        </div>
      </header>

      <main className="tab-shell">
        <aside className="tab-sidebar">
          <section className="tab-sidebar-card">
            <p className="eyebrow">功能导航</p>
            <div className="tab-list" role="tablist" aria-label="功能页签">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <strong>{tab.label}</strong>
                  <span>{tab.hint}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="tab-sidebar-card status-card">
            <p className="eyebrow">当前概览</p>
            <p>时令：{seasonLabels[currentSeason]}</p>
            <p>日期：{dateTagLabels[currentDateTag]}</p>
            <p>已记录菜品：{records.length} 条</p>
            <p>心动菜品：{favoriteCount} 道</p>
            <p>自定义菜品：{customFoods.length} 道</p>
          </section>
        </aside>

        <section className="tab-content">
          {activeTab === 'catalog' && (
            <FoodCatalog
              foods={allFoods}
              filters={filters}
              onFilterChange={handleFilterChange}
              onSelectFood={showFoodDetail}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {activeTab === 'daily' && (
            <DailySpinner
              foods={allFoods}
              season={currentSeason}
              onResult={(option) => pushRecord(option, 'daily')}
              onInspectFood={showFoodDetail}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {activeTab === 'custom' && (
            <CustomSpinner
              foods={allFoods}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
              customFoods={customFoods}
              onCustomFoodsChange={setCustomFoods}
              onResult={(option) => pushRecord(option, 'custom')}
              onInspectFood={showFoodDetail}
            />
          )}

          {activeTab === 'weekly' && <WeeklyPlanner foods={allFoods} season={currentSeason} onSelectFood={showFoodDetail} />}

          {activeTab === 'records' && (
            <SpinRecordList records={records} onDelete={deleteRecord} onSelectFood={showFoodDetail} hasFood={hasFood} />
          )}
        </section>
      </main>

      <footer className="footer">
        <p>你可以先筛食材，再切换到每日推荐、随心转盘、每日 5 道菜或历史记录继续操作。</p>
        <p className="footer-note">数据仅作示例参考，请结合个人饮食需求灵活调整。</p>
      </footer>

      <FoodDetailModal food={detailFood} onClose={closeFoodDetail} onSave={saveFoodDetail} onToggleFavorite={toggleFavorite} />
    </div>
  );
}

function mergeFoodDraft(food: FoodItem, draft?: FoodDetailDraft): FoodItem {
  if (!draft) return food;
  return {
    ...food,
    ingredients: draft.ingredients.length ? draft.ingredients : food.ingredients,
    cookingMethod: draft.cookingMethod || food.cookingMethod,
    cookingSteps: draft.cookingSteps.length ? draft.cookingSteps : food.cookingSteps
  };
}

function enrichFood(food: FoodItem, favoriteIds: string[]): FoodItem {
  return {
    ...food,
    isFavorite: favoriteIds.includes(food.id)
  };
}

function toRecordOption(food: FoodItem): SpinnerOption {
  return {
    id: food.id,
    label: food.name,
    calories: food.calories,
    origin: 'origin' in food && food.origin === 'user' ? 'user' : 'system',
    meta: {
      trafficLight: food.trafficLight,
      type: food.type,
      isFavorite: food.isFavorite
    }
  };
}

export default App;
