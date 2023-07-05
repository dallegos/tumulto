import { getRandomName, getRandomNumber } from "./utils.mjs";

export class Person {
    tumulto = null;

    constructor(img, rect, tumulto, x = 0, y = 0) {
        this.img = img;
        this.rect = rect;
        this.tumulto = tumulto;

        this.x = x;
        this.y = this.startY = y;

        this.name = getRandomName();

        if (this.tumulto.scene.config.maxOffsetY) {
            this.maxOffsetY = getRandomNumber(
                this.tumulto.scene.config.maxOffsetY.min,
                this.tumulto.scene.config.maxOffsetY.max,
                false
            );
        } else {
            this.maxOffsetY = getRandomNumber(10, 20);
        }

        if (this.tumulto.scene.config.xVelocity) {
            this.dx = getRandomNumber(
                this.tumulto.scene.config.xVelocity.min,
                this.tumulto.scene.config.xVelocity.max,
                false
            );
        } else {
            this.dx =
                this.tumulto.scene.config.xVelocity ||
                Number.parseFloat(Math.random() * 3) + 2.5;
        }

        if (this.tumulto.scene.config.yVelocity) {
            this.dy = getRandomNumber(
                this.tumulto.scene.config.yVelocity.min,
                this.tumulto.scene.config.yVelocity.max,
                false
            );
        } else {
            this.dy =
                this.tumulto.scene.config.yVelocity ||
                Number.parseFloat(Math.random() * 0.5) + 1;
        }

        this.scaleX = this.direction = Math.random() > 0.5 ? 1 : -1;

        this.reSet(true, true, true, true);
    }

    set rect(rect) {
        this.width = rect[2];
        this.height = rect[3];

        this.args = [this.img, ...rect, 0, 0, this.width, this.height];
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scaleX, 1);
        ctx.drawImage(...this.args);

        if (this.tumulto.scene.config.debug) {
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "red";
            ctx.rect(0, 0, this.width, this.height);
            ctx.stroke();

            ctx.font = "bold 12px Arial";
            ctx.fillStyle = "red";

            if (this.direction < 0) {
                ctx.scale(-1, 1);
                ctx.fillText(
                    `X: ${Math.round(this.x)} - Y: ${Math.round(this.y)}`,
                    -this.width,
                    -10
                );

                ctx.textAlign = "right";
                ctx.fillText(`${this.name}`, -10, 20);
            } else {
                ctx.fillText(
                    `X: ${Math.round(this.x)} - Y: ${Math.round(this.y)}`,
                    0,
                    -10
                );

                ctx.textAlign = "right";
                ctx.fillText(`${this.name}`, this.width - 10, 20);
            }
        }

        ctx.restore();
    }

    reSet = (
        resetX = false,
        resetY = false,
        resetDirection = false,
        sort = false
    ) => {
        if (resetX) {
            this.x = getRandomNumber(
                -this.width,
                this.tumulto.scene.world.width,
                false
            );
        }

        if (resetY) {
            const minimumHeight =
                this.tumulto.scene.world.height -
                Number.parseFloat(this.height / 2.5);
            this.y = this.startY = getRandomNumber(
                this.tumulto.scene.world.height -
                    this.height -
                    this.tumulto.scene.config.topOffset,
                minimumHeight,
                false
            );
        }

        if (resetDirection) {
            this.scaleX = this.direction = Math.random() > 0.5 ? 1 : -1;
        }

        if (sort) {
            this.tumulto.PEOPLE.sort((a, b) => a.y - b.y);
        }
    };

    reInit(world) {
        if (this.direction > 0) {
            this.x = -this.width;
            this.scaleX = 1;
        } else {
            this.scaleX = -1;
            this.x = Number.parseInt(world.width) + this.width;
        }
    }

    animate(ctx, world) {
        if (this.x > world.width + this.width + 50 || this.x < -this.width) {
            this.reSet(false, false, true);
            this.reInit(world);
            return;
        }

        if (this.direction > 0) {
            this.x += this.dx;
        } else {
            this.x -= this.dx;
        }

        this.y += this.dy;

        if (this.y > this.startY + this.maxOffsetY) {
            this.dy = -this.dy;
        } else if (this.y < this.startY) {
            this.dy = Math.abs(this.dy);
        }

        this.render(ctx, world);
    }
}
