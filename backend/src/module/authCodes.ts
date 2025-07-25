
import crypto from "crypto";

const requestCodes = new Map<number, AuthCodeEntry>();

// Could be stored in a config / env value
const AUTH_TIME_DIFF_MAX = 900_000;

export type AuthCodeEntry = {
    code: string;
    generatedAt: Date;
    isAuthenticated: boolean;
    authenticatedAt: Date | null;
    attempted: number;
};

function generateAuthCode(): string {
    return crypto.randomInt(0, 999999).toString().padStart(6, '0');
}

export function getAuthCode(id: number): AuthCodeEntry | null {
    return requestCodes.get(id) || null;
}

export function setAuthCode(id: number): void {
    let currDate = new Date()
    let newCodeEntry: AuthCodeEntry = {
        code: generateAuthCode(),
        generatedAt: currDate,
        isAuthenticated: false,
        authenticatedAt: null,
        attempted: 0
    };

    console.log(`[${currDate.toISOString()}] Generated code for user id: ${id}, ${newCodeEntry.code}`);

    requestCodes.set(id, newCodeEntry);
}

export function setAuthenticatedAdditionalInfo(id: number): void {
    let codeEntry = requestCodes.get(id);

    // Should work since it's a reference to an object
    if (codeEntry) {
        codeEntry.isAuthenticated = true;
        codeEntry.authenticatedAt = new Date();
    }
}

export function checkIsAuthenticatedAdditionalInfo(id: number): boolean {
    let authenticated = false;

    let codeEntry = requestCodes.get(id);
    if (codeEntry) {
        let authTimeDiff = new Date().getTime() - (codeEntry.authenticatedAt?.getTime() || 0);
        if (codeEntry.isAuthenticated && authTimeDiff <= AUTH_TIME_DIFF_MAX) {
            authenticated = true;
        }
    }

    return authenticated;
}

