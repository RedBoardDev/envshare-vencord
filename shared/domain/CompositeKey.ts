/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { b58Decode, b58Encode } from "./Base58";
import { EnvShareError } from "./Errors";

const VERSION_V2 = 2;
const ID_BYTES = 16;
const KEY_BYTES = 16;

export type CompositeKey = {
    readonly id: string;
    readonly keyBytes: Uint8Array;
};

export const encodeCompositeKeyV2 = (id: string, keyBytes: Uint8Array): string => {
    const idBytes = b58Decode(id);
    if (idBytes.length !== ID_BYTES) {
        throw new EnvShareError(
            "invalid_token",
            `Invalid ID length: expected ${ID_BYTES}, got ${idBytes.length}`
        );
    }
    if (keyBytes.length !== KEY_BYTES) {
        throw new EnvShareError(
            "invalid_token",
            `Invalid key length: expected ${KEY_BYTES}, got ${keyBytes.length}`
        );
    }

    const raw = Uint8Array.from([
        VERSION_V2,
        ...Array.from(idBytes),
        ...Array.from(keyBytes)
    ]);

    return b58Encode(raw);
};

export const decodeCompositeKeyV2 = (token: string): CompositeKey => {
    const raw = b58Decode(token);
    const expectedLength = 1 + ID_BYTES + KEY_BYTES;

    if (raw.length !== expectedLength) {
        throw new EnvShareError(
            "invalid_token",
            `Invalid composite key length: expected ${expectedLength}, got ${raw.length}`
        );
    }

    const version = raw[0];
    if (version !== VERSION_V2) {
        throw new EnvShareError("invalid_token", `Unsupported version: ${version}`);
    }

    const idBytes = raw.slice(1, 1 + ID_BYTES);
    const keyBytes = raw.slice(1 + ID_BYTES);

    return {
        id: b58Encode(idBytes),
        keyBytes
    };
};
