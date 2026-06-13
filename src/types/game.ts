export type game = {
    id: string | number;
    name: string;
    cover?: string;
    header?: string;
    logo?: string;
    background?: string;
    platform: "Steam" | "Epic" | "Custom";
    last_played: number;
};

export type game_detail = {
    id: string | number;
    name: string;
    logo?: string;
    background: string;
    developer: string;
    release: string;
    played_time: string;
    description: string;
    trailer: string;
    trailerPoster?: string;
    achievements?: {
        higlighted: {},
        total: number
    };
}