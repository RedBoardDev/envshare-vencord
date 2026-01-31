/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { extractTokensFromText } from "../../shared/domain/TokenExtractor";

export const extractLinksFromMessage = (content: string): readonly string[] =>
    extractTokensFromText(content);
