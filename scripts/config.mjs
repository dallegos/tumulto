import { LOCAL_SHEET_URL, PEEPS_SHEET_URL } from "./constants.mjs";

export const Configuration = {
    default: {
        src: PEEPS_SHEET_URL,
        rows: 15,
        cols: 7,
        amount: 15 * 7,
        xVelocity: {
            min: 2,
            max: 6,
        },
        yVelocity: {
            min: 0.5,
            max: 1.5,
        },
        maxOffsetY: {
            min: 10,
            max: 15,
        },
        topOffset: 200,
        debug: 0,
        pause: false,
    },
    custom: {
        src: LOCAL_SHEET_URL,
        rows: 20,
        cols: 4,
        amount: 40,
        xVelocity: {
            min: 2,
            max: 8,
        },
        yVelocity: {
            min: 1,
            max: 2,
        },
        maxOffsetY: {
            min: 5,
            max: 25,
        },
        topOffset: 150,
    },
};
