import { FormEvent, useEffect, useState } from 'react';
import { dateTagLabels, seasonLabels, trafficLightLabels, typeLabels } from '../constants';
import { CookingStep, FoodDetailDraft, FoodItem } from '../types';

type FoodDetailModalProps = {
  food: FoodItem | null;
  onClose: () => void;
  onSave: (id: string, draft: FoodDetailDraft) => void;
  onToggleFavorite: (id: string) => void;
  allowEdit?: boolean;
};

export function FoodDetailModal({ food, onClose, onSave, onToggleFavorite, allowEdit = true }: FoodDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [ingredientsText, setIngredientsText] = useState('');
  const [cookingMethod, setCookingMethod] = useState('');
  const [steps, setSteps] = useState<CookingStep[]>([]);

  useEffect(() => {
    if (!food) return;
    setIsEditing(false);
    setIngredientsText(food.ingredients.join('\n'));
    setCookingMethod(food.cookingMethod);
    setSteps(food.cookingSteps.length ? food.cookingSteps : [createEmptyStep(1)]);
  }, [food]);

  if (!food) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ingredients = splitLines(ingredientsText);
    const normalizedSteps = normalizeSteps(steps, cookingMethod);
    onSave(food.id, {
      ingredients,
      cookingMethod: cookingMethod.trim() || '按个人习惯烹饪。',
      cookingSteps: normalizedSteps
    });
    setIsEditing(false);
  };

  const updateStep = (index: number, key: keyof CookingStep, value: string) => {
    setSteps((prev) => prev.map((step, stepIndex) => (stepIndex === index ? { ...step, [key]: value } : step)));
  };

  const addStep = () => {
    setSteps((prev) => [...prev, createEmptyStep(prev.length + 1)]);
  };

  const removeStep = (index: number) => {
    setSteps((prev) => {
      if (prev.length <= 1) return [createEmptyStep(1)];
      return prev.filter((_, stepIndex) => stepIndex !== index);
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>
        <p className="eyebrow">食材详情</p>
        <div className="modal-title-row">
          <h3>{food.name}</h3>
          <button
            type="button"
            className={`favorite-toggle ${food.isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(food.id)}
          >
            {food.isFavorite ? '♥ 已心动' : '♡ 标记心动'}
          </button>
        </div>
        <p className="modal-subtitle">{food.description}</p>

        <div className="modal-tags">
          <span>{seasonLabels[food.seasons[0]]}</span>
          <span>{dateTagLabels[food.dateTags[0]]}</span>
          <span>{trafficLightLabels[food.trafficLight]}</span>
          <span>{typeLabels[food.type]}</span>
        </div>

        <dl className="modal-info">
          <div>
            <dt>热量</dt>
            <dd>{food.calories} kcal / 100g</dd>
          </div>
          <div>
            <dt>营养亮点</dt>
            <dd>{food.nutrients.join(' · ') || '可自行补充'}</dd>
          </div>
          <div>
            <dt>最佳时间</dt>
            <dd>{food.bestTime}</dd>
          </div>
        </dl>

        {allowEdit ? (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-form-actions">
              <button className="secondary-btn" type="button" onClick={() => setIsEditing((prev) => !prev)}>
                {isEditing ? '取消编辑' : '编辑做法与食材'}
              </button>
              {isEditing && (
                <button className="primary-btn" type="submit">
                  保存修改
                </button>
              )}
            </div>

            <div className="modal-content-scroll">
              <section className="modal-section">
                <h4>所需食材</h4>
                {isEditing ? (
                  <textarea
                    rows={8}
                    value={ingredientsText}
                    onChange={(event) => setIngredientsText(event.target.value)}
                    placeholder="每行一个食材，或用逗号分隔"
                  />
                ) : (
                  <ul>
                    {food.ingredients.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="modal-section">
                <h4>烹饪方式</h4>
                {isEditing ? (
                  <>
                    <textarea
                      rows={5}
                      value={cookingMethod}
                      onChange={(event) => setCookingMethod(event.target.value)}
                      placeholder="先写一段整体说明，比如：先炒香番茄，再加入菌菇煮 10 分钟。"
                    />

                    <div className="step-editor-list">
                      {steps.map((step, index) => (
                        <div key={`step-${index}`} className="step-editor-card">
                          <div className="step-editor-top">
                            <strong>步骤 {index + 1}</strong>
                            <button className="ghost-link danger-link" type="button" onClick={() => removeStep(index)}>
                              删除
                            </button>
                          </div>
                          <div className="form-grid">
                            <label>
                              步骤名
                              <input
                                type="text"
                                value={step.title}
                                onChange={(event) => updateStep(index, 'title', event.target.value)}
                                placeholder={`步骤 ${index + 1}`}
                              />
                            </label>
                            <label>
                              时长
                              <input
                                type="text"
                                value={step.duration}
                                onChange={(event) => updateStep(index, 'duration', event.target.value)}
                                placeholder="如：5分钟"
                              />
                            </label>
                          </div>
                          <label className="step-editor-detail">
                            说明
                            <textarea
                              rows={3}
                              value={step.detail}
                              onChange={(event) => updateStep(index, 'detail', event.target.value)}
                              placeholder="写这一步具体怎么做"
                            />
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="step-add-row">
                      <button className="secondary-btn small" type="button" onClick={addStep}>
                        新增步骤
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{food.cookingMethod}</p>
                    <ol className="cooking-step-list">
                      {food.cookingSteps.map((step) => (
                        <li key={`${step.title}-${step.duration}`}>
                          <div className="step-title">
                            {step.title} · <span>{step.duration}</span>
                          </div>
                          <p>{step.detail}</p>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </section>
            </div>
          </form>
        ) : null}
      </article>
    </div>
  );
}

function splitLines(value: string) {
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
