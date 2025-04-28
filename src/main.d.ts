import { Browser, LaunchOptions, Page } from "puppeteer";

interface Cookie {
  [k: string]: string;
}

interface Session {
  close: () => Promise<void>;
  res: (method: string, url: string) => Promise<string>;
}

export function createSession(browser: Browser, page?: Page): Promise<Session>;
export function createAdapter(cookies: Cookie, options: LaunchOptions): Promise<(requestContext: any) => Promise<any>>;
export function decodeTransactionId(transactionId: string): {
  keyBytes: Buffer;
  time: Date;
  hashBytes: Buffer;
  additional: number;
};
