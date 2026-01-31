/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type EnvShareLink = {
    readonly url: string;
    readonly token: string;
};

export const buildEnvShareLink = (token: string): EnvShareLink => ({
    url: `https://envshare.dev/unseal#${token}`,
    token
});
