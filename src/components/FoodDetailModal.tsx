import { FormEvent, useEffect, useState } from 'react';
import { dateTagLabels, seasonLabels, trafficLightLabels, typeLabels } from '../constants';
import { FoodDetailDraft, FoodItem } from '../types';

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
  const [stepsText, setStepsText] = useState('');

  useEffect(() => {
    if (!food) return;
    setIsEditing(false);
    setIngredientsText(food.ingredients.join('\n'));
    setCookingMethod(food.cookingMethod);
    setStepsText(serializeSteps(food.cookingSteps));
  }, [food]);

  if (!food) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ingredients = splitLines(ingredientsText);
    const steps = parseSteps(stepsText, cookingMethod);
    onSave(food.id, {
      ingredients,
      cookingMethod: cookingMethod.trim() || '按个人习惯烹饪。',
      cookingSteps: steps
    });
    setIsEditing(false);
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

            <section className="modal-section">
              <h4>所需食材</h4>
              {isEditing ? (
                <textarea
                  rows={5}
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
                    rows={4}
                    value={cookingMethod}
                    onChange={(event) => setCookingMethod(event.target.value)}
                    placeholder="描述整体做法"
                  />
                  <textarea
                    rows={6}
                    value={stepsText}
                    onChange={(event) => setStepsText(event.target.value)}
                    placeholder="步骤格式：步骤名|时长|说明"
                  />
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

function serializeSteps(steps: FoodItem['cookingSteps']) {
  if (!steps.length) return '';
  return steps.map((step) => `${step.title}|${step.duration}|${step.detail}`).join('\n');
}

function parseSteps(value: string, fallbackMethod: string) {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [
      {
        title: '烹饪步骤',
        duration: '按需',
        detail: fallbackMethod.trim() || '按个人习惯烹饪。'
      }
    ];
  }

  return lines.map((line, index) => {
    const [title, duration, detail] = line.split('|').map((item) => item?.trim());
    return {
      title: title || `步骤 ${index + 1}`,
      duration: duration || '按需',
      detail: detail || title || fallbackMethod || '按个人习惯烹饪。'
    };
  });
}
