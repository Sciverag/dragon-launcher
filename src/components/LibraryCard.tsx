import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { game } from "../types/game";
import { existsInCache, getCachedImage } from "../stores/cacheStore";
import { readFile } from "@tauri-apps/plugin-fs";
import { getGameAssets } from "../services/gameService";
import { ThemeContext } from "../userContext";
import "./LibraryCard.css";

interface LibraryCardProps {
  game: game;
  index: number;
  libraryOrientation: string;
  selectedIndex: number;
  shouldLoadAssets: boolean;
  changeBackgroundOnce: number;
  changeLogoOnce: number;
  changeIconOnce: number;
  activeIndex: number;
  handleGamePageNav: (clickedIndex: number) => void;
  setHoveredIndex: (value: number | null) => void;
  setSelectedIndexState: Dispatch<SetStateAction<number>>;
  setSelectedGameId: Dispatch<SetStateAction<string | number | null>>;
  setChangeBackgroundOnce: Dispatch<SetStateAction<number>>;
  setChangeLogoOnce: Dispatch<SetStateAction<number>>;
  setChangeIconOnce: Dispatch<SetStateAction<number>>;
}

type AssetSources = {
  cover?: string;
  logo?: string;
  background?: string;
  icon?: string;
};

const EMPTY_COVER_DATA_URI =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

