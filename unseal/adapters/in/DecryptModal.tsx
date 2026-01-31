/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@components/Flex";
import { Heading } from "@components/Heading";
import { closeModal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import { findCssClassesLazy } from "@webpack";
import { Button, React,Text } from "@webpack/common";

import type { ClipboardPort } from "../../../shared/app/ports";

const CodeContainerClasses = findCssClassesLazy("markup", "codeContainer");

export const openDecryptModal = (
    content: string,
    remainingReads: number | null,
    clipboard: ClipboardPort
) => {
    openModal(props => (
        <ModalRoot {...props}>
            <ModalHeader>
                <Heading variant="heading-lg/semibold" style={{ flex: 1 }}>Decrypted</Heading>
                <ModalCloseButton onClick={() => closeModal(props.modalKey)} />
            </ModalHeader>
            <ModalContent>
                <div style={{ padding: "16px 0" }}>
                    {remainingReads !== null && (
                        <Text variant="text-xs/normal" style={{ color: "var(--text-success)", marginBottom: 12, display: "block" }}>
                            {remainingReads} read{remainingReads !== 1 ? "s" : ""} remaining
                        </Text>
                    )}
                    <div className={CodeContainerClasses.markup} style={{ padding: 12, maxHeight: 300, overflow: "auto", borderRadius: 4 }}>
                        <pre style={{ margin: 0, fontFamily: "var(--font-code, monospace)", fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.5 }}>
                            {content}
                        </pre>
                    </div>
                </div>
            </ModalContent>
            <ModalFooter>
                <Flex justify="flex-end">
                    <Button onClick={() => clipboard.writeText(content)}>Copy</Button>
                </Flex>
            </ModalFooter>
        </ModalRoot>
    ));
};
