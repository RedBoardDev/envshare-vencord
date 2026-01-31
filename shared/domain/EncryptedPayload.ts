/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type EncryptedPayload = {
    readonly encrypted: string;
    readonly iv: string;
};

export type EncryptedPayloadWithKey = EncryptedPayload & {
    readonly keyBytes: Uint8Array;
};
