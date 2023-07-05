import { Person } from "./person.mjs";

export class Tumulto {
    PEOPLE = [];

    scene = null;

    constructor(scene) {
        this.scene = scene;
        this.generatePeople();
        this.scene.resize();
        this.scene.update();
    }

    generatePeople = () => {
        this.PEOPLE = [];

        const tileWidth = this.scene.IMG.naturalWidth / this.scene.config.rows;
        const tileHeight =
            this.scene.IMG.naturalHeight / this.scene.config.cols;
        const maxHeight = this.scene.CANVAS.height - tileHeight;

        let totalPeople = this.scene.config.rows * this.scene.config.cols;
        totalPeople =
            this.scene.config.amount < totalPeople
                ? this.scene.config.amount
                : totalPeople;

        for (let i = 0; i < totalPeople; i++) {
            this.PEOPLE.push(
                new Person(
                    this.scene.IMG,
                    [
                        (i % this.scene.config.rows) * tileWidth,
                        ((i / this.scene.config.rows) | 0) * tileHeight,
                        tileWidth,
                        tileHeight,
                    ],
                    this,
                    Math.random() * this.scene.CANVAS.width - tileWidth,
                    Math.random() * (this.scene.CANVAS.height - maxHeight) +
                        (maxHeight - 160)
                )
            );
        }

        this.PEOPLE.sort((a, b) => a.y - b.y);
    };

    update = () => {
        for (const person of this.PEOPLE) {
            person.animate(this.scene.CTX, this.scene.world);
        }
    };

    resize = () => {
        for (const person of this.PEOPLE) {
            person.reSet(true, true, true, true);
        }
    };
}
