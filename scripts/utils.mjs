import { ELEMENTS, RANDOM_NAMES } from "./constants.mjs";

export function getRandomName() {
    return RANDOM_NAMES[getRandomNumber(0, RANDOM_NAMES.length)];
}

export function getRandomNumber(min, max, rounded = true) {
    if (rounded) {
        return Number.parseInt(
            Math.floor((min + Math.random() * (max - min)).toFixed(2))
        );
    } else {
        return Number.parseFloat(
            (min + Math.random() * (max - min)).toFixed(2)
        );
    }
}

export async function loadImage(imgSrc) {
    const divLoader = ELEMENTS.divLoader;

    ELEMENTS.body.appendChild(divLoader);

    divLoader.style.display = "flex";
    window.setTimeout(() => {
        divLoader.classList.add("active");
    }, 1);

    let img = new Image();
    img.src = imgSrc;
    await img.decode();

    await sleep(500);

    divLoader.classList.remove("active");

    window.setTimeout(() => {
        divLoader.style.display = "none";
    }, 600);

    return img;
}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
