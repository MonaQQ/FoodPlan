import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { trafficColors, trafficLightLabels, typeLabels } from '../constants';
import { FoodItem, SpinnerOption } from '../types';
import { toSpinnerOption } from '../utils/food';
import { pickRandom } from '../utils/random';
import { randomId } from '../utils/id';

type CustomSpinnerProps = {
  foods: FoodItem[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  customOptions: SpinnerOption[];
  onCustomOptionsChange: (options: SpinnerOption[]) => void;
  onResult: (option: SpinnerOption) => void;
  onInspectFood: (id: string) => void;
};

export function CustomSpinner({
  foods,
  selectedIds,
  onSelectedIdsChange,
  customOptions,
  onCustomOptionsChange,
  onResult,
  onInspectFood
}: CustomSpinnerProps) {
  const [nameInput, setNameInput] = useState('');
  const [calorieInput, setCalorieInput] = useState('');
  const [randomCount, setRandomCount] = useState(3);
  const [randomPreview, setRandomPreview] = useState<SpinnerOption[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rollingLabel, setRollingLabel] = useState('勾选或自定义食材后即可转盘');
  const [lastResult, setLastResult] = useState<SpinnerOption | null>(null);
  const rollingTimer = useRef<number>();

  useEffect(() => {
    return () => {
      rollingTimer.current && window.clearInterval(rollingTimer.current);
    };
  }, []);

  const systemPool = useMemo(() => {
    return selectedIds
      .map((id) => foods.find((item) => item.id === id))
      .filter((item): item is FoodItem => Boolean(item))
      .map(toSpinnerOption);
  }, [foods, selectedIds]);

  const optionPool = useMemo(() => [...systemPool, ...customOptions], [systemPool, customOptions]);
  const foodMap = useMemo(() => new Map(foods.map((food) => [food.id, food])), [foods]);

  const toggleSystemFood = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectedIdsChange(selectedIds.filter((value) => value !== id));
    } else {
      onSelectedIdsChange([...selectedIds, id]);
    }
  };

  const handleAddCustomOption = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nameInput.trim()) return;
    const option: SpinnerOption = {
      id: randomId(),
      label: nameInput.trim(),
      calories: calorieInput ? Number(calorieInput) : undefined,
      origin: 'user'
    };
    onCustomOptionsChange([...customOptions, option]);
    setNameInput('');
    setCalorieInput('');
  };

  const handleRemoveCustom = (id: string) => {
    onCustomOptionsChange(customOptions.filter((item) => item.id !== id));
  };

  const handleSpin = () => {
    if (!optionPool.length || isSpinning) return;
    setIsSpinning(true);
    let ticks = 0;
    rollingTimer.current && window.clearInterval(rollingTimer.current);
    rollingTimer.current = window.setInterval(() => {
      const sample = pickRandom(optionPool);
      setRollingLabel(sample ? sample.label : '等待食材');
      ticks += 1;
      if (ticks >= 22) {
        rollingTimer.current && window.clearInterval(rollingTimer.current);
        const finalOption = pickRandom(optionPool);
        if (finalOption) {
          setLastResult(finalOption);
          setRollingLabel(`🎯 ${finalOption.label}`);
          onResult(finalOption);
        }
        setIsSpinning(false);
      }
    }, 85);
  };

  const handleRandomPreview = () => {
    const count = Math.max(1, Math.min(10, randomCount));
    const pool = foods.slice();
    const picked: SpinnerOption[] = [];
    const used = new Set<string>();
    while (picked.length < count && pool.length) {
      const sample = pickRandom(pool);
      if (!sample || used.has(sample.id)) continue;
      used.add(sample.id);
      picked.push(toSpinnerOption(sample));
    }
    setRandomPreview(picked);
  };

  const addPreviewToSelection = () => {
    if (!randomPreview.length) return;
    const ids = randomPreview.map((item) => item.id);
    const merged = Array.from(new Set([...selectedIds, ...ids]));
    onSelectedIdsChange(merged);
  };

  return (
    <section className="panel spinner-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">自定义</p>
          <h2>我的随心转盘</h2>
        </div>
        <p className="panel-description">
          自由勾选系统食材或录入家中现有食材，随机预览区还可一次生成多道菜，再加入候选。
        </p>
      </header>

      <div className="custom-builder">
        <div className="select-column">
          <label>从系统食材中勾选（不会互相影响）</label>
          <div className="option-list">
            {foods.map((food) => (
              <label key={food.id} className="option-row">
                <input type="checkbox" checked={selectedIds.includes(food.id)} onChange={() => toggleSystemFood(food.id)} />
                <span>
                  {food.name} · {typeLabels[food.type]} · {food.calories} kcal
                </span>
              </label>
            ))}
          </div>
        </div>

        <form className="input-column" onSubmit={handleAddCustomOption}>
          <label>自定义食材</label>
          <input
            type="text"
            placeholder="名称，如：口蘑炒豆干"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
          />
          <input
            type="number"
            min="0"
            placeholder="热量（可选）"
            value={calorieInput}
            onChange={(event) => setCalorieInput(event.target.value)}
          />
          <button className="secondary-btn" type="submit">
            添加到转盘
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
          <button className="secondary-btn" onClick={handleRandomPreview}>
            生成
          </button>
          <button className="ghost-link" onClick={addPreviewToSelection} disabled={!randomPreview.length}>
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
                <button className="ghost-link" onClick={() => onInspectFood(option.id)}>
                  查看
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="selected-pool">
        <p>
          当前候选 <strong>{optionPool.length}</strong> 道菜
        </p>
        <div className="selected-chips">
          {systemPool.map((option) => (
            <button key={option.id} className="chip ghost-chip" onClick={() => onInspectFood(option.id)}>
              {option.label}
            </button>
          ))}
          {customOptions.map((option) => (
            <button key={option.id} className="chip removable" onClick={() => handleRemoveCustom(option.id)}>
              {option.label} ✕
            </button>
          ))}
        </div>
      </div>

      <div className="spinner-wheel">
        <div className={`wheel ${isSpinning ? 'spinning' : ''}`}>
          <span>{rollingLabel}</span>
        </div>
        <button className="primary-btn" onClick={handleSpin} disabled={!optionPool.length || isSpinning}>
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
          {foodMap.has(lastResult.id) && (
            <button className="ghost-link" onClick={() => onInspectFood(lastResult.id)}>
              查看烹饪细节
            </button>
          )}
        </div>
      )}
    </section>
  );
}
