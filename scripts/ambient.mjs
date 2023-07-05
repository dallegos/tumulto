import { ELEMENTS } from "./constants.mjs";

export class Ambient {
    scene;
    CANVAS;
    CTX;
    particles = [];
    angle = 0;
    maxParticles = 500;

    constructor(scene) {
        this.scene = scene;

        this.CANVAS = ELEMENTS.ambientCanvas;
        this.CTX = this.CANVAS.getContext("2d");

        this.render();
        this.scene.resize(this.resize);

        window.addEventListener("resize", this.resize);
    }

    init() {
        this.resize();
    }

    resize = () => {
        this.CTX.scale(devicePixelRatio, devicePixelRatio);

        this.CANVAS.width = this.scene.world.width;
        this.CANVAS.height = this.scene.world.height;
    };

    makeItSnow = () => {
        this.removeWeather();
        this.particles = [];
        for (var i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.CANVAS.width,
                y: Math.random() * this.CANVAS.height,
                r: Math.random() * 4 + 1,
                d: Math.random() * this.maxParticles,
            });
        }

        this.changeBackground("rgb(124, 137, 153)");
        this.scene.config.snowing = true;
    };

    makeItRain = () => {
        this.removeWeather();
        this.CTX.strokeStyle = "rgba(250,250,250,1)";
        this.CTX.lineWidth = 1;
        this.CTX.lineCap = "round";

        var init = [];
        for (var i = 0; i < this.maxParticles; i++) {
            init.push({
                x: Math.random() * this.CANVAS.width,
                y: Math.random() * this.CANVAS.height,
                l: Math.random() * 1,
                xs: -2 + Math.random() * 2 + 2,
                ys: Math.random() * 5 + 10,
            });
        }

        for (var b = 0; b < this.maxParticles; b++) {
            this.particles[b] = init[b];
        }

        this.changeBackground("#292b2d");
        this.scene.config.raining = true;
    };

    render = () => {
        if (!this.scene.config.pause) {
            this.CTX.clearRect(0, 0, this.CANVAS.width, this.CANVAS.height);

            if (this.scene.config.raining) {
                this.#drawRain();
            }

            if (this.scene.config.snowing) {
                this.#drawSnow();
            }
        }

        requestAnimationFrame(this.render);
    };

    #drawRain = () => {
        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];
            this.CTX.beginPath();
            this.CTX.moveTo(p.x, p.y);
            this.CTX.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
            this.CTX.stroke();
        }

        this.#moveRain();
    };

    #moveRain = () => {
        for (var b = 0; b < this.particles.length; b++) {
            var particle = this.particles[b];
            particle.x += particle.xs;
            particle.y += particle.ys;
            if (
                particle.x > this.CANVAS.width ||
                particle.y > this.CANVAS.height
            ) {
                particle.x = Math.random() * this.CANVAS.width;
                particle.y = -20;
            }
        }
    };

    #drawSnow = () => {
        this.CTX.clearRect(0, 0, this.CANVAS.width, this.CANVAS.height);

        this.CTX.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.CTX.beginPath();
        for (var i = 0; i < this.maxParticles; i++) {
            var particle = this.particles[i];
            this.CTX.moveTo(particle.x, particle.y);
            this.CTX.arc(
                particle.x,
                particle.y,
                particle.r,
                0,
                Math.PI * 2,
                true
            );
        }
        this.CTX.fill();

        this.#moveSnow();
    };

    #moveSnow = () => {
        this.angle += 0.01;
        for (var i = 0; i < this.maxParticles; i++) {
            var particle = this.particles[i];
            particle.y +=
                Math.cos(this.angle + particle.d) + 1 + particle.r / 2;
            particle.x += Math.sin(this.angle) * 2;

            if (
                particle.x > this.CANVAS.width + 5 ||
                particle.x < -5 ||
                particle.y > this.CANVAS.height
            ) {
                if (i % 3 > 0) {
                    this.particles[i] = {
                        x: Math.random() * this.CANVAS.width,
                        y: -10,
                        r: particle.r,
                        d: particle.d,
                    };
                } else {
                    if (Math.sin(this.angle) > 0) {
                        this.particles[i] = {
                            x: -5,
                            y: Math.random() * this.CANVAS.height,
                            r: particle.r,
                            d: particle.d,
                        };
                    } else {
                        this.particles[i] = {
                            x: this.CANVAS.width + 5,
                            y: Math.random() * this.CANVAS.height,
                            r: particle.r,
                            d: particle.d,
                        };
                    }
                }
            }
        }
    };

    removeWeather = () => {
        this.changeBackground("#6699cc");
        this.scene.config.raining = false;
        this.scene.config.snowing = false;
    };

    changeBackground = (color) => {
        const body = ELEMENTS.body;
        body.style.backgroundColor = color;
    };
}
