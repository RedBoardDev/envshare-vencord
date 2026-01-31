# EnvShareBridge

EnvShareBridge is a Vencord user plugin that can crypt and decrypt [envshare.dev](https://envshare.dev). links directly inside Discord.

## Features

- Create encrypted envshare.dev links from the chat bar
- Decrypt envshare.dev links inline under messages
- Optional markdown insertion when text is selected
- Configurable TTL and read limits

## Structure

- `shared/`: domain model, ports, and shared adapters
- `seal/`: create/share flow and UI
- `unseal/`: decrypt flow and UI
- `index.tsx`: plugin entrypoint and wiring
- `native.ts`: native bridge for API calls

## Settings

- `showAccessory`: show the decrypt card under messages
- `showChatbarButton`: show the share button in the chat bar

## Usage

- Click the chat bar button to open the share modal and generate a link
- Click the decrypt card under a message to reveal its contents

## Development

- Keep domain logic in `shared/`
- Validate external/native inputs before use
- Use ports/adapters to keep UI and domain decoupled
