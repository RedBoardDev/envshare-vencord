/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { CryptoPort } from "../../app/ports";
import { b58Decode, b58Encode } from "../../domain/Base58";
import type { EncryptedPayload } from "../../domain/EncryptedPayload";
import { EnvShareError } from "../../domain/Errors";

const KEY_BYTES = 16;
const IV_BYTES = 12;

export class WebCryptoAdapter implements CryptoPort {
    public async encrypt(plaintext: string) {
        try {
            const keyBytes = crypto.getRandomValues(new Uint8Array(KEY_BYTES));
            const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));

            const key = await crypto.subtle.importKey(
                "raw",
                keyBytes,
                { name: "AES-GCM" },
                false,
                ["encrypt"]
            );

            const encoded = new TextEncoder().encode(plaintext);
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                key,
                encoded
            );

            return {
                encrypted: b58Encode(new Uint8Array(encryptedBuffer)),
                iv: b58Encode(iv),
                keyBytes
            };
        } catch (error) {
            throw new EnvShareError("crypto", "Encryption failed", error);
        }
    }

    public async decrypt(payload: EncryptedPayload, keyBytes: Uint8Array) {
        try {
            const encryptedBytes = b58Decode(payload.encrypted);
            const ivBytes = b58Decode(payload.iv);

            const key = await crypto.subtle.importKey(
                "raw",
                keyBytes,
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );

            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: ivBytes },
                key,
                encryptedBytes
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            throw new EnvShareError("crypto", "Decryption failed", error);
        }
    }
}
