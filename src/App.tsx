import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { DateTag, SpinnerOption, SpinRecord } from './types';
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

function App() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [now, setNow] = useState(() => new Date());
  const currentSeason = useMemo(() => getCurrentSeason(now), [now]);
  const currentDateTag = useMemo<DateTag>(() => {
    const day = now.getDay();
    return day === 0 || day === 6 ? 'weekend' : 'weekday';
  }, [now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const [records, setRecords] = useLocalStorage<SpinRecord[]>('spin-records', []);
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>('custom-selected-ids', defaultSelectedIds);
  const [customOptions, setCustomOptions] = useLocalStorage<SpinnerOption[]>('custom-options', []);
  const [detailFoodId, setDetailFoodId] = useState<string | null>(null);

  const foodMap = useMemo(() => new Map(FOODS.map((food) => [food.id, food])), []);
  const detailFood = useMemo(() => (detailFoodId ? foodMap.get(detailFoodId) ?? null : null), [detailFoodId, foodMap]);

  const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const pushRecord = useCallback(
    (option: SpinnerOption, source: SpinRecord['source']) => {
      const record: SpinRecord = {
        id: randomId(),
        option,
        source,
        timestamp: new Date().toISOString()
      };
      setRecords((prev) => [...prev, record]);
    },
    [setRecords]
  );

  const deleteRecord = useCallback(
    (id: string) => setRecords((prev) => prev.filter((record) => record.id !== id)),
    [setRecords]
  );

  const moveRecord = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setRecords((prev) => {
        const index = prev.findIndex((record) => record.id === id);
        if (index === -1) return prev;
        const swapIndex = direction === 'up' ? Math.max(index - 1, 0) : Math.min(index + 1, prev.length - 1);
        if (swapIndex === index) return prev;
        const updated = [...prev];
        [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
        return updated;
      });
    },
    [setRecords]
  );

  const showFoodDetail = useCallback(
    (id: string) => {
      if (foodMap.has(id)) {
        setDetailFoodId(id);
      }
    },
    [foodMap]
  );

  const closeFoodDetail = useCallback(() => setDetailFoodId(null), []);
  const hasFood = useCallback((id: string) => foodMap.has(id), [foodMap]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">饮食推荐助手</p>
          <h1>吃什么？交给双转盘 + 分类指南</h1>
          <p className="hero-subtitle">
            当前时令：<strong>{seasonLabels[currentSeason]}</strong> · 日期类型：
            <strong>{dateTagLabels[currentDateTag]}</strong>（可在分类区切换） · 红绿灯帮你快速识别热量密度。
          </p>
        </div>
      </header>

      <main className="layout">
        <FoodCatalog foods={FOODS} filters={filters} onFilterChange={handleFilterChange} onSelectFood={showFoodDetail} />

        <div className="spinners-column">
          <DailySpinner
            foods={FOODS}
            season={currentSeason}
            onResult={(option) => pushRecord(option, 'daily')}
            onInspectFood={showFoodDetail}
          />
          <CustomSpinner
            foods={FOODS}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            customOptions={customOptions}
            onCustomOptionsChange={setCustomOptions}
            onResult={(option) => pushRecord(option, 'custom')}
            onInspectFood={showFoodDetail}
          />
          <WeeklyPlanner foods={FOODS} season={currentSeason} onSelectFood={showFoodDetail} />
          <SpinRecordList
            records={records}
            onDelete={deleteRecord}
            onMove={moveRecord}
            onSelectFood={showFoodDetail}
            hasFood={hasFood}
          />
        </div>
      </main>

      <footer className="footer">
        <p>
          红绿灯参考：绿色代表低热量高蔬果，黄色为适量摄入，红色提醒偶尔享用。素荤分类帮助平衡蛋白质与植物摄入。
          通过分类 + 转盘 + 记录的组合，让饮食决策更轻松。
        </p>
        <p className="footer-note">
          数据示例仅作参考，请结合个人状况调整。最后更新时间：{new Date().toLocaleDateString()}。
        </p>
      </footer>
      <FoodDetailModal food={detailFood} onClose={closeFoodDetail} />
    </div>
  );
}

export default App;
