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

type AppTab = 'catalog' | 'daily' | 'custom' | 'weekly' | 'records';

const tabs: { id: AppTab; label: string; hint: string }[] = [
  { id: 'catalog', label: '食材分类', hint: '按时令、日期和红绿灯筛选' },
  { id: 'daily', label: '每日推荐', hint: '按当前时令抽取今日菜品' },
  { id: 'custom', label: '随心转盘', hint: '勾选食材并自定义候选池' },
  { id: 'weekly', label: '一周菜谱', hint: '每日 3 道菜的一周搭配' },
  { id: 'records', label: '历史记录', hint: '查看、删除和调整顺序' }
];

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('catalog');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [now, setNow] = useState(() => new Date());
  const [records, setRecords] = useLocalStorage<SpinRecord[]>('spin-records', []);
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>('custom-selected-ids', defaultSelectedIds);
  const [customOptions, setCustomOptions] = useLocalStorage<SpinnerOption[]>('custom-options', []);
  const [detailFoodId, setDetailFoodId] = useState<string | null>(null);

  const currentSeason = useMemo(() => getCurrentSeason(now), [now]);
  const currentDateTag = useMemo<DateTag>(() => {
    const day = now.getDay();
    return day === 0 || day === 6 ? 'weekend' : 'weekday';
  }, [now]);

  const foodMap = useMemo(() => new Map(FOODS.map((food) => [food.id, food])), []);
  const detailFood = useMemo(() => (detailFoodId ? foodMap.get(detailFoodId) ?? null : null), [detailFoodId, foodMap]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const pushRecord = (option: SpinnerOption, source: SpinRecord['source']) => {
    const record: SpinRecord = {
      id: randomId(),
      option,
      source,
      timestamp: new Date().toISOString()
    };
    setRecords((prev) => [...prev, record]);
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const moveRecord = (id: string, direction: 'up' | 'down') => {
    setRecords((prev) => {
      const index = prev.findIndex((record) => record.id === id);
      if (index === -1) return prev;
      const swapIndex = direction === 'up' ? Math.max(index - 1, 0) : Math.min(index + 1, prev.length - 1);
      if (swapIndex === index) return prev;
      const updated = [...prev];
      [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
      return updated;
    });
  };

  const showFoodDetail = (id: string) => {
    if (foodMap.has(id)) {
      setDetailFoodId(id);
    }
  };

  const closeFoodDetail = () => setDetailFoodId(null);
  const hasFood = (id: string) => foodMap.has(id);

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
            <p>自定义候选：{selectedIds.length + customOptions.length} 项</p>
          </section>
        </aside>

        <section className="tab-content">
          {activeTab === 'catalog' && (
            <FoodCatalog foods={FOODS} filters={filters} onFilterChange={handleFilterChange} onSelectFood={showFoodDetail} />
          )}

          {activeTab === 'daily' && (
            <DailySpinner
              foods={FOODS}
              season={currentSeason}
              onResult={(option) => pushRecord(option, 'daily')}
              onInspectFood={showFoodDetail}
            />
          )}

          {activeTab === 'custom' && (
            <CustomSpinner
              foods={FOODS}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
              customOptions={customOptions}
              onCustomOptionsChange={setCustomOptions}
              onResult={(option) => pushRecord(option, 'custom')}
              onInspectFood={showFoodDetail}
            />
          )}

          {activeTab === 'weekly' && (
            <WeeklyPlanner foods={FOODS} season={currentSeason} onSelectFood={showFoodDetail} />
          )}

          {activeTab === 'records' && (
            <SpinRecordList
              records={records}
              onDelete={deleteRecord}
              onMove={moveRecord}
              onSelectFood={showFoodDetail}
              hasFood={hasFood}
            />
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          红绿灯帮助区分日常频率，页签帮助把功能拆开使用。你可以先筛食材，再切去每日推荐、自定义转盘、
          一周菜谱或历史记录。
        </p>
        <p className="footer-note">数据仅作示例参考，请结合个人饮食需求灵活调整。</p>
      </footer>

      <FoodDetailModal food={detailFood} onClose={closeFoodDetail} />
    </div>
  );
}

export default App;
