/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const ENVSHARE_LINK_RE = /https?:\/\/envshare\.dev\/unseal#([1-9A-HJ-NP-Za-km-z]+)\b/g;

export const extractTokensFromText = (content: string): readonly string[] =>
    Array.from(content.matchAll(ENVSHARE_LINK_RE), match => match[1]);
