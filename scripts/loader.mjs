import { ELEMENTS } from "./constants.mjs";

export const initLoader = (() => {
    const splittedWord = "Loading..."
        .split("")
        .map((letter) => `<b>${letter}</b>`)
        .join("");

    ELEMENTS.divLetters.innerHTML = splittedWord;
})();
