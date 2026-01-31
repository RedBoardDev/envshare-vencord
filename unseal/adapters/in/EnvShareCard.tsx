/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Button, React, Text, useMemo, useState } from "@webpack/common";

import type { ClipboardPort } from "../../../shared/app/ports";
import { EnvShareError } from "../../../shared/domain/Errors";
import type { DecryptShareLink } from "../../app/DecryptShareLink";
import { extractLinksFromMessage } from "../../app/ExtractLinksFromMessage";
import { openDecryptModal } from "./DecryptModal";

export type UnsealUiDeps = {
    readonly decryptShareLink: DecryptShareLink;
    readonly clipboard: ClipboardPort;
};

type UnsealState =
    | "idle"
    | "loading"
    | "error"
    | "expired"
    | "no_reads";

const mapErrorToState = (error: EnvShareError): UnsealState => {
    switch (error.kind) {
        case "expired":
            return "expired";
        case "no_reads":
            return "no_reads";
        default:
            return "error";
    }
};

const iconForState = (state: UnsealState): string => {
    switch (state) {
        case "expired":
            return "⏱️";
        case "no_reads":
            return "🚫";
        case "error":
            return "🌐";
        default:
            return "🔐";
    }
};

const labelForState = (state: UnsealState): string => {
    switch (state) {
        case "expired":
            return "Link Expired";
        case "no_reads":
            return "No Reads";
        case "error":
            return "Network Error";
        default:
            return "EnvShare";
    }
};

const Spinner = () => (
    <div
        style={{
            width: 16,
            height: 16,
            border: "2px solid var(--text-muted)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "envshare-spin 1s linear infinite"
        }}
    />
);

const EnvShareToken = ({ token, deps }: { token: string; deps: UnsealUiDeps }) => {
    const [state, setState] = useState<UnsealState>("idle");

    const handleDecrypt = () => {
        if (state === "loading") return;

        setState("loading");

        void (async () => {
            const outcome = await deps.decryptShareLink.execute({ token });

            if (!outcome.ok) {
                const nextState = mapErrorToState(outcome.error);
                setState(nextState);
                return;
            }

            openDecryptModal(outcome.value.content, outcome.value.remainingReads, deps.clipboard);
            setState("idle");
        })().catch(error => {
            const mapped = error instanceof EnvShareError
                ? mapErrorToState(error)
                : "error";
            setState(mapped);
        });
    };

    const icon = iconForState(state);
    const label = labelForState(state);

    return (
        <Card defaultPadding style={{ border: state === "error" ? "1px solid var(--text-danger)" : undefined }}>
            <Flex alignItems="center" justifyContent="space-between">
                <Flex alignItems="center" gap={8}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <Text variant="text-md/bold">{label}</Text>
                </Flex>

                {state === "idle" && (
                    <Button size={Button.Sizes.SMALL} onClick={handleDecrypt}>Decrypt</Button>
                )}
                {state === "loading" && (
                    <Flex alignItems="center" gap={8}>
                        <Spinner />
                    </Flex>
                )}
                {(state === "expired" || state === "no_reads" || state === "error") && (
                    <Button size={Button.Sizes.SMALL} onClick={handleDecrypt} look={Button.Looks.OUTLINED} color={Button.Colors.PRIMARY}>
                        Retry
                    </Button>
                )}
            </Flex>
        </Card>
    );
};

export const createEnvShareAccessory = (deps: UnsealUiDeps) => {
    const EnvShareAccessory = ({ message }: { message: { content: string } }) => {
        const tokens = useMemo(() => extractLinksFromMessage(message.content), [message.content]);
        if (tokens.length === 0) return null;

        return (
            <>
                <style>{`
                    @keyframes envshare-spin { to { transform: rotate(360deg); } }
                `}</style>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {tokens.map((token, index) => (
                        <EnvShareToken key={`${token}-${index}`} token={token} deps={deps} />
                    ))}
                </div>
            </>
        );
    };

    return EnvShareAccessory;
};
