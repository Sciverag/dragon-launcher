export type User = {
    id: string,
    email: string,
    username: string,
    avatar?: string,
    hero?: string,
    steamId?: string,
    level: number,
    xp: number,
    equippedTitle?: string | null,
    unlockedTitles?: string[]
}