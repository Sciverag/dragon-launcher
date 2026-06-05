import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { game } from "../../types/game";
import "./game.css";
import { useLibraryStore } from "../../stores/libraryStore";

function Game() {
  const { gameId } = useParams();
  const orientation = useLibraryStore((state) => state.orientation);
  const [game, setGame] = useState<game | null>(null);

  const fetchGameDetails = () => {
    setGame({
      id: gameId!,
      name: "Elfie: A Sand Plan",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coahep.jpg",
      background:
        "https://www.gamegrin.com/assets/game/elfie-a-sand-plan/_resampled/croppedimage1201631-elfie-a-sand-plan-background.jpg",
    });
  };

  useEffect(() => {
    fetchGameDetails();
  }, []);

  return (
    <main className="game-details-container">
      <div
        className="background-game-detail"
        style={{
          backgroundImage: `url(${game?.background})`,
        }}
      ></div>
      {game?.logo ? (
        <img
          src={game.logo}
          className={`logo-game-detail ${orientation}`}
        ></img>
      ) : (
        <h1 className={`name-game-detail ${orientation}`}>{game?.name}</h1>
      )}
    </main>
  );
}

export default Game;
