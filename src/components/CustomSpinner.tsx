import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { typeLabels } from '../constants';
import { CustomFoodItem, FoodItem, SpinnerOption } from '../types';
import { toSpinnerOption } from '../utils/food';
import { pickRandom } from '../utils/random';
import { randomId } from '../utils/id';

type CustomSpinnerProps = {
  foods: FoodItem[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  customFoods: CustomFoodItem[];
  onCustomFoodsChange: (foods: CustomFoodItem[]) => void;
  onResult: (option: SpinnerOption) => void;
  onInspectFood: (id: string) => void;
};

export function CustomSpinner({
  foods,
  selectedIds,
  onSelectedIdsChange,
  customFoods,
  onCustomFoodsChange,
  onResult,
  onInspectFood
}: CustomSpinnerProps) {
  const [form, setForm] = useState({
    name: '',
    calories: '',
    ingredients: '',
    cookingMethod: ''
  });
  const [randomCount, setRandomCount] = useState(3);
  const [randomPreview, setRandomPreview] = useState<SpinnerOption[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rollingLabel, setRollingLabel] = useState('勾选或新增食材后即可开始转盘');
  const [lastResult, setLastResult] = useState<SpinnerOption | null>(null);
  const rollingTimer = useRef<number>();

  useEffect(() => {
    return () => {
      if (rollingTimer.current) {
        window.clearInterval(rollingTimer.current);
      }
    };
  }, []);

  const systemFoods = useMemo(() => foods.filter((food) => !('origin' in food && food.origin === 'user')), [foods]);
  const favoriteSystemFoodIds = useMemo(
    () => systemFoods.filter((food) => food.isFavorite).map((food) => food.id),
    [systemFoods]
  );

  const systemPool = useMemo(() => {
    return selectedIds
      .map((id) => foods.find((item) => item.id === id))
      .filter((item): item is FoodItem => Boolean(item))
      .map(toSpinnerOption);
  }, [foods, selectedIds]);

  const customPool = useMemo(() => customFoods.map(toSpinnerOption), [customFoods]);
  const optionPool = useMemo(() => [...systemPool, ...customPool], [systemPool, customPool]);
  const foodMap = useMemo(() => new Map(foods.map((food) => [food.id, food])), [foods]);

  const toggleSystemFood = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((value) => value !== id));
      return;
    }
    onSelectedIdsChange([...selectedIds, id]);
  };

  const selectAllSystemFoods = () => {
    onSelectedIdsChange(systemFoods.map((food) => food.id));
  };

  const selectAllFavoriteFoods = () => {
    onSelectedIdsChange(favoriteSystemFoodIds);
  };

  const clearCandidates = () => {
    onSelectedIdsChange([]);
    onCustomFoodsChange([]);
    setRandomPreview([]);
    setLastResult(null);
    setRollingLabel('候选已清空，请重新选择食材');
  };

  const handleAddCustomFood = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const ingredients = splitTextarea(form.ingredients);
    const cookingMethod = form.cookingMethod.trim() || '按个人喜好烹饪即可。';

    const nextFood: CustomFoodItem = {
      id: randomId(),
      origin: 'user',
      name: form.name.trim(),
      calories: form.calories ? Number(form.calories) : 0,
      trafficLight: 'yellow',
      type: 'vegetarian',
      seasons: ['spring', 'summer', 'autumn', 'winter'],
      dateTags: ['weekday', 'weekend', 'festival'],
      description: '自定义录入菜品，可在详情中继续补充和修改。',
      nutrients: ingredients.slice(0, 3),
      ingredients,
      cookingMethod,
      bestTime: '任意时段',
      cookingSteps: [
        {
          title: '自定义做法',
          duration: '按需',
          detail: cookingMethod
        }
      ],
      isFavorite: false
    };

    onCustomFoodsChange([...customFoods, nextFood]);
    setForm({
      name: '',
      calories: '',
      ingredients: '',
      cookingMethod: ''
    });
  };

  const handleRemoveCustom = (id: string) => {
    onCustomFoodsChange(customFoods.filter((item) => item.id !== id));
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
      setRollingLabel(sample ? sample.label : '等待食材');
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
    const pool = systemFoods.slice();
    const picked: SpinnerOption[] = [];
    const used = new Set<string>();

    while (picked.length < count && used.size < pool.length) {
      const sample = pickRandom(pool);
      if (!sample || used.has(sample.id)) continue;
      used.add(sample.id);
      picked.push(toSpinnerOption(sample));
    }

    setRandomPreview(picked);
  };

  const addPreviewToSelection = () => {
    if (!randomPreview.length) return;
    const merged = Array.from(new Set([...selectedIds, ...randomPreview.map((item) => item.id)]));
    onSelectedIdsChange(merged);
  };

  return (
    <section className="panel spinner-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">自定义</p>
          <h2>我的随心转盘</h2>
        </div>
        <p className="panel-description">支持一键全选、一键全选心动菜单，以及清空当前候选池。</p>
      </header>

      <div className="custom-builder">
        <div className="select-column">
          <label>从系统菜品中勾选</label>
          <div className="bulk-actions">
            <button className="secondary-btn small" type="button" onClick={selectAllSystemFoods}>
              一键全选
            </button>
            <button className="secondary-btn small" type="button" onClick={selectAllFavoriteFoods}>
              一键全选心动菜单
            </button>
          </div>
          <div className="option-list">
            {systemFoods.map((food) => (
              <label key={food.id} className="option-row">
                <input type="checkbox" checked={selectedIds.includes(food.id)} onChange={() => toggleSystemFood(food.id)} />
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

        <form className="input-column custom-food-form" onSubmit={handleAddCustomFood}>
          <label>新增自定义菜品</label>
          <input
            type="text"
            placeholder="菜名，如：香煎杏鲍菇"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            type="number"
            min="0"
            placeholder="热量（可选）"
            value={form.calories}
            onChange={(event) => setForm((prev) => ({ ...prev, calories: event.target.value }))}
          />
          <textarea
            rows={3}
            placeholder="所需食材，逗号或换行分隔"
            value={form.ingredients}
            onChange={(event) => setForm((prev) => ({ ...prev, ingredients: event.target.value }))}
          />
          <textarea
            rows={4}
            placeholder="烹饪方式，如：先煎后焖 8 分钟"
            value={form.cookingMethod}
            onChange={(event) => setForm((prev) => ({ ...prev, cookingMethod: event.target.value }))}
          />
          <button className="secondary-btn" type="submit">
            添加到候选池
          </button>
        </form>
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
          {systemPool.map((option) => (
            <button key={option.id} className="chip ghost-chip" type="button" onClick={() => onInspectFood(option.id)}>
              {option.label}
            </button>
          ))}
          {customFoods.map((food) => (
            <button key={food.id} className="chip removable" type="button" onClick={() => handleRemoveCustom(food.id)}>
              {food.name} ×
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
            来源：{lastResult.origin === 'user' ? '自定义' : '系统'} · 热量：
            <strong>{lastResult.calories ?? '--'} kcal</strong>
          </p>
          {(foodMap.has(lastResult.id) || customFoods.some((food) => food.id === lastResult.id)) && (
            <button className="ghost-link" type="button" onClick={() => onInspectFood(lastResult.id)}>
              查看烹饪细节
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function splitTextarea(value: string) {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
