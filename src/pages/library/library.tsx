import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LibraryHeader } from "../../components/LibraryHeader";
import "./library.css";
import LibraryGames from "../../components/LibraryGames";

function Library() {
  const location = useLocation();
  const [orientation, setOrientation] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRipples, setShowRipples] = useState(
    (location.state as { fromHome?: boolean })?.fromHome ?? false,
  );

  const handleOrientationChange = (newOrientation: "grid" | "list") => {
    setOrientation(newOrientation);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    console.log("Buscando:", query);
  };

  const games = [
    {
      id: 1,
      name: "Elfie: A Sand Plan",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coahep.jpg",
      background:
        "https://www.gamegrin.com/assets/game/elfie-a-sand-plan/_resampled/croppedimage1201631-elfie-a-sand-plan-background.jpg",
    },
    {
      id: 2,
      name: "Like a Dragon: Gaiden - The Man Who Erased His Name",
      cover:
        "https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Like_a_Dragon_Gaiden_Cover_Art.jpg/250px-Like_a_Dragon_Gaiden_Cover_Art.jpg",
      background:
        "https://image.api.playstation.com/vulcan/ap/rnd/202305/2313/c936412ee0a6246c09cb3068377fdc7f8fdaac5d15ba4c01.png",
      logo: "https://yakuzafan.com/wp-content/uploads/2023/06/Like-a-Dragon-Gaiden-Logo-162695_1080x675.png",
    },
    {
      id: 3,
      name: "Uncharted: Legacy of Thieves Collection",
      cover:
        "https://imgproxy.eneba.games/VyYcGvHYaAhgX4MrUWAcjx2HI5U7X2pcPHiAcijHneg/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy9o/emFQWTZqWUFNVkhf/am51aENKMmtnWkpQ/SGVoMUNHUElMQ1dX/R1JqY1NZLmpwZw",
      background:
        "https://gaming-cdn.com/images/products/8907/orig/uncharted-coleccion-legado-de-los-ladrones-pc-steam-cover.jpg?v=1765962559",
      logo: "https://cdn2.steamgriddb.com/logo/b9763bdff688a0af26e130bab41feb61.png",
    },
    {
      id: 4,
      name: "Elfie: A Sand Plan",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coahep.jpg",
      background:
        "https://www.gamegrin.com/assets/game/elfie-a-sand-plan/_resampled/croppedimage1201631-elfie-a-sand-plan-background.jpg",
    },
    {
      id: 5,
      name: "Like a Dragon: Gaiden - The Man Who Erased His Name",
      cover:
        "https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Like_a_Dragon_Gaiden_Cover_Art.jpg/250px-Like_a_Dragon_Gaiden_Cover_Art.jpg",
      background:
        "https://image.api.playstation.com/vulcan/ap/rnd/202305/2313/c936412ee0a6246c09cb3068377fdc7f8fdaac5d15ba4c01.png",
      logo: "https://yakuzafan.com/wp-content/uploads/2023/06/Like-a-Dragon-Gaiden-Logo-162695_1080x675.png",
    },
    {
      id: 6,
      name: "Uncharted: Legacy of Thieves Collection",
      cover:
        "https://imgproxy.eneba.games/VyYcGvHYaAhgX4MrUWAcjx2HI5U7X2pcPHiAcijHneg/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy9o/emFQWTZqWUFNVkhf/am51aENKMmtnWkpQ/SGVoMUNHUElMQ1dX/R1JqY1NZLmpwZw",
      background:
        "https://gaming-cdn.com/images/products/8907/orig/uncharted-coleccion-legado-de-los-ladrones-pc-steam-cover.jpg?v=1765962559",
      logo: "https://cdn2.steamgriddb.com/logo/b9763bdff688a0af26e130bab41feb61.png",
    },
    {
      id: 7,
      name: "Elfie: A Sand Plan",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coahep.jpg",
      background:
        "https://www.gamegrin.com/assets/game/elfie-a-sand-plan/_resampled/croppedimage1201631-elfie-a-sand-plan-background.jpg",
    },
    {
      id: 8,
      name: "Like a Dragon: Gaiden - The Man Who Erased His Name",
      cover:
        "https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Like_a_Dragon_Gaiden_Cover_Art.jpg/250px-Like_a_Dragon_Gaiden_Cover_Art.jpg",
      background:
        "https://image.api.playstation.com/vulcan/ap/rnd/202305/2313/c936412ee0a6246c09cb3068377fdc7f8fdaac5d15ba4c01.png",
      logo: "https://yakuzafan.com/wp-content/uploads/2023/06/Like-a-Dragon-Gaiden-Logo-162695_1080x675.png",
    },
    {
      id: 9,
      name: "Uncharted: Legacy of Thieves Collection",
      cover:
        "https://imgproxy.eneba.games/VyYcGvHYaAhgX4MrUWAcjx2HI5U7X2pcPHiAcijHneg/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy9o/emFQWTZqWUFNVkhf/am51aENKMmtnWkpQ/SGVoMUNHUElMQ1dX/R1JqY1NZLmpwZw",
      background:
        "https://gaming-cdn.com/images/products/8907/orig/uncharted-coleccion-legado-de-los-ladrones-pc-steam-cover.jpg?v=1765962559",
      logo: "https://cdn2.steamgriddb.com/logo/b9763bdff688a0af26e130bab41feb61.png",
    },
    {
      id: 10,
      name: "Elfie: A Sand Plan",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coahep.jpg",
      background:
        "https://www.gamegrin.com/assets/game/elfie-a-sand-plan/_resampled/croppedimage1201631-elfie-a-sand-plan-background.jpg",
    },
    {
      id: 11,
      name: "Like a Dragon: Gaiden - The Man Who Erased His Name",
      cover:
        "https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Like_a_Dragon_Gaiden_Cover_Art.jpg/250px-Like_a_Dragon_Gaiden_Cover_Art.jpg",
      background:
        "https://image.api.playstation.com/vulcan/ap/rnd/202305/2313/c936412ee0a6246c09cb3068377fdc7f8fdaac5d15ba4c01.png",
      logo: "https://yakuzafan.com/wp-content/uploads/2023/06/Like-a-Dragon-Gaiden-Logo-162695_1080x675.png",
    },
    {
      id: 12,
      name: "Uncharted: Legacy of Thieves Collection",
      cover:
        "https://imgproxy.eneba.games/VyYcGvHYaAhgX4MrUWAcjx2HI5U7X2pcPHiAcijHneg/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy9o/emFQWTZqWUFNVkhf/am51aENKMmtnWkpQ/SGVoMUNHUElMQ1dX/R1JqY1NZLmpwZw",
      background:
        "https://gaming-cdn.com/images/products/8907/orig/uncharted-coleccion-legado-de-los-ladrones-pc-steam-cover.jpg?v=1765962559",
      logo: "https://cdn2.steamgriddb.com/logo/b9763bdff688a0af26e130bab41feb61.png",
    },
    {
      id: 13,
      name: "Elfie: A Sand Plan",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coahep.jpg",
      background:
        "https://www.gamegrin.com/assets/game/elfie-a-sand-plan/_resampled/croppedimage1201631-elfie-a-sand-plan-background.jpg",
    },
    {
      id: 14,
      name: "Like a Dragon: Gaiden - The Man Who Erased His Name",
      cover:
        "https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Like_a_Dragon_Gaiden_Cover_Art.jpg/250px-Like_a_Dragon_Gaiden_Cover_Art.jpg",
      background:
        "https://image.api.playstation.com/vulcan/ap/rnd/202305/2313/c936412ee0a6246c09cb3068377fdc7f8fdaac5d15ba4c01.png",
      logo: "https://yakuzafan.com/wp-content/uploads/2023/06/Like-a-Dragon-Gaiden-Logo-162695_1080x675.png",
    },
    {
      id: 15,
      name: "Uncharted: Legacy of Thieves Collection",
      cover:
        "https://imgproxy.eneba.games/VyYcGvHYaAhgX4MrUWAcjx2HI5U7X2pcPHiAcijHneg/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy9o/emFQWTZqWUFNVkhf/am51aENKMmtnWkpQ/SGVoMUNHUElMQ1dX/R1JqY1NZLmpwZw",
      background:
        "https://gaming-cdn.com/images/products/8907/orig/uncharted-coleccion-legado-de-los-ladrones-pc-steam-cover.jpg?v=1765962559",
      logo: "https://cdn2.steamgriddb.com/logo/b9763bdff688a0af26e130bab41feb61.png",
    },
  ];

  useEffect(() => {
    if (showRipples) {
      setTimeout(() => {
        setShowRipples(false);
      }, 1000);
    }
  }, [showRipples]);

  return (
    <div className="library-container">
      <LibraryHeader
        onOrientationChange={handleOrientationChange}
        onSearch={handleSearch}
        currentOrientation={orientation}
      />
      <main className="library-shell">
        <div className={`library-content ${orientation}`}>
          <LibraryGames
            libraryOrientation={orientation}
            searchQuery={searchQuery}
            games={games}
          />
          <div className={`ripple-circles ${showRipples ? "visible" : ""}`}>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
          </div>
        </div>
      </main>
      <div className="ocean library-ocean">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
}

export default Library;
