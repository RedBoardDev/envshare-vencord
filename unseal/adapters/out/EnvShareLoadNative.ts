/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { mapNativeError } from "../../../shared/adapters/out/EnvShareNativeErrorMapper";
import type { EnvShareLoadPort, LoadResponse } from "../../../shared/app/ports";
import { requireNullableNumber, requireRecord, requireString } from "../../../shared/app/validation";
import { EnvShareError } from "../../../shared/domain/Errors";

const Native = VencordNative.pluginHelpers.EnvShareBridge as {
    load(id: string): Promise<unknown>;
};

const parseLoadResponse = (value: unknown): LoadResponse => {
    const record = requireRecord(value, "Load response");
    const iv = requireString(record.iv, "Load response.iv");
    const encrypted = requireString(record.encrypted, "Load response.encrypted");
    const remainingReads = requireNullableNumber(record.remainingReads, "Load response.remainingReads");

    return {
        iv,
        encrypted,
        remainingReads
    };
};

export class EnvShareLoadNative implements EnvShareLoadPort {
    public async load(id: string): Promise<LoadResponse> {
        try {
            const response = await Native.load(id);
            return parseLoadResponse(response);
        } catch (error) {
            const mapped = mapNativeError("load", error);
            throw new EnvShareError(mapped.kind, mapped.message, mapped.cause ?? error);
        }
    }
}
