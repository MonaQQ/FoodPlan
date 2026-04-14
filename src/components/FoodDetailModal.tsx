import { dateTagLabels, seasonLabels, trafficLightLabels, typeLabels } from '../constants';
import { FoodItem } from '../types';

type FoodDetailModalProps = {
  food: FoodItem | null;
  onClose: () => void;
};

export function FoodDetailModal({ food, onClose }: FoodDetailModalProps) {
  if (!food) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>
        <p className="eyebrow">食材详情</p>
        <h3>{food.name}</h3>
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
            <dd>{food.nutrients.join(' · ')}</dd>
          </div>
          <div>
            <dt>最佳享用时间</dt>
            <dd>{food.bestTime}</dd>
          </div>
        </dl>

        <section className="modal-section">
          <h4>所需食材</h4>
          <ul>
            {food.ingredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="modal-section">
          <h4>烹饪方式</h4>
          <p>{food.cookingMethod}</p>
          <ol className="cooking-step-list">
            {food.cookingSteps.map((step) => (
              <li key={step.title}>
                <div className="step-title">
                  {step.title} · <span>{step.duration}</span>
                </div>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </div>
  );
}
