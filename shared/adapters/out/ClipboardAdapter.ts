/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ClipboardPort } from "../../app/ports";

export class ClipboardAdapter implements ClipboardPort {
    public async writeText(text: string): Promise<void> {
        await navigator.clipboard.writeText(text);
    }
}
