/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export type EnvShareErrorKind =
    | "invalid_token"
    | "expired"
    | "no_reads"
    | "network"
    | "crypto"
    | "validation"
    | "unknown";

export class EnvShareError extends Error {
    public readonly kind: EnvShareErrorKind;
    public readonly cause: unknown;

    public constructor(kind: EnvShareErrorKind, message: string, cause?: unknown) {
        super(message);
        this.kind = kind;
        this.cause = cause;
    }
}

export const toEnvShareError = (
    error: unknown,
    fallbackKind: EnvShareErrorKind,
    fallbackMessage: string
): EnvShareError => {
    if (error instanceof EnvShareError) return error;
    const message = error instanceof Error ? error.message : fallbackMessage;
    return new EnvShareError(fallbackKind, message, error);
};
