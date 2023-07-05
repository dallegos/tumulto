import { Configuration } from "./config.mjs";
import { loadImage } from "./utils.mjs";
import { Tumulto } from "./tumulto.mjs";
import { ELEMENTS } from "./constants.mjs";

export class Scene {
    tumulto = null;

    ambient = null;

    IMG;

    CANVAS;

    CTX;

    config = Configuration.default;

    world = {
        width: 0,
        height: 0,
    };

    constructor(config) {
        this.config = {
            ...this.config,
            ...config,
        };

        this.CANVAS = ELEMENTS.peopleCanvas;
        this.CTX = this.CANVAS.getContext("2d");

        this.#init();
        window.addEventListener("resize", this.resize);
    }

    #init = async () => {
        this.IMG = await loadImage(this.config.src);
        this.resize();
        this.tumulto = new Tumulto(this);
    };

    reInit = async () => {
        this.IMG = await loadImage(this.config.src);
        this.tumulto = new Tumulto(this);
        this.tumulto.generatePeople();
        this.resize();
    };

    resize = async (callback = null) => {
        this.world.width = this.CANVAS.clientWidth;
        this.world.height = this.CANVAS.clientHeight;

        this.CTX.scale(devicePixelRatio, devicePixelRatio);

        this.CANVAS.width = this.world.width;
        this.CANVAS.height = this.world.height;

        if (this.tumulto) {
            this.tumulto.resize();
        }

        if (typeof callback === "function") callback();
    };

    update = () => {
        if (!this.config.pause) {
            this.CTX.save();
            this.CTX.setTransform(1, 0, 0, 1, 0, 0);
            this.CTX.clearRect(
                0,
                0,
                this.world.width * devicePixelRatio,
                this.world.height * devicePixelRatio
            );
            this.CTX.restore();

            if (this.tumulto) {
                this.tumulto.update();
            }
        }

        requestAnimationFrame(this.update);
    };
}
