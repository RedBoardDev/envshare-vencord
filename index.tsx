/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

import { createSealChatButton } from "./seal/adapters/in/ChatBarButton";
import { EnvShareStoreNative } from "./seal/adapters/out/EnvShareStoreNative";
import { CreateShareLink } from "./seal/app/CreateShareLink";
import { ChatInputAdapter } from "./shared/adapters/out/ChatInputAdapter";
import { ClipboardAdapter } from "./shared/adapters/out/ClipboardAdapter";
import { SelectionAdapter } from "./shared/adapters/out/SelectionAdapter";
import { WebCryptoAdapter } from "./shared/adapters/out/WebCryptoAdapter";
import { createEnvShareAccessory } from "./unseal/adapters/in/EnvShareCard";
import { EnvShareLoadNative } from "./unseal/adapters/out/EnvShareLoadNative";
import { DecryptShareLink } from "./unseal/app/DecryptShareLink";

export const settings = definePluginSettings({
    showAccessory: {
        type: OptionType.BOOLEAN,
        description: "Show EnvShare button under messages with /unseal# links",
        default: true
    },
    showChatbarButton: {
        type: OptionType.BOOLEAN,
        description: "Show EnvShare button in chatbar",
        default: true
    }
});

const cryptoAdapter = new WebCryptoAdapter();
const storeAdapter = new EnvShareStoreNative();
const loadAdapter = new EnvShareLoadNative();
const clipboardAdapter = new ClipboardAdapter();
const chatInputAdapter = new ChatInputAdapter();
const selectionAdapter = new SelectionAdapter();

const createShareLink = new CreateShareLink({
    crypto: cryptoAdapter,
    store: storeAdapter
});

const decryptShareLink = new DecryptShareLink({
    crypto: cryptoAdapter,
    load: loadAdapter
});

const sealChatButton = createSealChatButton(
    {
        createShareLink,
        clipboard: clipboardAdapter,
        chatInput: chatInputAdapter,
        selection: selectionAdapter
    },
    settings
);

const envShareAccessory = createEnvShareAccessory({
    decryptShareLink,
    clipboard: clipboardAdapter
});

export default definePlugin({
    name: "EnvShareBridge",
    description: "Decrypt and create envshare.dev links directly in Discord",
    authors: [Devs.Vendicated],

    settings,

    renderMessageAccessory: ({ message }) => {
        if (!settings.store.showAccessory) return null;
        return envShareAccessory({ message });
    },

    chatBarButton: {
        icon: sealChatButton.icon,
        render: sealChatButton.render
    }
});
