/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@components/Flex";
import { Heading } from "@components/Heading";
import { closeModal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import { Button, Forms, React, Select, Text, TextArea, TextInput, useMemo, useState } from "@webpack/common";

import type { ChatInputPort, ClipboardPort, SelectionPort } from "../../../shared/app/ports";
import { EnvShareError } from "../../../shared/domain/Errors";
import type { CreateShareLink } from "../../app/CreateShareLink";
import { SharePolicy } from "../../domain/SharePolicy";

const TTL_OPTIONS = [
    { label: "Mins", value: "minutes" },
    { label: "Hours", value: "hours" },
    { label: "Days", value: "days" }
] as const;

type TtlUnit = typeof TTL_OPTIONS[number]["value"];

type ShareModalDeps = {
    readonly createShareLink: CreateShareLink;
    readonly clipboard: ClipboardPort;
    readonly chatInput: ChatInputPort;
    readonly selection: SelectionPort;
};

type ShareModalProps = {
    readonly deps: ShareModalDeps;
    readonly selectionText: string;
    readonly initialContent?: string;
    readonly onClose: () => void;
};

const parseNumber = (value: string, fallback: number): number => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const formatInsertText = (selectionText: string, url: string): string =>
    selectionText.length > 0 ? `[${selectionText}](${url})` : url;

export function ShareModal({ deps, selectionText, initialContent = "", onClose }: ShareModalProps) {
    const [content, setContent] = useState(initialContent);
    const [reads, setReads] = useState(999);
    const [ttlValue, setTtlValue] = useState(7);
    const [ttlUnit, setTtlUnit] = useState<TtlUnit>("days");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const ttlSeconds = useMemo(() => {
        const multiplier = ttlUnit === "days" ? 86400 : ttlUnit === "hours" ? 3600 : 60;
        return Math.max(60, ttlValue * multiplier);
    }, [ttlValue, ttlUnit]);

    const handleShare = async () => {
        if (!content.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            const policy = SharePolicy.create({ ttlSeconds, reads });
            const outcome = await deps.createShareLink.execute({
                plaintext: content,
                policy
            });

            if (!outcome.ok) {
                throw outcome.error;
            }

            setResult(outcome.value.url);
        } catch (error) {
            const message = error instanceof EnvShareError ? error.message : "EnvShare error";
            console.error("EnvShareBridge store error:", message, error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!result) return;
        try {
            await deps.clipboard.writeText(result);
        } catch (error) {
            console.error("EnvShareBridge clipboard error:", error);
        }
    };

    const insertLink = () => {
        if (!result) return;
        const textToInsert = formatInsertText(selectionText, result);
        deps.chatInput.insertText(textToInsert);
        onClose();
    };

    return (
        <>
            <ModalHeader>
                <Heading variant="heading-lg/semibold" style={{ flex: 1 }}>EnvShare</Heading>
                <ModalCloseButton onClick={onClose} />
            </ModalHeader>
            <ModalContent>
                <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <Forms.FormTitle tag="h5">Content</Forms.FormTitle>
                        <TextArea
                            value={content}
                            onChange={setContent}
                            placeholder="Paste your content here..."
                            rows={6}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 70 }}>
                            <Forms.FormTitle tag="h5">Reads</Forms.FormTitle>
                            <TextInput
                                type="number"
                                min={0}
                                value={String(reads)}
                                onChange={value => setReads(Math.max(0, parseNumber(value, reads)))}
                            />
                        </div>
                        <div>
                            <Forms.FormTitle tag="h5">Expires in</Forms.FormTitle>
                            <div style={{ display: "flex", gap: 4 }}>
                                <TextInput
                                    type="number"
                                    min={1}
                                    style={{ width: 80 }}
                                    value={String(ttlValue)}
                                    onChange={value => setTtlValue(Math.max(1, parseNumber(value, ttlValue)))}
                                />
                                <Select
                                    options={TTL_OPTIONS}
                                    select={setTtlUnit}
                                    isSelected={value => value === ttlUnit}
                                    serialize={value => value}
                                    maxVisibleItems={5}
                                    closeOnSelect={true}
                                />
                            </div>
                        </div>
                    </div>

                    {result && (
                        <div>
                            <Text variant="text-xs/normal" style={{ color: "var(--text-success)", marginBottom: 8, display: "block" }}>Link created!</Text>
                            <div style={{
                                padding: 10,
                                background: "var(--background-secondary)",
                                border: "1px solid var(--background-tertiary)",
                                borderRadius: 4,
                                wordBreak: "break-all",
                                fontFamily: "var(--font-code)",
                                fontSize: 12
                            }}>
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            </ModalContent>
            <ModalFooter>
                <Flex justify="flex-end" gap={8}>
                    {result ? (
                        <>
                            <Button onClick={copyToClipboard}>Copy</Button>
                            <Button onClick={insertLink}>Insert</Button>
                        </>
                    ) : (
                        <Button disabled={!content.trim() || loading} onClick={handleShare}>
                            {loading ? "Creating..." : "Create Link"}
                        </Button>
                    )}
                </Flex>
            </ModalFooter>
        </>
    );
}

export const createShareModalController = (deps: ShareModalDeps) => ({
    openShareModal: (initialContent?: string) => {
        const selectionText = deps.selection.getSelectionText();

        openModal(props => (
            <ModalRoot {...props}>
                <ShareModal
                    deps={deps}
                    selectionText={selectionText}
                    initialContent={initialContent}
                    onClose={() => closeModal(props.modalKey)}
                />
            </ModalRoot>
        ));
    }
});
