import { appDataDir, join } from '@tauri-apps/api/path';
import { exists, writeFile, mkdir } from '@tauri-apps/plugin-fs';
import { fetch } from '@tauri-apps/plugin-http';

export async function getImagePath(appId: number, type: string, platform: string) {
    const base = await appDataDir();
    return await join(base, 'dragon-launcher', 'cache', 'images', `${platform}`, `${type}`, `${appId}`);
}

export async function existsInCache(appId: number, platform: string) {

    const base = await appDataDir();
    const coverPath = await join(base, 'dragon-launcher', 'cache', 'images', `${platform}`, 'covers', `${appId}.webp`)
    const backPath = await join(base, 'dragon-launcher', 'cache', 'images', `${platform}`, 'background', `${appId}.webp`)
    const logoPath = await join(base, 'dragon-launcher', 'cache', 'images', `${platform}`, 'logo', `${appId}.webp`)
    const iconPath = await join(base, 'dragon-launcher', 'cache', 'images', `${platform}`, 'icon', `${appId}.webp`)

    const coverExists = await exists(coverPath);
    const backExists = await exists(backPath)
    const logoExists = await exists(logoPath)
    const iconExists = await exists(iconPath)

    return coverExists && backExists && logoExists && iconExists

}

export async function cacheImage(url: string, localPath: string) {
    const filePath = `${localPath}.webp`
    const fileExists = await exists(filePath);

    if (fileExists) return filePath;

    let dir;

    if (localPath.includes('/')) {
        dir = localPath.split('/').slice(0, -1).join('/');
    } else {
        dir = localPath.split('\\').slice(0, -1).join('\\');
    }

    await mkdir(dir, { recursive: true });
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();

    await writeFile(filePath, new Uint8Array(arrayBuffer));

    return filePath;
}

export async function getCachedImage(appId: number, type: string, url: string | undefined, platform: string) {
    const path = await getImagePath(appId, type, platform);
    const filePath = `${path}.webp`;
    const fileExists = await exists(filePath);

    if (fileExists) {
        return filePath;
    }

    if (!url) {
        throw new Error(`Missing asset URL for ${platform}/${type}/${appId} on cache miss`);
    }

    return await cacheImage(url, path);
}