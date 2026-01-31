/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { EnvShareError } from "../../shared/domain/Errors";

export class SharePolicy {
    public readonly ttlSeconds: number;
    public readonly reads: number;

    private constructor(ttlSeconds: number, reads: number) {
        this.ttlSeconds = ttlSeconds;
        this.reads = reads;
    }

    public static create(input: { ttlSeconds: number; reads: number }): SharePolicy {
        const ttlSeconds = Math.floor(input.ttlSeconds);
        if (!Number.isFinite(ttlSeconds) || ttlSeconds < 60) {
            throw new EnvShareError("validation", "TTL must be at least 60 seconds");
        }

        const reads = Math.floor(input.reads);
        if (!Number.isFinite(reads) || reads < 0) {
            throw new EnvShareError("validation", "Reads must be zero or greater");
        }

        return new SharePolicy(ttlSeconds, reads);
    }
}
