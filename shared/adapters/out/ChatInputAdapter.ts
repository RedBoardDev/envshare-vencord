/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ComponentDispatch } from "@webpack/common";

import type { ChatInputPort } from "../../app/ports";

export class ChatInputAdapter implements ChatInputPort {
    public insertText(text: string): void {
        ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", {
            rawText: text,
            plainText: text
        });
    }
}
