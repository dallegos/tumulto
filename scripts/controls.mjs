import { ELEMENTS } from "./constants.mjs";

export class Controls {
    scene = null;
    ambient = null;
    totalAmountDiv = null;

    constructor(scene, ambient) {
        this.scene = scene;
        this.ambient = ambient;

        ELEMENTS.configButtons.forEach((e) => {
            let [, key, subKey] = e.id.split("-");
            if (subKey) {
                e.value = this.scene.config[key][subKey];
            } else {
                e.value = this.scene.config[key];
            }

            if (key === "amount") {
                e.setAttribute(
                    "max",
                    this.scene.config.rows * this.scene.config.cols
                );
                ELEMENTS.totalAmount.innerHTML = e.value;
            }

            e.addEventListener("input", this.#changeValue);
        });

        ELEMENTS.selectSet.forEach((e) => {
            e.addEventListener("click", this.#changeSet);
        });

        ELEMENTS.debugButton.addEventListener("click", () => {
            this.scene.config.debug = !this.scene.config.debug;
        });

        ELEMENTS.pauseButton.addEventListener("click", (e) => {
            this.scene.config.pause = !this.scene.config.pause;
            e.target.innerHTML = this.scene.config.pause ? "RESUME" : "PAUSE";
        });

        ELEMENTS.snowButton.addEventListener("click", (e) => {
            this.ambient.makeItSnow();
        });

        ELEMENTS.rainButton.addEventListener("click", (e) => {
            this.ambient.makeItRain();
        });

        ELEMENTS.weatherButton.addEventListener("click", (e) => {
            this.ambient.removeWeather();
        });
    }

    #changeValue = (e) => {
        let [, key, subKey] = e.target.id.split("-");

        const value = Number.parseFloat(e.target.value);
        if (subKey) {
            this.scene.config[key][subKey] = value;
        } else {
            this.scene.config[key] = value;
        }

        if (key === "amount") {
            ELEMENTS.totalAmount.innerHTML = value;
        }

        this.scene.tumulto.generatePeople();
        this.scene.resize();
    };

    #changeSet = (e) => {
        let [, , number] = e.target.id.split("-");
        if (number) {
            this.scene.config = eval(`config${number}`);
            this.scene.reInit();
            //this.scene.tumulto.generatePeople();
        }
    };
}
