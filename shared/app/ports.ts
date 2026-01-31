/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { EncryptedPayload, EncryptedPayloadWithKey } from "../domain/EncryptedPayload";

export type Result<T, E> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export type StoreRequest = EncryptedPayload & {
    readonly ttl: number;
    readonly reads: number;
};

export type StoreResponse = {
    readonly id: string;
};

export type LoadResponse = EncryptedPayload & {
    readonly remainingReads: number | null;
};

export interface EnvShareStorePort {
    store(request: StoreRequest): Promise<StoreResponse>;
}

export interface EnvShareLoadPort {
    load(id: string): Promise<LoadResponse>;
}

export interface CryptoPort {
    encrypt(plaintext: string): Promise<EncryptedPayloadWithKey>;
    decrypt(payload: EncryptedPayload, keyBytes: Uint8Array): Promise<string>;
}

export interface ClipboardPort {
    writeText(text: string): Promise<void>;
}

export interface ChatInputPort {
    insertText(text: string): void;
}

export interface SelectionPort {
    getSelectionText(): string;
}