export default function LibraryCard({
  game,
  index,
  libraryOrientation,
  selectedIndex,
  shouldLoadAssets,
  changeBackgroundOnce,
  changeLogoOnce,
  changeIconOnce,
  activeIndex,
  handleGamePageNav,
  setHoveredIndex,
  setSelectedIndexState,
  setSelectedGameId,
  setChangeBackgroundOnce,
  setChangeLogoOnce,
  setChangeIconOnce,
}: LibraryCardProps) {
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [hasLoadedDetails, setHasLoadedDetails] = useState<boolean>(false);
  const [isInViewport, setIsInViewport] = useState<boolean>(false);
  const [coverPath, setCoverPath] = useState<string>(game.cover as string);
  const [iconPath, setIconPath] = useState<string>(game.icon as string);
  const [backgroundPath, setBackgroundPath] = useState<string>(
    game.background as string,
  );
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [assetSources, setAssetSources] = useState<AssetSources>({
    cover: game.cover,
    logo: game.logo,
    background: game.background,
    icon: game.icon,
  });
  const [failedCoverSrc, setFailedCoverSrc] = useState<string | null>(null);
  const [failedBackgroundSrc, setFailedBackgroundSrc] = useState<string | null>(
    null,
  );
  const liRef = useRef<HTMLLIElement | null>(null);
  const isLoadingCoverRef = useRef(false);
  const isLoadingDetailsRef = useRef(false);
  const latestActiveIndexRef = useRef(activeIndex);
  const { setBackground, setLogo, setIcon } = useContext(ThemeContext) as {
    setBackground: (path: string) => void;
    setLogo: (path: string) => void;
    setIcon: (path: string) => void;
  };

  useEffect(() => {
    latestActiveIndexRef.current = activeIndex;
  }, [activeIndex]);

  const obtainGameCache = useCallback(
    async (loadDetails: boolean, sources: AssetSources) => {
      async function loadCover() {
        const local = await getCachedImage(
          game.id as number,
          "covers",
          sources.cover,
          game.platform,
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
          sources.background,
          game.platform,
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
          sources.logo,
          game.platform,
        );

        const data = await readFile(local);

        const blob = new Blob([data], { type: "image/webp" });
        const url = URL.createObjectURL(blob);
        setLogoPath(url);
      }

      async function loadIcon() {
        const local = await getCachedImage(
          game.id as number,
          "icon",
          sources.icon,
          game.platform,
        );

        const data = await readFile(local);

        const blob = new Blob([data], { type: "image/webp" });
        const url = URL.createObjectURL(blob);

        setIconPath(url);
      }

      await loadCover();

      if (!loadDetails) {
        return;
      }

      await Promise.all([loadIcon(), loadBackground(), loadLogo()]);
    },
    [game.id, game.platform],
  );

  const obtainGameData = useCallback(
    async (loadDetails: boolean) => {
      if (loadDetails) {
        if (isLoadingDetailsRef.current) return;
        isLoadingDetailsRef.current = true;
      } else {
        if (isLoadingCoverRef.current) return;
        isLoadingCoverRef.current = true;
      }

      const resolveSourcesFromAssets = (assets: {
        libraryCapsule?: string;
        logo?: string;
        background?: string;
        icon?: string;
      }) => ({
        cover: assetSources.cover || assets.libraryCapsule,
        logo: assetSources.logo || assets.logo,
        background: assetSources.background || assets.background,
        icon: assetSources.icon || assets.icon,
      });

      try {
        const gameIsInCache = await existsInCache(
          game.id as number,
          game.platform,
        );

        let resolvedSources = assetSources;

        if (!gameIsInCache) {
          const assets = await getGameAssets(game.id, game.platform);
          resolvedSources = resolveSourcesFromAssets(assets);
          setAssetSources(resolvedSources);
        }

        try {
          await obtainGameCache(loadDetails, resolvedSources);
        } catch {
          const assets = await getGameAssets(game.id, game.platform);
          resolvedSources = resolveSourcesFromAssets(assets);
          setAssetSources(resolvedSources);
          await obtainGameCache(loadDetails, resolvedSources);
        }

        if (loadDetails) {
          setHasLoadedDetails(true);
        }
      } catch (error) {
        console.error("Error loading game assets", {
          gameId: game.id,
          platform: game.platform,
          loadDetails,
          error,
        });
      } finally {
        if (loadDetails) {
          isLoadingDetailsRef.current = false;
        } else {
          isLoadingCoverRef.current = false;
        }
      }
    },
    [assetSources, game.id, game.platform, obtainGameCache],
  );

  useEffect(() => {
    const current = liRef.current;

    if (!current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "500px",
      },
    );

    observer.observe(current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasInitialized && (shouldLoadAssets || activeIndex === index)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void obtainGameData(true);

      setHasInitialized(true);
    }
  }, [
    game.id,
    hasInitialized,
    shouldLoadAssets,
    activeIndex,
    index,
    obtainGameData,
  ]);

  useEffect(() => {
    if (
      hasInitialized &&
      !hasLoadedDetails &&
      (shouldLoadAssets || activeIndex === index)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void obtainGameData(true);
    }
  }, [
    activeIndex,
    index,
    hasInitialized,
    hasLoadedDetails,
    shouldLoadAssets,
    obtainGameData,
  ]);

  useEffect(() => {
    if (
      activeIndex === index &&
      latestActiveIndexRef.current === index &&
      hasLoadedDetails &&
      backgroundPath &&
      changeBackgroundOnce < 1
    ) {
      setChangeBackgroundOnce(1);
      setBackground(backgroundPath);
    }
  }, [
    backgroundPath,
    activeIndex,
    hasLoadedDetails,
    index,
    setBackground,
    changeBackgroundOnce,
    setChangeBackgroundOnce,
  ]);

  useEffect(() => {
    if (
      activeIndex === index &&
      latestActiveIndexRef.current === index &&
      hasLoadedDetails &&
      logoPath &&
      changeLogoOnce < 1
    ) {
      setChangeLogoOnce(1);
      setLogo(logoPath);
    }
  }, [
    logoPath,
    activeIndex,
    hasLoadedDetails,
    index,
    setLogo,
    changeLogoOnce,
    setChangeLogoOnce,
  ]);

  useEffect(() => {
    if (
      activeIndex === index &&
      latestActiveIndexRef.current === index &&
      hasLoadedDetails &&
      iconPath &&
      changeIconOnce < 1
    ) {
      setChangeIconOnce(1);
      setIcon(iconPath);
    }
  }, [
    iconPath,
    activeIndex,
    hasLoadedDetails,
    index,
    setIcon,
    changeIconOnce,
    setChangeIconOnce,
  ]);

  const hasValidCover = Boolean(coverPath) && coverPath !== failedCoverSrc;
  const hasValidBackground =
    Boolean(backgroundPath) && backgroundPath !== failedBackgroundSrc;
  const displayCoverSrc = hasValidCover
    ? coverPath
    : hasValidBackground
      ? backgroundPath
      : EMPTY_COVER_DATA_URI;

  return (
    <li
      key={`${game.id}-${index}`}
      onClick={() => handleGamePageNav(index)}
      aria-label={game.name}
      title={game.name}
      className={`game-card glass ${activeIndex === index ? "selected" : ""} ${!game.isLocal ? "not-installed" : ""}`}
      style={{ animationDelay: `${index * 0.08}s` }}
      data-index={index}
      ref={liRef}
      role="option"
      aria-selected={selectedIndex === index}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => {
        setHoveredIndex(null);
        if (libraryOrientation === "grid") {
          setSelectedIndexState(index);
          setSelectedGameId(game.id);
        }
      }}
    >
      <img
        className="game-cover"
        src={displayCoverSrc}
        onError={() => {
          if (displayCoverSrc === coverPath && coverPath) {
            setFailedCoverSrc(coverPath);
            return;
          }

          if (displayCoverSrc === backgroundPath && backgroundPath) {
            setFailedBackgroundSrc(backgroundPath);
          }
        }}
        alt={game.name}
      />
    </li>
  );
}
