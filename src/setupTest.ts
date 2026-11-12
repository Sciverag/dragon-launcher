/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@tauri-apps/api/core', () => {
    return {
        invoke: vi.fn().mockImplementation(async (cmd: string, args?: any) => {
            console.log(`[Tauri v2 Mock] Comando invocado: ${cmd}`, args);

            if (cmd === 'greet') {
                return `Hola ${args?.name || 'Usuario'}, ¡saludos desde el mock de Rust!`;
            }

            return null;
        }),
    };
});

vi.mock('@tauri-apps/plugin-log', () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
}));
