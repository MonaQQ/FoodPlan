import { useEffect, useMemo, useRef, useState } from 'react';
import { typeLabels } from '../constants';
import { CustomFoodItem, FoodItem, SpinnerOption } from '../types';
import { toSpinnerOption } from '../utils/food';
import { pickRandom } from '../utils/random';

type CustomSpinnerProps = {
  systemFoods: FoodItem[];
  customFoods: CustomFoodItem[];
  selectedSystemIds: string[];
  selectedCustomIds: string[];
  onSelectedSystemIdsChange: (ids: string[]) => void;
  onSelectedCustomIdsChange: (ids: string[]) => void;
  onResult: (option: SpinnerOption) => void;
  onInspectFood: (id: string) => void;
};

export function CustomSpinner({
  systemFoods,
  customFoods,
  selectedSystemIds,
  selectedCustomIds,
  onSelectedSystemIdsChange,
  onSelectedCustomIdsChange,
  onResult,
  onInspectFood
}: CustomSpinnerProps) {
  const [randomCount, setRandomCount] = useState(3);
  const [randomPreview, setRandomPreview] = useState<SpinnerOption[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rollingLabel, setRollingLabel] = useState('勾选候选菜品后即可开始转盘');
  const [lastResult, setLastResult] = useState<SpinnerOption | null>(null);
  const rollingTimer = useRef<number>();

  useEffect(() => {
    return () => {
      if (rollingTimer.current) {
        window.clearInterval(rollingTimer.current);
      }
    };
  }, []);

  const foodMap = useMemo(() => new Map([...systemFoods, ...customFoods].map((food) => [food.id, food])), [customFoods, systemFoods]);
  const favoriteSystemFoodIds = useMemo(
    () => systemFoods.filter((food) => food.isFavorite).map((food) => food.id),
    [systemFoods]
  );

  const systemPool = useMemo(
    () =>
      selectedSystemIds
        .map((id) => systemFoods.find((item) => item.id === id))
        .filter((item): item is FoodItem => Boolean(item))
        .map(toSpinnerOption),
    [selectedSystemIds, systemFoods]
  );

  const customPool = useMemo(
    () =>
      selectedCustomIds
        .map((id) => customFoods.find((item) => item.id === id))
        .filter((item): item is CustomFoodItem => Boolean(item))
        .map(toSpinnerOption),
    [customFoods, selectedCustomIds]
  );

  const optionPool = useMemo(() => [...systemPool, ...customPool], [systemPool, customPool]);

  const toggleSystemFood = (id: string) => {
    onSelectedSystemIdsChange(
      selectedSystemIds.includes(id) ? selectedSystemIds.filter((value) => value !== id) : [...selectedSystemIds, id]
    );
  };

  const toggleCustomFood = (id: string) => {
    onSelectedCustomIdsChange(
      selectedCustomIds.includes(id) ? selectedCustomIds.filter((value) => value !== id) : [...selectedCustomIds, id]
    );
  };

  const clearCandidates = () => {
    onSelectedSystemIdsChange([]);
    onSelectedCustomIdsChange([]);
    setRandomPreview([]);
    setLastResult(null);
    setRollingLabel('候选已清空，请重新勾选菜品');
  };

  const handleSpin = () => {
    if (!optionPool.length || isSpinning) return;
    setIsSpinning(true);
    let ticks = 0;
    if (rollingTimer.current) {
      window.clearInterval(rollingTimer.current);
    }
    rollingTimer.current = window.setInterval(() => {
      const sample = pickRandom(optionPool);
      setRollingLabel(sample ? sample.label : '等待候选菜品');
      ticks += 1;
      if (ticks >= 22) {
        if (rollingTimer.current) {
          window.clearInterval(rollingTimer.current);
        }
        const finalOption = pickRandom(optionPool);
        if (finalOption) {
          setLastResult(finalOption);
          setRollingLabel(`选中：${finalOption.label}`);
          onResult(finalOption);
        }
        setIsSpinning(false);
      }
    }, 85);
  };

  const handleRandomPreview = () => {
    const count = Math.max(1, Math.min(10, randomCount || 1));
    const allFoods = [...systemFoods, ...customFoods];
    const picked: SpinnerOption[] = [];
    const used = new Set<string>();

    while (picked.length < count && used.size < allFoods.length) {
      const sample = pickRandom(allFoods);
      if (!sample || used.has(sample.id)) continue;
      used.add(sample.id);
      picked.push(toSpinnerOption(sample));
    }

    setRandomPreview(picked);
  };

  const addPreviewToSelection = () => {
    if (!randomPreview.length) return;
    const nextSystemIds = new Set(selectedSystemIds);
    const nextCustomIds = new Set(selectedCustomIds);

    randomPreview.forEach((item) => {
      if (item.origin === 'user') {
        nextCustomIds.add(item.id);
      } else {
        nextSystemIds.add(item.id);
      }
    });

    onSelectedSystemIdsChange(Array.from(nextSystemIds));
    onSelectedCustomIdsChange(Array.from(nextCustomIds));
  };

  return (
    <section className="panel spinner-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">随心转盘</p>
          <h2>我的随心转盘</h2>
        </div>
        <p className="panel-description">现在候选池同时支持系统菜和自定义菜，移出候选只会取消参与转盘，不会删除自定义菜记录。</p>
      </header>

      <div className="custom-builder spinner-selector-grid">
        <div className="select-column">
          <label>系统菜品</label>
          <div className="bulk-actions">
            <button className="secondary-btn small" type="button" onClick={() => onSelectedSystemIdsChange(systemFoods.map((food) => food.id))}>
              一键全选
            </button>
            <button className="secondary-btn small" type="button" onClick={() => onSelectedSystemIdsChange(favoriteSystemFoodIds)}>
              一键全选心动菜单
            </button>
          </div>
          <div className="option-list">
            {systemFoods.map((food) => (
              <label key={food.id} className="option-row">
                <input type="checkbox" checked={selectedSystemIds.includes(food.id)} onChange={() => toggleSystemFood(food.id)} />
                <span>
                  {food.name}
                  {food.isFavorite ? ' · 心动' : ''}
                  {' · '}
                  {typeLabels[food.type]}
                  {' · '}
                  {food.calories} kcal
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="select-column">
          <label>自定义菜品</label>
          <div className="bulk-actions">
            <button className="secondary-btn small" type="button" onClick={() => onSelectedCustomIdsChange(customFoods.map((food) => food.id))}>
              一键全选
            </button>
            <span className="candidate-hint">已保存 {customFoods.length} 道</span>
          </div>
          <div className="option-list">
            {customFoods.length === 0 ? (
              <p className="empty-hint">还没有保存自定义菜，请先去“自定义菜品”页签添加。</p>
            ) : (
              customFoods.map((food) => (
                <label key={food.id} className="option-row">
                  <input type="checkbox" checked={selectedCustomIds.includes(food.id)} onChange={() => toggleCustomFood(food.id)} />
                  <span>
                    {food.name} · {typeLabels[food.type]} · {food.calories} kcal
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="random-preview-panel">
        <div className="random-controls">
          <label>
            随机生成
            <input
              type="number"
              min="1"
              max="10"
              value={randomCount}
              onChange={(event) => setRandomCount(Number(event.target.value))}
            />
            道菜
          </label>
          <button className="secondary-btn" type="button" onClick={handleRandomPreview}>
            生成
          </button>
          <button className="ghost-link" type="button" onClick={addPreviewToSelection} disabled={!randomPreview.length}>
            全部加入候选
          </button>
        </div>
        {randomPreview.length > 0 && (
          <div className="random-results">
            {randomPreview.map((option) => (
              <div key={option.id} className="candidate-item">
                <div>
                  <strong>{option.label}</strong>
                  <span className="candidate-calorie">{option.calories ?? '--'} kcal</span>
                  {option.origin === 'user' && <span className="inline-favorite">自定义</span>}
                </div>
                <button className="ghost-link" type="button" onClick={() => onInspectFood(option.id)}>
                  查看
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="selected-pool">
        <div className="selected-header">
          <p>
            当前候选 <strong>{optionPool.length}</strong> 道菜
          </p>
          <button className="ghost-link danger-link" type="button" onClick={clearCandidates} disabled={!optionPool.length}>
            一键清除
          </button>
        </div>
        <div className="selected-chips">
          {optionPool.map((option) => (
            <button
              key={option.id}
              className={`chip removable ${option.origin === 'user' ? 'custom-chip' : 'ghost-chip'}`}
              type="button"
              onClick={() => {
                if (option.origin === 'user') {
                  toggleCustomFood(option.id);
                } else {
                  toggleSystemFood(option.id);
                }
              }}
            >
              {option.label} ×
            </button>
          ))}
        </div>
      </div>

      <div className="spinner-wheel">
        <div className={`wheel ${isSpinning ? 'spinning' : ''}`}>
          <span>{rollingLabel}</span>
        </div>
        <button className="primary-btn" type="button" onClick={handleSpin} disabled={!optionPool.length || isSpinning}>
          {isSpinning ? '选择中…' : '开始转盘'}
        </button>
      </div>

      {lastResult && (
        <div className="result-card">
          <h3>转盘结果：{lastResult.label}</h3>
          <p>
            来源：{lastResult.origin === 'user' ? '自定义菜品' : '系统菜品'} · 热量：
            <strong>{lastResult.calories ?? '--'} kcal</strong>
          </p>
          {foodMap.has(lastResult.id) && (
            <button className="ghost-link" type="button" onClick={() => onInspectFood(lastResult.id)}>
              查看烹饪细节
            </button>
          )}
        </div>
      )}
    </section>
  );
}
