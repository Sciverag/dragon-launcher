import {
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { game } from "../types/game";
import { existsInCache, getCachedImage } from "../stores/cacheStore";
import { readFile } from "@tauri-apps/plugin-fs";
import { getGameAssets } from "../services/gameService";
import { ThemeContext } from "../userContext";

interface LibraryCardProps {
  game: game;
  index: number;
  libraryOrientation: string;
  selectedIndex: number;
  changeBackgroundOnce: number;
  changeLogoOnce: number;
  activeIndex: number;
  itemRefs: React.RefObject<(HTMLLIElement | null)[]>;
  handleGamePageNav: (clickedIndex: number) => void;
  setHoveredIndex: (value: number | null) => void;
  setSelectedIndexState: Dispatch<SetStateAction<number>>;
  setChangeBackgroundOnce: Dispatch<SetStateAction<number>>;
  setChangeLogoOnce: Dispatch<SetStateAction<number>>;
}

export default function LibraryCard({
  game,
  index,
  libraryOrientation,
  selectedIndex,
  changeBackgroundOnce,
  changeLogoOnce,
  activeIndex,
  itemRefs,
  handleGamePageNav,
  setHoveredIndex,
  setSelectedIndexState,
  setChangeBackgroundOnce,
  setChangeLogoOnce,
}: LibraryCardProps) {
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [coverPath, setCoverPath] = useState<string>(game.cover as string);
  const [backgroundPath, setBackgroundPath] = useState<string>(
    game.background as string,
  );
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const { background, setBackground, logo, setLogo } = useContext(ThemeContext);

  const obtainGameData = async () => {
    const gameIsInCache = await existsInCache(game.id as number);

    if (gameIsInCache) {
      obtainGameCache();
      return;
    }

    await getGameAssets(game.id).then((assets) => {
      game.cover = assets.libraryCapsule;
      game.logo = assets.logo;
      game.background = assets.background;

      obtainGameCache();
    });
  };

  const obtainGameCache = async () => {
    async function loadCover() {
      const local = await getCachedImage(
        game.id as number,
        "covers",
        game.cover as string,
      );

      const data = await readFile(local);

      const blob = new Blob([data], { type: "image/webp" });
      const url = URL.createObjectURL(blob);
      setCoverPath(url);
    }

    async function loadBackground() {
      const local = await getCachedImage(
        game.id as number,
        "background",
        game.background as string,
      );

      const data = await readFile(local);

      const blob = new Blob([data], { type: "image/webp" });
      const url = URL.createObjectURL(blob);
      setBackgroundPath(url);
    }

    async function loadLogo() {
      const local = await getCachedImage(
        game.id as number,
        "logo",
        game.logo as string,
      );

      const data = await readFile(local);

      const blob = new Blob([data], { type: "image/webp" });
      const url = URL.createObjectURL(blob);
      setLogoPath(url);
    }

    loadCover();
    loadBackground();
    loadLogo();
  };

  useEffect(() => {
    if (!hasInitialized) {
      obtainGameData();
      setHasInitialized(true);
    }
  }, [game.id]);

  useEffect(() => {
    if (
      activeIndex === index &&
      hasInitialized &&
      backgroundPath &&
      changeBackgroundOnce < 1
    ) {
      setChangeBackgroundOnce(1);
      setBackground(backgroundPath);
    }
  }, [
    backgroundPath,
    activeIndex,
    hasInitialized,
    index,
    background,
    setBackground,
    changeBackgroundOnce,
    setChangeBackgroundOnce,
  ]);

  useEffect(() => {
    if (
      activeIndex === index &&
      hasInitialized &&
      logoPath &&
      changeLogoOnce < 1
    ) {
      setChangeLogoOnce(1);
      setLogo(logoPath);
    }
  }, [
    logoPath,
    activeIndex,
    hasInitialized,
    index,
    setLogo,
    changeLogoOnce,
    setChangeLogoOnce,
  ]);

  return (
    <li
      key={`${game.id}-${index}`}
      onClick={() => handleGamePageNav(index)}
      className={`game-card glass ${activeIndex === index ? "selected" : ""}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      ref={(element) => {
        // eslint-disable-next-line react-hooks/immutability
        itemRefs.current[index] = element;
      }}
      role="option"
      aria-selected={selectedIndex === index}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => {
        setHoveredIndex(null);
        if (libraryOrientation === "grid") setSelectedIndexState(index);
      }}
    >
      <img
        className="game-cover"
        src={coverPath}
        onError={(e) => {
          e.target.src = backgroundPath;
        }}
        alt={game.name}
      />
    </li>
  );
}
