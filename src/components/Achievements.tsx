import "./Achievements.css";
import type { SteamAchievementProgress } from "../types/game";

type AchievementsProps = {
  achievements: SteamAchievementProgress[];
};

type AchievementQuality = "bronce" | "plata" | "oro" | "platino";

function normalizeGlobalPercent(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildQualityMap(
  achievements: SteamAchievementProgress[],
): Map<number | null, AchievementQuality> {
  const percents = achievements
    .map((a) => normalizeGlobalPercent(a.globalPercent))
    .filter((p): p is number => p !== null);

  const uniqueSorted = [...new Set(percents)].sort((a, b) => a - b);
  const map = new Map<number | null, AchievementQuality>();

  if (uniqueSorted.length === 0) {
    map.set(null, "bronce");
    return map;
  }

  const minPercent = uniqueSorted[0];
  map.set(minPercent, "platino");

  const rest = uniqueSorted.slice(1);
  const restTotal = rest.length;

  rest.forEach((p, i) => {
    const rank = restTotal === 1 ? 0.5 : i / (restTotal - 1);
    let quality: AchievementQuality;
    if (rank <= 1 / 3) quality = "oro";
    else if (rank <= 2 / 3) quality = "plata";
    else quality = "bronce";
    map.set(p, quality);
  });

  map.set(null, "bronce");
  return map;
}

export default function Achievements({ achievements }: AchievementsProps) {
  const qualityMap = buildQualityMap(achievements);

  const getQuality = (globalPercent: unknown): AchievementQuality =>
    qualityMap.get(normalizeGlobalPercent(globalPercent)) ?? "bronce";

  const sortedAchievements = [...achievements].sort((a, b) => {
    const aPercent =
      normalizeGlobalPercent(a.globalPercent) ?? Number.POSITIVE_INFINITY;
    const bPercent =
      normalizeGlobalPercent(b.globalPercent) ?? Number.POSITIVE_INFINITY;
    return aPercent - bPercent;
  });

  const formatPercent = (globalPercent: unknown) => {
    const parsedPercent = normalizeGlobalPercent(globalPercent);
    if (parsedPercent === null) return "Sin datos globales";
    return `${parsedPercent.toFixed(1)}% de jugadores`;
  };

  return (
    <>
      <div className="achievements-background" />
      <main className="achievements-container">
        <section className="achievements-list">
          <ul className="achievements-list__items">
            {sortedAchievements.map((achievement, index) => {
              const quality = getQuality(achievement.globalPercent);
              const showRealData = !achievement.hidden || achievement.achieved;
              const isHiddenLocked =
                achievement.hidden && !achievement.achieved;

              return (
                <li
                  key={achievement.apiName}
                  className="achievement-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    className={`achievement-item__icon achievement-item__icon--${quality}${isHiddenLocked ? " achievement-item__icon--hidden" : ""}`}
                    src={
                      achievement.achieved
                        ? achievement.icon
                        : achievement.iconGray || achievement.icon
                    }
                    alt={showRealData ? achievement.name : "Logro oculto"}
                  />
                  <div className="achievement-item__content">
                    <div className="achievement-item__head">
                      <h3>
                        {showRealData ? achievement.name : "Logro oculto"}
                      </h3>
                    </div>
                    <p className="achievement-item__description">
                      {showRealData
                        ? achievement.description || "Sin descripcion"
                        : "Descripcion oculta hasta desbloquear este logro"}
                    </p>
                    <div className="achievement-item__meta">
                      <span>{formatPercent(achievement.globalPercent)}</span>
                      <span
                        className={`quality-trophy quality-trophy--${quality}`}
                      >
                        <span className="material-symbols-outlined">
                          trophy
                        </span>
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
            {sortedAchievements.length === 0 && (
              <li className="achievement-item achievement-item--empty">
                No hay logros disponibles para este juego.
              </li>
            )}
          </ul>
        </section>
      </main>
    </>
  );
}
