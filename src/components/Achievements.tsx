import "./Achievements.css";
import type { SteamAchievementProgress } from "../types/game";
import {
  getAchievementQuality,
  normalizeGlobalPercent,
  type AchievementQuality,
} from "../utils/leveling";

type AchievementsProps = {
  achievements: SteamAchievementProgress[];
  gameId?: string;
  gameName?: string;
};

export default function Achievements({ achievements }: AchievementsProps) {
  const getQuality = (globalPercent: unknown): AchievementQuality =>
    getAchievementQuality(globalPercent, achievements);

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

  const formatUnlockTime = (unlockTime: number | null) => {
    if (!unlockTime) return "";
    const date = new Date(unlockTime * 1000);
    return ` - Desbloqueado el ${date.toLocaleDateString()}`;
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
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <img
                    className={`achievement-item__icon achievement-item__icon--${quality}${isHiddenLocked ? " achievement-item__icon--hidden" : ""} ${!achievement.achieved ? "achievement-item__icon--locked" : ""}`}
                    src={(() => {
                      const resolvedIcon = achievement.achieved
                        ? achievement.icon
                        : achievement.iconGray || achievement.icon;
                      return resolvedIcon?.trim() ? resolvedIcon : undefined;
                    })()}
                    alt={showRealData ? achievement.name : "Logro oculto"}
                  />

                  <img
                    className={`achievement-item__icon__background ${!achievement.achieved ? "achievement-item__icon__background--locked" : ""}`}
                    src={(() => {
                      const resolvedIcon = achievement.achieved
                        ? achievement.icon
                        : achievement.iconGray || achievement.icon;
                      return resolvedIcon?.trim() ? resolvedIcon : undefined;
                    })()}
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
                        ? achievement.description || ""
                        : "Descripcion oculta hasta desbloquear este logro"}
                    </p>
                    <div className="achievement-item__meta">
                      <span>
                        {formatPercent(achievement.globalPercent)}
                        {formatUnlockTime(achievement.unlockTime)}
                      </span>
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
