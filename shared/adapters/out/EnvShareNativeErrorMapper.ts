/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EnvShareError } from "../../domain/Errors";

type Action = "store" | "load";

const isExpiredHint = (message: string): boolean => {
    const lower = message.toLowerCase();
    return lower.includes("404") || lower.includes("not found");
};

export const mapNativeError = (action: Action, error: unknown): EnvShareError => {
    if (error instanceof EnvShareError) return error;

    const message = error instanceof Error ? error.message : String(error ?? "Unknown error");

    if (action === "load" && isExpiredHint(message)) {
        return new EnvShareError("expired", "EnvShare link expired", error);
    }

    return new EnvShareError("network", `EnvShare ${action} failed`, error);
};
