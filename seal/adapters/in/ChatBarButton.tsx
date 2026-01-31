/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton, type ChatBarButtonFactory } from "@api/ChatButtons";
import type { IconComponent } from "@utils/types";

import type { ChatInputPort, ClipboardPort, SelectionPort } from "../../../shared/app/ports";
import type { CreateShareLink } from "../../app/CreateShareLink";
import { createShareModalController } from "./ShareModal";

export type SealUiDeps = {
    readonly createShareLink: CreateShareLink;
    readonly clipboard: ClipboardPort;
    readonly chatInput: ChatInputPort;
    readonly selection: SelectionPort;
};

type SettingsLike = {
    use: <K extends readonly string[]>(keys: K) => { [Key in K[number]]: boolean };
};

export const SealIcon: IconComponent = ({ width = 20, height = 20, className }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
);

export const createSealChatButton = (
    deps: SealUiDeps,
    settings: SettingsLike
) => {
    const controller = createShareModalController(deps);

    const render: ChatBarButtonFactory = ({ isMainChat, isAnyChat }) => {
        const { showChatbarButton } = settings.use(["showChatbarButton"] as const);

        if (!isMainChat && !isAnyChat) return null;
        if (!showChatbarButton) return null;

        return (
            <ChatBarButton tooltip="EnvShare" onClick={() => controller.openShareModal()}>
                <SealIcon />
            </ChatBarButton>
        );
    };

    return {
        icon: SealIcon,
        render
    } as const;
};
