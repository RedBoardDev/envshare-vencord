/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { type CryptoPort, type EnvShareStorePort, err, ok, type Result } from "../../shared/app/ports";
import { encodeCompositeKeyV2 } from "../../shared/domain/CompositeKey";
import { buildEnvShareLink, type EnvShareLink } from "../../shared/domain/EnvShareLink";
import { EnvShareError, toEnvShareError } from "../../shared/domain/Errors";
import type { SharePolicy } from "../domain/SharePolicy";

export type CreateShareLinkInput = {
    readonly plaintext: string;
    readonly policy: SharePolicy;
};

export class CreateShareLink {
    private readonly crypto: CryptoPort;
    private readonly store: EnvShareStorePort;

    public constructor(deps: { crypto: CryptoPort; store: EnvShareStorePort }) {
        this.crypto = deps.crypto;
        this.store = deps.store;
    }

    public async execute(input: CreateShareLinkInput): Promise<Result<EnvShareLink, EnvShareError>> {
        if (input.plaintext.trim().length === 0) {
            return err(new EnvShareError("validation", "Content cannot be empty"));
        }

        try {
            const encrypted = await this.crypto.encrypt(input.plaintext);
            const stored = await this.store.store({
                ttl: input.policy.ttlSeconds,
                reads: input.policy.reads,
                encrypted: encrypted.encrypted,
                iv: encrypted.iv
            });

            const token = encodeCompositeKeyV2(stored.id, encrypted.keyBytes);
            return ok(buildEnvShareLink(token));
        } catch (error) {
            return err(toEnvShareError(error, "unknown", "Failed to create EnvShare link"));
        }
    }
}
