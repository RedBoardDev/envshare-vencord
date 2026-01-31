/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { type CryptoPort, type EnvShareLoadPort, err, ok, type Result } from "../../shared/app/ports";
import { decodeCompositeKeyV2 } from "../../shared/domain/CompositeKey";
import { EnvShareError, toEnvShareError } from "../../shared/domain/Errors";
import type { UnsealResult } from "../domain/UnsealResult";

export type DecryptShareLinkInput = {
    readonly token: string;
};

export class DecryptShareLink {
    private readonly crypto: CryptoPort;
    private readonly load: EnvShareLoadPort;

    public constructor(deps: { crypto: CryptoPort; load: EnvShareLoadPort }) {
        this.crypto = deps.crypto;
        this.load = deps.load;
    }

    public async execute(input: DecryptShareLinkInput): Promise<Result<UnsealResult, EnvShareError>> {
        try {
            const decoded = decodeCompositeKeyV2(input.token);
            const payload = await this.load.load(decoded.id);

            if (payload.remainingReads === 0) {
                return err(new EnvShareError("no_reads", "No reads remaining"));
            }

            const content = await this.crypto.decrypt(
                { encrypted: payload.encrypted, iv: payload.iv },
                decoded.keyBytes
            );

            return ok({
                content,
                remainingReads: payload.remainingReads
            });
        } catch (error) {
            return err(toEnvShareError(error, "unknown", "Failed to decrypt EnvShare link"));
        }
    }
}
