/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { mapNativeError } from "../../../shared/adapters/out/EnvShareNativeErrorMapper";
import type { EnvShareStorePort, StoreRequest, StoreResponse } from "../../../shared/app/ports";
import { requireRecord, requireString } from "../../../shared/app/validation";
import { EnvShareError } from "../../../shared/domain/Errors";

const Native = VencordNative.pluginHelpers.EnvShareBridge as {
    store(payload: StoreRequest): Promise<unknown>;
};

const parseStoreResponse = (value: unknown): StoreResponse => {
    const record = requireRecord(value, "Store response");
    const id = requireString(record.id, "Store response.id");
    return { id };
};

export class EnvShareStoreNative implements EnvShareStorePort {
    public async store(request: StoreRequest): Promise<StoreResponse> {
        try {
            const response = await Native.store(request);
            return parseStoreResponse(response);
        } catch (error) {
            const mapped = mapNativeError("store", error);
            throw new EnvShareError(mapped.kind, mapped.message, mapped.cause ?? error);
        }
    }
}
