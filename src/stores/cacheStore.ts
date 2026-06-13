import { appDataDir, join } from '@tauri-apps/api/path';
import { exists, writeFile, mkdir } from '@tauri-apps/plugin-fs';
import { fetch } from '@tauri-apps/plugin-http';

export async function getImagePath(appId: number, type: string) {
    const base = await appDataDir();
    return await join(base, 'dragon-launcher', 'cache', 'images', `${type}`, `${appId}`);
}

export async function existsInCache(appId: number) {

    const base = await appDataDir();
    const coverPath = await join(base, 'dragon-launcher', 'cache', 'images', 'cover', `${appId}.webp`)
    const backPath = await join(base, 'dragon-launcher', 'cache', 'images', 'background', `${appId}.webp`)
    const logoPath = await join(base, 'dragon-launcher', 'cache', 'images', 'logo', `${appId}.webp`)

    const coverExists = await exists(coverPath);
    const backExists = await exists(backPath)
    const logoExists = await exists(logoPath)

    return coverExists && backExists && logoExists

}

export async function cacheImage(url: string, localPath: string) {
    const response = await fetch(url);

    const filePath = `${localPath}.webp`
    const fileExists = await exists(filePath);

    if (fileExists) return filePath;

    let dir;

    if (localPath.includes('/')) {
        dir = localPath.split('/').slice(0, -1).join('/');
    } else {
        dir = localPath.split('\\').slice(0, -1).join('\\');
    }

    console.log(dir)

    await mkdir(dir, { recursive: true });
    const arrayBuffer = await response.arrayBuffer();

    await writeFile(filePath, new Uint8Array(arrayBuffer));

    return filePath;
}

export async function getCachedImage(appId: number, type: string, url: string) {
    const path = await getImagePath(appId, type);

    return await cacheImage(url, path);
}