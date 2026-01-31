/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EnvShareError } from "../domain/Errors";

export type UnknownRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export const requireString = (value: unknown, label: string): string => {
    if (typeof value !== "string") {
        throw new EnvShareError("validation", `${label} must be a string`);
    }
    return value;
};

export const requireNumber = (value: unknown, label: string): number => {
    if (typeof value !== "number" || Number.isNaN(value)) {
        throw new EnvShareError("validation", `${label} must be a number`);
    }
    return value;
};

export const requireNullableNumber = (value: unknown, label: string): number | null => {
    if (value === null) return null;
    return requireNumber(value, label);
};

export const requireRecord = (value: unknown, label: string): UnknownRecord => {
    if (!isRecord(value)) {
        throw new EnvShareError("validation", `${label} must be an object`);
    }
    return value;
};
