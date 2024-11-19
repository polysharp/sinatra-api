import { init, isCuid } from "@paralleldrive/cuid2";

export const createId = init(
    {
        length: 8,
    },
);

export const isValidId = isCuid;
