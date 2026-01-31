/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const B58_MAP = new Map(
    Array.from(B58_ALPHABET).map((char, index) => [char, index] as const)
);

const appendDigits = (digits: readonly number[], carry: number): readonly number[] => {
    let nextDigits = digits;
    let nextCarry = carry;

    while (nextCarry > 0) {
        const digit = nextCarry % 58;
        nextCarry = Math.floor(nextCarry / 58);
        nextDigits = nextDigits.concat([digit]);
    }

    return nextDigits;
};

const appendBytes = (bytes: readonly number[], carry: number): readonly number[] => {
    let nextBytes = bytes;
    let nextCarry = carry;

    while (nextCarry > 0) {
        const byte = nextCarry & 0xff;
        nextCarry >>= 8;
        nextBytes = nextBytes.concat([byte]);
    }

    return nextBytes;
};

export const b58Encode = (data: Uint8Array): string => {
    if (data.length === 0) return "";

    const bytes = Array.from(data);
    const firstNonZero = bytes.findIndex(byte => byte !== 0);
    const zeros = firstNonZero === -1 ? bytes.length : firstNonZero;

    const digits = bytes.reduce<readonly number[]>((acc, byte) => {
        const reduced = acc.reduce(
            (state, digit) => {
                const carryValue = state.carry + (digit << 8);
                const nextDigit = carryValue % 58;
                const nextCarry = Math.floor(carryValue / 58);
                return {
                    carry: nextCarry,
                    digits: state.digits.concat([nextDigit])
                } as const;
            },
            { carry: byte, digits: [] as readonly number[] }
        );

        return appendDigits(reduced.digits, reduced.carry);
    }, [0]);

    const reversedDigits = digits.map((_, index) => digits[digits.length - 1 - index]);
    const encoded = reversedDigits.map(digit => B58_ALPHABET[digit]).join("");

    return `${"1".repeat(zeros)}${encoded}`;
};

export const b58Decode = (value: string): Uint8Array => {
    if (!value) return new Uint8Array(0);

    const chars = Array.from(value);
    const bytes = chars.reduce<readonly number[]>((acc, char) => {
        const digit = B58_MAP.get(char);
        if (digit == null) throw new Error(`Invalid base58 character: ${char}`);

        const reduced = acc.reduce(
            (state, byte) => {
                const carryValue = state.carry + byte * 58;
                const nextByte = carryValue & 0xff;
                const nextCarry = carryValue >> 8;
                return {
                    carry: nextCarry,
                    bytes: state.bytes.concat([nextByte])
                } as const;
            },
            { carry: digit, bytes: [] as readonly number[] }
        );

        return appendBytes(reduced.bytes, reduced.carry);
    }, [0]);

    const firstNonZero = chars.findIndex(char => char !== "1");
    const zeros = firstNonZero === -1 ? chars.length : firstNonZero;

    const reversedBytes = bytes.map((_, index) => bytes[bytes.length - 1 - index]);
    const prefixZeros = Array.from({ length: zeros }, () => 0);

    return Uint8Array.from(prefixZeros.concat(reversedBytes));
};
