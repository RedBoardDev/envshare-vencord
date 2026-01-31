/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IpcMainInvokeEvent } from "electron";

const BASE = "https://envshare.dev";

type StoreRequest = {
    ttl: number;
    reads: number; // 0 = unlimited
    encrypted: string; // base58
    iv: string; // base58
};

export async function store(_: IpcMainInvokeEvent, request: StoreRequest) {
    const response = await fetch(`${BASE}/api/v1/store`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request)
    }).catch(() => null);

    if (!response?.ok) {
        throw new Error(`envshare store failed: ${response?.status ?? "no-conn"}`);
    }

    return await response.json() as { id: string };
}

export async function load(_: IpcMainInvokeEvent, id: string) {
    const response = await fetch(`${BASE}/api/v1/load?id=${encodeURIComponent(id)}`)
        .catch(() => null);

    if (!response?.ok) {
        throw new Error(`envshare load failed: ${response?.status ?? "no-conn"}`);
    }

    return await response.json() as {
        iv: string;
        encrypted: string;
        remainingReads: number | null;
    };
}
