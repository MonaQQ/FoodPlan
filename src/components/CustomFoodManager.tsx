import { FormEvent, useMemo, useState } from 'react';
import { seasonLabels, trafficLightLabels, typeLabels } from '../constants';
import { CookingStep, CustomFoodItem, FoodNature, Season, TrafficLight } from '../types';
import { randomId } from '../utils/id';

type CustomFoodManagerProps = {
  foods: CustomFoodItem[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onSaveFood: (food: CustomFoodItem) => void;
  onDeleteFood: (id: string) => void;
  onSelectFood: (id: string) => void;
};

type CustomFoodFormState = {
  id: string | null;
  name: string;
  calories: string;
  ingredients: string;
  cookingMethod: string;
  cookingSteps: CookingStep[];
  nutrients: string;
  description: string;
  bestTime: string;
  type: FoodNature;
  trafficLight: TrafficLight;
  seasons: Season[];
};

const initialFormState: CustomFoodFormState = {
  id: null,
  name: '',
  calories: '',
  ingredients: '',
  cookingMethod: '',
  cookingSteps: [createEmptyStep(1)],
  nutrients: '',
  description: '',
  bestTime: '',
  type: 'vegetarian',
  trafficLight: 'yellow',
  seasons: []
};

export function CustomFoodManager({
  foods,
  selectedIds,
  onSelectedIdsChange,
  onSaveFood,
  onDeleteFood,
  onSelectFood
}: CustomFoodManagerProps) {
  const [form, setForm] = useState<CustomFoodFormState>(initialFormState);
  const [savedFoodSearch, setSavedFoodSearch] = useState('');

  const savedCountText = useMemo(() => `已保存 ${foods.length} 道自定义菜`, [foods.length]);
  const filteredFoods = useMemo(() => filterFoodsByName(foods, savedFoodSearch), [foods, savedFoodSearch]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const ingredients = splitItems(form.ingredients);
    const nutrients = splitItems(form.nutrients);
    const resolvedSeasons: Season[] = form.seasons.length ? form.seasons : ['spring', 'summer', 'autumn', 'winter'];
    const cookingMethod = form.cookingMethod.trim() || '按个人习惯烹饪即可。';
    const cookingSteps = normalizeSteps(form.cookingSteps, cookingMethod);

    const nextFood: CustomFoodItem = {
      id: form.id ?? randomId(),
      origin: 'user',
      name: form.name.trim(),
      calories: form.calories ? Number(form.calories) : 0,
      trafficLight: form.trafficLight,
      type: form.type,
      seasons: resolvedSeasons,
      dateTags: ['weekday', 'weekend', 'festival'],
      description: form.description.trim() || '自定义菜品，可按自己的口味持续调整。',
      nutrients,
      ingredients,
      cookingMethod,
      bestTime: form.bestTime.trim() || '任意时段',
      cookingSteps
    };

    onSaveFood(nextFood);
    setForm(initialFormState);
  };

  const startEditing = (food: CustomFoodItem) => {
    setForm({
      id: food.id,
      name: food.name,
      calories: food.calories ? String(food.calories) : '',
      ingredients: food.ingredients.join('\n'),
      cookingMethod: food.cookingMethod,
      cookingSteps: food.cookingSteps.length ? food.cookingSteps : [createEmptyStep(1)],
      nutrients: food.nutrients.join('\n'),
      description: food.description,
      bestTime: food.bestTime,
      type: food.type,
      trafficLight: food.trafficLight,
      seasons: food.seasons
    });
  };

  const resetForm = () => setForm(initialFormState);

  const toggleSeason = (season: Season) => {
    setForm((prev) => ({
      ...prev,
      seasons: prev.seasons.includes(season) ? prev.seasons.filter((item) => item !== season) : [...prev.seasons, season]
    }));
  };

  const updateStep = (index: number, key: keyof CookingStep, value: string) => {
    setForm((prev) => ({
      ...prev,
      cookingSteps: prev.cookingSteps.map((step, stepIndex) => (stepIndex === index ? { ...step, [key]: value } : step))
    }));
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      cookingSteps: [...prev.cookingSteps, createEmptyStep(prev.cookingSteps.length + 1)]
    }));
  };

  const removeStep = (index: number) => {
    setForm((prev) => ({
      ...prev,
      cookingSteps: prev.cookingSteps.length <= 1 ? [createEmptyStep(1)] : prev.cookingSteps.filter((_, stepIndex) => stepIndex !== index)
    }));
  };

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">自定义菜品</p>
          <h2>保存自己的菜谱</h2>
        </div>
        <p className="panel-description">支持保存自定义菜，烹饪方式也改成分步骤编辑，删除时会再次确认。</p>
      </header>

      <div className="custom-builder">
        <form className="input-column custom-food-form" onSubmit={handleSubmit}>
          <label>菜名</label>
          <input type="text" placeholder="如：番茄蘑菇汤" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />

          <div className="form-grid">
            <label>
              热量
              <input type="number" min="0" placeholder="可选" value={form.calories} onChange={(event) => setForm((prev) => ({ ...prev, calories: event.target.value }))} />
            </label>
            <label>
              最佳时间
              <input type="text" placeholder="如：晚餐" value={form.bestTime} onChange={(event) => setForm((prev) => ({ ...prev, bestTime: event.target.value }))} />
            </label>
          </div>

          <div className="form-grid">
            <label>
              分类
              <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as FoodNature }))}>
                <option value="vegetarian">素食</option>
                <option value="meat">荤食</option>
                <option value="soup">汤品</option>
                <option value="staple">主食</option>
              </select>
            </label>
            <label>
              红绿灯
              <select value={form.trafficLight} onChange={(event) => setForm((prev) => ({ ...prev, trafficLight: event.target.value as TrafficLight }))}>
                <option value="green">绿色，可常吃</option>
                <option value="yellow">黄色，适量吃</option>
                <option value="red">红色，偶尔吃</option>
              </select>
            </label>
          </div>

          <label>菜品描述</label>
          <textarea rows={3} placeholder="可选，写一句这道菜的特点" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />

          <label>所需食材</label>
          <textarea rows={4} placeholder="每行一个，或用逗号分隔" value={form.ingredients} onChange={(event) => setForm((prev) => ({ ...prev, ingredients: event.target.value }))} />

          <label>烹饪方式总说明</label>
          <textarea rows={4} placeholder="先写一段整体说明，比如：先炒香番茄，再加入菌菇煮 10 分钟。" value={form.cookingMethod} onChange={(event) => setForm((prev) => ({ ...prev, cookingMethod: event.target.value }))} />

          <div className="step-editor-list">
            {form.cookingSteps.map((step, index) => (
              <div key={`custom-step-${index}`} className="step-editor-card">
                <div className="step-editor-top">
                  <strong>步骤 {index + 1}</strong>
                  <button className="ghost-link danger-link" type="button" onClick={() => removeStep(index)}>
                    删除
                  </button>
                </div>
                <div className="form-grid">
                  <label>
                    步骤名
                    <input type="text" value={step.title} onChange={(event) => updateStep(index, 'title', event.target.value)} placeholder={`步骤 ${index + 1}`} />
                  </label>
                  <label>
                    时长
                    <input type="text" value={step.duration} onChange={(event) => updateStep(index, 'duration', event.target.value)} placeholder="如：5分钟" />
                  </label>
                </div>
                <label className="step-editor-detail">
                  说明
                  <textarea rows={3} value={step.detail} onChange={(event) => updateStep(index, 'detail', event.target.value)} placeholder="写这一步具体怎么做" />
                </label>
              </div>
            ))}
          </div>

          <div className="step-add-row">
            <button className="secondary-btn small" type="button" onClick={addStep}>
              新增步骤
            </button>
          </div>

          <label>营养亮点</label>
          <textarea rows={3} placeholder="可选，每行一个，或用逗号分隔" value={form.nutrients} onChange={(event) => setForm((prev) => ({ ...prev, nutrients: event.target.value }))} />

          <div className="season-picker">
            <span>适合时令</span>
            <div className="season-picker-options">
              {(Object.keys(seasonLabels) as Season[]).map((season) => (
                <label key={season} className="season-option">
                  <input type="checkbox" checked={form.seasons.includes(season)} onChange={() => toggleSeason(season)} />
                  {seasonLabels[season]}
                </label>
              ))}
            </div>
            <small>不勾选时默认四季都可用。</small>
          </div>

          <div className="form-actions">
            <button className="primary-btn" type="submit">
              {form.id ? '保存修改' : '保存自定义菜'}
            </button>
            {form.id && (
              <button className="secondary-btn" type="button" onClick={resetForm}>
                取消编辑
              </button>
            )}
          </div>
        </form>

        <div className="select-column">
          <div className="saved-food-summary">
            <strong>{savedCountText}</strong>
            <span>勾选状态只影响随心转盘，不会删除菜品。</span>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="搜索已保存的自定义菜"
            value={savedFoodSearch}
            onChange={(event) => setSavedFoodSearch(event.target.value)}
          />

          <div className="option-list custom-saved-list">
            {filteredFoods.length === 0 && <p className="empty-hint">{foods.length ? '没有找到匹配的自定义菜。' : '还没有保存自定义菜，先录入一道吧。'}</p>}

            {filteredFoods.map((food) => (
              <article key={food.id} className="saved-food-card">
                <div className="saved-food-top">
                  <label className="option-row">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(food.id)}
                      onChange={() =>
                        onSelectedIdsChange(selectedIds.includes(food.id) ? selectedIds.filter((item) => item !== food.id) : [...selectedIds, food.id])
                      }
                    />
                    <span>{food.name}</span>
                  </label>
                  <span className="mini-tag">{typeLabels[food.type]}</span>
                </div>
                <p className="food-description">{food.description}</p>
                <div className="food-tags">
                  <span className="tag-chip" style={{ backgroundColor: 'rgba(2,132,199,0.12)', color: '#0369a1' }}>
                    {food.seasons.map((season) => seasonLabels[season]).join(' · ')}
                  </span>
                  <span className="tag-chip" style={{ backgroundColor: 'rgba(245,158,11,0.14)', color: '#b45309' }}>
                    {trafficLightLabels[food.trafficLight]}
                  </span>
                </div>
                <div className="saved-food-actions">
                  <button className="ghost-link" type="button" onClick={() => onSelectFood(food.id)}>
                    查看详情
                  </button>
                  <button className="ghost-link" type="button" onClick={() => startEditing(food)}>
                    编辑
                  </button>
                  <button
                    className="ghost-link danger-link"
                    type="button"
                    onClick={() => {
                      if (window.confirm(`确认删除“${food.name}”吗？此操作不会恢复。`)) {
                        onDeleteFood(food.id);
                        if (form.id === food.id) resetForm();
                      }
                    }}
                  >
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function splitItems(value: string) {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSteps(steps: CookingStep[], fallbackMethod: string) {
  const filtered = steps
    .map((step, index) => ({
      title: step.title.trim() || `步骤 ${index + 1}`,
      duration: step.duration.trim() || '按需',
      detail: step.detail.trim()
    }))
    .filter((step) => step.title || step.detail);

  if (!filtered.length) {
    return [
      {
        title: '烹饪步骤',
        duration: '按需',
        detail: fallbackMethod.trim() || '按个人习惯烹饪。'
      }
    ];
  }

  return filtered.map((step, index) => ({
    title: step.title || `步骤 ${index + 1}`,
    duration: step.duration || '按需',
    detail: step.detail || fallbackMethod || '按个人习惯烹饪。'
  }));
}

function createEmptyStep(index: number): CookingStep {
  return {
    title: `步骤 ${index}`,
    duration: '',
    detail: ''
  };
}

function filterFoodsByName<T extends { name: string }>(foods: T[], keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return foods;
  return foods.filter((food) => food.name.toLowerCase().includes(normalized));
}
