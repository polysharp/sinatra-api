import { init, isCuid } from "@paralleldrive/cuid2";

export const createId = (length: number = 8) => init({ length })();

export const isValidId = isCuid;
