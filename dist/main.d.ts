/**
 * @param {import("puppeteer").Browser} browser
 * @param {import("puppeteer").Page | undefined} page
 * @returns {Promise<{close: () => Promise<void>, res: (method: string, url: string) => Promise<any>, key: (method: string, url: string) => Promise<string>, verification: string}>}
 */
export function createSession(browser: import("puppeteer").Browser, page: import("puppeteer").Page | undefined): Promise<{
    close: () => Promise<void>;
    res: (method: string, url: string) => Promise<any>;
    key: (method: string, url: string) => Promise<string>;
    verification: string;
}>;
/**
 * @param {import("puppeteer").Browser} browser
 * @param {import("puppeteer").Page | undefined} page
 * @param {string} input
 * @returns {Promise<{close: () => Promise<void>, res: (method: string, url: string) => Promise<any>, key: (method: string, url: string) => Promise<string>}>}
 */
export function createSessionOverride(browser: import("puppeteer").Browser, page: import("puppeteer").Page | undefined, input: string): Promise<{
    close: () => Promise<void>;
    res: (method: string, url: string) => Promise<any>;
    key: (method: string, url: string) => Promise<string>;
}>;
/**
 * @param {Record<string, string>} cookies
 * @param {import("puppeteer").LaunchOptions} options
 * @returns {Promise<({context, init}: {context: any, init: any}) => Promise<any>>}
 */
export function createAdapter(cookies: Record<string, string>, options: import("puppeteer").LaunchOptions): Promise<({ context, init }: {
    context: any;
    init: any;
}) => Promise<any>>;
import { decodeTransactionId } from "x-client-transaction-id-generater";
import { generateTransactionId } from "x-client-transaction-id-generater";
export { decodeTransactionId, generateTransactionId };
