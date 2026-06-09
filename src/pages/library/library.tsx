import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LibraryHeader } from "../../components/LibraryHeader";
import "./library.css";
import LibraryGames from "../../components/LibraryGames";
import { useLibraryStore } from "../../stores/libraryStore";
import type { game } from "../../types/game";

function Library() {
  const location = useLocation();
  const orientation = useLibraryStore((state) => state.orientation);
  const setOrientation = useLibraryStore((state) => state.setOrientation);
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

  const games: game[] = [
    {
      id: 3784760,
      name: "Elfie: A Sand Plan",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coahep.jpg",
      background:
        "https://www.gamegrin.com/assets/game/elfie-a-sand-plan/_resampled/croppedimage1201631-elfie-a-sand-plan-background.jpg",
      platform: "Steam",
    },
    {
      id: 2375550,
      name: "Like a Dragon: Gaiden - The Man Who Erased His Name",
      cover:
        "https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Like_a_Dragon_Gaiden_Cover_Art.jpg/250px-Like_a_Dragon_Gaiden_Cover_Art.jpg",
      background:
        "https://image.api.playstation.com/vulcan/ap/rnd/202305/2313/c936412ee0a6246c09cb3068377fdc7f8fdaac5d15ba4c01.png",
      logo: "https://yakuzafan.com/wp-content/uploads/2023/06/Like-a-Dragon-Gaiden-Logo-162695_1080x675.png",
      platform: "Steam",
    },
    {
      id: 1659420,
      name: "Uncharted: Legacy of Thieves Collection",
      cover:
        "https://imgproxy.eneba.games/VyYcGvHYaAhgX4MrUWAcjx2HI5U7X2pcPHiAcijHneg/rs:fit:300/ar:1/czM6Ly9wcm9kdWN0/cy5lbmViYS5nYW1l/cy9wcm9kdWN0cy9o/emFQWTZqWUFNVkhf/am51aENKMmtnWkpQ/SGVoMUNHUElMQ1dX/R1JqY1NZLmpwZw",
      background:
        "https://gaming-cdn.com/images/products/8907/orig/uncharted-coleccion-legado-de-los-ladrones-pc-steam-cover.jpg?v=1765962559",
      logo: "https://cdn2.steamgriddb.com/logo/b9763bdff688a0af26e130bab41feb61.png",
      platform: "Steam",
    },
    {
      id: 1895880,
      name: "Ratchet and Clank - Rift Apart",
      cover:
        "https://static.wikia.nocookie.net/ratchet/images/d/d4/Rift_Apart_base_cover.png/revision/latest?cb=20231026162648",
      background:
        "https://cdn1.epicgames.com/offer/046aeb7098b94ac3961dad6c5dbe68c0/EGS_RatchetClankRiftApart_InsomniacGames_S1_2560x1440-aea43afcad407b14673456322e63a01b",
      logo: "https://gmedia.playstation.com/is/image/SIEPDC/ratchet-and-clank-rift-apart-logo-blue-01-03aug21?$native--t$",
      platform: "Steam",
    },
    {
      id: 1922560,
      name: "Plant's vs Zombies Garden Warfare 2",
      cover:
        "https://store-images.s-microsoft.com/image/apps.7672.68092588132505117.32378282-ea7e-40c4-a3a2-81703aa936d7.ee0c2315-50e1-4175-a1ee-f59e0fc7b52e",
      background:
        "https://store-images.s-microsoft.com/image/apps.43470.71614908314273206.941d9ca3-bfbf-4253-aafc-736114e23e8c.971f9686-6b24-468b-918b-7c05dfd8f141?h=1280",
      logo: "https://static.wikia.nocookie.net/logopedia/images/0/0d/Pvzgw2-logo.png/revision/latest?cb=20171127140344",
      platform: "Steam",
    },
    {
      id: 504230,
      name: "Celeste",
      cover:
        "https://upload.wikimedia.org/wikipedia/commons/0/0f/Celeste_box_art_full.png",
      background:
        "https://gaming-cdn.com/images/products/8003/orig/celeste-pc-mac-juego-steam-cover.jpg?v=1705489821",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Celeste_video_game_logo.png",
      platform: "Steam",
    },
    {
      id: 1113000,
      name: "Persona 4 Golden",
      cover:
        "https://static.wikia.nocookie.net/megamitensei/images/f/fc/P4Gboxart.jpg/revision/latest?cb=20120409194422g",
      background:
        "https://www.nintendo.com/eu/media/images/10_share_images/games_15/nintendo_switch_download_software_1/2x1_NSwitchDS_Persona4Golden.jpg",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Persona_4_Golden_logo.webp",
      platform: "Steam",
    },
    {
      id: 314810,
      name: "Randal's Monday",
      cover:
        "https://image.api.playstation.com/cdn/EP1683/CUSA03883_00/y8cMLAhPovqdEJEA0fhI8mKAAYjE5i3z.png",
      background:
        "https://gaming-cdn.com/images/products/17183/orig/randal-s-monday-pc-juego-steam-cover.jpg?v=1720623331",
      logo: "https://upload.wikimedia.org/wikipedia/fr/1/13/Randal%27s_Monday_Logo.png",
      platform: "Steam",
    },
    {
      id: 3241660,
      name: "R.E.P.O",
      cover:
        "https://static.wikia.nocookie.net/repo-2025horror/images/d/d7/REPO_Cover_Art.png/revision/latest?cb=20250921173900",
      background:
        "https://playtracker.net/cdn-cgi/image/format=auto/https://playtracker-apollo.fra1.cdn.digitaloceanspaces.com/covers/api/game_cover_105271.jpg",
      logo: "https://static.wikia.nocookie.net/logopedia/images/e/e8/REPO_Logo.png/revision/latest/scale-to-width-down/1200?cb=20251020152617",
      platform: "Steam",
    },
    {
      id: 250900,
      name: "The Binding of Isaac Rebirth",
      cover:
        "https://store-images.s-microsoft.com/image/apps.58856.69039762475408619.1f9f3938-799b-4ad8-a607-676e85baba27.95ed1dc8-4ddf-43fb-8a87-f54c81f96879",
      background: "https://images3.alphacoders.com/918/thumb-1920-918253.jpg",
      logo: "https://static.wikia.nocookie.net/logopedia/images/f/fd/BoI-Rebirth-Logo-e1419191913477-700x222.png/revision/latest?cb=20151128125632",
      platform: "Steam",
    },
    {
      id: 1903340,
      name: "Expedition 33",
      cover:
        "https://cdn1.epicgames.com/spt-assets/330dace5ffc74156987f91d454ac544b/project-w-1vp1b.jpg",
      background:
        "https://cdn1.epicgames.com/spt-assets/330dace5ffc74156987f91d454ac544b/project-w-1kt2x.jpg",
      logo: "https://cdn2.steamgriddb.com/logo_thumb/8336f05746072f34cde26ca89a7d4e2e.png",
      platform: "Steam",
    },
    {
      id: 12,
      name: "Bayoneta",
      cover:
        "https://static.wikia.nocookie.net/sega/images/0/0d/Bayonetta.jpg/revision/latest?cb=20200226041601",
      background: "https://images7.alphacoders.com/519/thumb-1920-519121.jpg",
      logo: "https://upload.wikimedia.org/wikipedia/en/d/d5/Logo_for_Bayonetta.png",
      platform: "Steam",
    },
    {
      id: 13,
      name: "Metaphor ReFantazio",
      cover:
        "https://store-images.s-microsoft.com/image/apps.20352.14035448967936250.5e8a162e-c753-4d47-98df-aa3051d0b434.34a3fd4c-1e41-4237-8fa6-17f1a0c13698",
      background: "https://images3.alphacoders.com/138/1380935.jpg",
      logo: "https://cdn2.steamgriddb.com/logo/c535b620d6f5f30eb7feedf70cefa2d9.png",
      platform: "Steam",
    },
    {
      id: 14,
      name: "Hades",
      cover:
        "https://static.wikia.nocookie.net/hades_gamepedia_en/images/a/a0/Hades_Pack_Art.png/revision/latest?cb=20181213192439",
      background:
        "https://gameinformer.com/sites/default/files/styles/content_header_l/public/2020/09/16/9655b65a/hades_launch.jpg.webp",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Hades_logo.png",
      platform: "Steam",
    },
    {
      id: 15,
      name: "It Takes Two",
      cover:
        "https://image.api.playstation.com/vulcan/ap/rnd/202012/0815/IjqyQi0J2PL7GdEo3K8jKWMh.png",
      background: "https://wallpapercave.com/wp/wp14614906.jpg",
      logo: "https://static.wikia.nocookie.net/logopedia/images/5/57/Itt-variant.png/revision/latest?cb=20210327123759",
      platform: "Steam",
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
