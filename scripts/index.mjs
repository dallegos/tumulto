import { initLoader } from "./loader.mjs";
import { Configuration } from "./config.mjs";
import { Scene } from "./scene.mjs";
import { Ambient } from "./ambient.mjs";
import { Controls } from "./controls.mjs";

const scene = new Scene(Configuration.custom);
const ambient = new Ambient(scene);
new Controls(scene, ambient);
