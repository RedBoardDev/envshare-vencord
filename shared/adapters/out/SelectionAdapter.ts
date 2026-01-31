/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SelectionPort } from "../../app/ports";

export class SelectionAdapter implements SelectionPort {
    public getSelectionText(): string {
        return window.getSelection()?.toString() ?? "";
    }
}
