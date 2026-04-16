import { trafficColors, trafficLightLabels, typeLabels } from '../constants';
import { FoodItem } from '../types';

type FavoriteMenuProps = {
  foods: FoodItem[];
  onSelectFood: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function FavoriteMenu({ foods, onSelectFood, onToggleFavorite }: FavoriteMenuProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">心动菜单</p>
          <h2>已标记的心动菜品</h2>
        </div>
        <p className="panel-description">这里集中展示你收藏的菜，方便直接查看详情或取消心动标记。</p>
      </header>

      {foods.length === 0 ? (
        <p className="empty-hint">还没有心动菜品，去食材分类或每日推荐里标记几道吧。</p>
      ) : (
        <div className="food-grid">
          {foods.map((food) => (
            <article key={food.id} className="food-card favorite" role="button" tabIndex={0} onClick={() => onSelectFood(food.id)}>
              <div className="food-card-header">
                <div className="food-card-title">
                  <h3>{food.name}</h3>
                  <span className="favorite-badge">心动</span>
                </div>
                <div className="food-card-actions">
                  <span className="calorie-tag">{food.calories} kcal / 100g</span>
                  <button
                    type="button"
                    className="favorite-toggle active"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(food.id);
                    }}
                  >
                    取消心动
                  </button>
                </div>
              </div>
              <p className="food-description">{food.description}</p>
              <div className="food-tags">
                <span className="tag-chip" style={{ backgroundColor: `${trafficColors[food.trafficLight]}22`, color: trafficColors[food.trafficLight] }}>
                  {trafficLightLabels[food.trafficLight]}
                </span>
                <span className="tag-chip" style={{ backgroundColor: 'rgba(251,146,60,0.14)', color: 'var(--color-primary)' }}>
                  {typeLabels[food.type]}
                </span>
              </div>
              <div className="nutrients-row">
                {food.nutrients.map((nutrient) => (
                  <span key={nutrient} className="nutrient-chip">
                    {nutrient}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
