class Scene {
  tumulto = null;

  ambient = null;

  IMG;

  CANVAS;

  CTX;

  config = {
    src: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/open-peeps-sheet.png",
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
  };

  world = {
    width: 0,
    height: 0,
  };

  constructor(config) {
    this.config = {
      ...this.config,
      ...config,
    };

    this.CANVAS = document.querySelector("#peopleCanvas");
    this.CTX = this.CANVAS.getContext("2d");

    this.#init();
    window.addEventListener("resize", this.resize);
  }

  #init = async () => {
    this.IMG = await Utils.loadImage(this.config.src);
    this.resize();
    this.tumulto = new Tumulto(this);
  };

  reInit = async () => {
    this.IMG = await Utils.loadImage(this.config.src);
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

    if (callback) {
      callback();
    }
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

class Tumulto {
  // listado de personas
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
    const tileHeight = this.scene.IMG.naturalHeight / this.scene.config.cols;
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

class Person {
  tumulto = null;

  constructor(img, rect, tumulto, x = 0, y = 0) {
    this.img = img;
    this.rect = rect;
    this.tumulto = tumulto;

    this.x = x;
    this.y = this.startY = y;

    this.name = Utils.getRandomName();

    if (this.tumulto.scene.config.maxOffsetY) {
      this.maxOffsetY = Utils.getRandomNumber(
        this.tumulto.scene.config.maxOffsetY.min,
        this.tumulto.scene.config.maxOffsetY.max,
        false
      );
    } else {
      this.maxOffsetY = Utils.getRandomNumber(10, 20);
    }

    if (this.tumulto.scene.config.xVelocity) {
      this.dx = Utils.getRandomNumber(
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
      this.dy = Utils.getRandomNumber(
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
      this.x = Utils.getRandomNumber(
        -this.width,
        this.tumulto.scene.world.width,
        false
      );
    }

    if (resetY) {
      const minimumHeight =
        this.tumulto.scene.world.height - Number.parseFloat(this.height / 2.5);
      this.y = this.startY = Utils.getRandomNumber(
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

class Utils {
  static NAMES = [
    "Lancelot",
    "Olga",
    "Loella",
    "Paige",
    "Ayn",
    "Brien",
    "Eilis",
    "Donica",
    "Vanya",
    "Titus",
    "Gabriel",
    "Hannah",
    "Nannette",
    "Mateo",
    "Rollo",
    "Sarena",
    "Daryl",
    "Anatol",
    "Romona",
    "Amalea",
    "Octavia",
    "Nikoletta",
    "Iona",
    "Elladine",
    "Wendy",
    "Dud",
    "Caz",
    "Jaymee",
    "Vivienne",
    "Giacopo",
    "Selina",
    "Marcie",
    "Brodie",
    "Windy",
    "Gaspard",
    "Benji",
    "Cly",
    "Wini",
    "Karola",
    "Adriaens",
    "Monte",
    "Cheri",
    "Skippy",
    "Sherill",
    "Johnny",
    "Sadie",
    "Mina",
    "Rozamond",
    "Wiley",
    "Tiffani",
    "Elnar",
    "Emilie",
    "Emelia",
    "Andrea",
    "Tibold",
    "Llywellyn",
    "Athene",
    "Allan",
    "Leopold",
    "Lotti",
    "Bernelle",
    "Suzie",
    "Abbey",
    "Mikol",
    "Jessika",
    "Ade",
    "Chen",
    "Karita",
    "Chandal",
    "Clovis",
    "Iggy",
    "Kippar",
    "Hynda",
    "Ramsay",
    "Elfrieda",
    "Fayette",
    "Tatiania",
    "Johna",
    "Gay",
    "Hatti",
    "Garrett",
    "Robbyn",
    "Shayla",
    "Alair",
    "Andria",
    "Sarge",
    "Fred",
    "Janeta",
    "Sherline",
    "Darb",
    "Othella",
    "Alexandro",
    "Deva",
    "Teri",
    "Anabella",
    "Carmelita",
    "Thadeus",
    "Kimbra",
    "Clio",
    "Fair",
    "Martie",
    "Fidole",
    "Livia",
    "Clarence",
    "Lucais",
    "Cindra",
    "Wayland",
    "Meredith",
    "Keith",
    "Gray",
    "Lulita",
    "Doretta",
    "Carlota",
    "Thaddeus",
    "Flynn",
    "Hertha",
    "Sarina",
    "Clayborn",
    "Gwyn",
    "Dorian",
    "Elroy",
    "Lew",
    "Cristobal",
    "Valentijn",
    "Brew",
    "Bernarr",
    "Jojo",
    "Lavinie",
    "Cassandry",
    "Tracy",
    "Joceline",
    "Sibbie",
    "Pierce",
    "Ulric",
    "Jena",
    "Aridatha",
    "Asia",
    "Vernon",
    "Bobby",
    "Betta",
    "Miller",
    "Hermy",
    "Edna",
    "Sherm",
    "Janna",
    "Fax",
    "Hildegarde",
    "Glen",
    "Leandra",
    "Matti",
    "Don",
    "Gabriello",
    "Jaynell",
    "Hill",
    "Bron",
    "Corrie",
    "Rriocard",
    "Gloriana",
    "Vick",
    "Missy",
    "Rozanna",
    "Keeley",
    "Codie",
    "Millisent",
    "Christina",
    "Normand",
    "Kerr",
    "Ladonna",
    "Sosanna",
    "Vittoria",
    "Jacquette",
    "Karry",
    "Krystal",
    "Trueman",
    "Geoffrey",
    "Nessa",
    "Delainey",
    "Cassaundra",
    "Monica",
    "Josephina",
    "Davidson",
    "Lewie",
    "Angele",
    "Shela",
    "Simonette",
    "Bernardina",
    "Libbie",
    "Rozina",
    "Maryl",
    "Joyann",
    "Tova",
    "Cathie",
    "Krystalle",
    "Ferdie",
    "Christiane",
    "Quintana",
    "Rick",
    "Adelbert",
    "Kassia",
    "Georgi",
    "Kale",
    "Elsey",
    "Layla",
    "Bevin",
    "Frederick",
    "Orren",
    "Rees",
    "Aigneis",
    "Demetri",
    "Germaine",
    "Callie",
    "Franz",
    "Cindee",
    "Kimbell",
    "Glyn",
    "Rubie",
    "Nydia",
    "Tanner",
    "Bobbe",
    "Grannie",
    "Janette",
    "Kaitlynn",
    "Taylor",
    "Shamus",
    "Christoffer",
    "Nerita",
    "Estel",
    "Laurie",
    "Kathrine",
    "Jodi",
    "Izzy",
    "Helenka",
    "Dorey",
    "Jaine",
    "Giordano",
    "Hendrick",
    "Portia",
    "Lorinda",
    "Nanette",
    "Cloe",
    "Sol",
    "Fayre",
    "Averyl",
    "Aloysius",
    "Joycelin",
    "Tome",
    "Stevana",
    "Gav",
    "Shandy",
    "Linnet",
    "Fredric",
    "Adel",
    "Farrell",
    "Anthia",
    "Kerrill",
    "Emmanuel",
    "Casar",
    "Abrahan",
    "Taffy",
    "Waldo",
    "Rhianon",
    "Sonya",
    "Leona",
    "Eustacia",
    "Jonell",
    "Alikee",
    "Tiertza",
    "Sheree",
    "Seumas",
    "Gwenni",
    "Livia",
    "Russ",
    "Abdul",
    "Dalton",
    "Ethelda",
    "Clare",
    "Standford",
    "Niel",
    "Barney",
    "Ferguson",
    "Lusa",
    "Becky",
    "Wilton",
    "Terri",
    "Fran",
    "Alvy",
    "Garrick",
    "Asia",
    "Lydie",
    "Bernita",
    "Toby",
    "Zonnya",
    "Lettie",
    "Lark",
    "Archibald",
    "Cathyleen",
    "Inga",
    "Merrile",
    "Ethyl",
    "Ronda",
  ];

  static getRandomName = () => {
    return this.NAMES[this.getRandomNumber(0, this.NAMES.length)];
  };

  static getRandomNumber = (min, max, rounded = true) => {
    if (rounded) {
      return Number.parseInt(
        Math.floor((min + Math.random() * (max - min)).toFixed(2))
      );
    } else {
      return Number.parseFloat((min + Math.random() * (max - min)).toFixed(2));
    }
  };

  static loadImage = async (imgSrc) => {
    const divLoader = document.getElementById("loader");

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(divLoader);

    divLoader.style.display = "flex";
    window.setTimeout(() => {
      divLoader.classList.add("active");
    }, 1);

    let img = new Image();
    img.src = imgSrc;
    await img.decode();

    await this.sleep(500);

    divLoader.classList.remove("active");

    window.setTimeout(() => {
      divLoader.style.display = "none";
    }, 600);

    return img;
  };

  static sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
}

class Controlls {
  scene = null;
  ambient = null;
  totalAmountDiv = null;

  constructor(scene, ambient) {
    this.scene = scene;
    this.ambient = ambient;

    this.totalAmountDiv = document.getElementById("total-amount");

    document.querySelectorAll('[id^="config-"]').forEach((e) => {
      let [, key, subKey] = e.id.split("-");
      if (subKey) {
        e.value = this.scene.config[key][subKey];
      } else {
        e.value = this.scene.config[key];
      }

      if (key === "amount") {
        e.setAttribute("max", this.scene.config.rows * this.scene.config.cols);
        this.totalAmountDiv.innerHTML = e.value;
      }

      e.addEventListener("input", this.#changeValue);
    });

    document.querySelectorAll('[id^="select-set-"]').forEach((e) => {
      e.addEventListener("click", this.#changeSet);
    });

    const debugButton = document.getElementById("toggleDebug");
    debugButton.addEventListener("click", () => {
      this.scene.config.debug = !this.scene.config.debug;
    });

    const pauseButton = document.getElementById("togglePause");
    pauseButton.addEventListener("click", (e) => {
      this.scene.config.pause = !this.scene.config.pause;
      e.target.innerHTML = this.scene.config.pause ? "RESUME" : "PAUSE";
    });

    const snowButton = document.getElementById("toggleSnow");
    snowButton.addEventListener("click", (e) => {
      this.ambient.makeItSnow();
    });

    const rainButton = document.getElementById("toggleRain");
    rainButton.addEventListener("click", (e) => {
      this.ambient.makeItRain();
    });

    const weatherButton = document.getElementById("toggleWeather");
    weatherButton.addEventListener("click", (e) => {
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
      this.totalAmountDiv.innerHTML = value;
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

class Ambient {
  scene;
  CANVAS;
  CTX;
  particles = [];
  angle = 0;
  maxParticles = 500;

  constructor(scene) {
    this.scene = scene;

    this.CANVAS = document.querySelector("#ambientCanvas");
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
      if (particle.x > this.CANVAS.width || particle.y > this.CANVAS.height) {
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
      this.CTX.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2, true);
    }
    this.CTX.fill();

    this.#moveSnow();
  };

  #moveSnow = () => {
    this.angle += 0.01;
    for (var i = 0; i < this.maxParticles; i++) {
      var particle = this.particles[i];
      particle.y += Math.cos(this.angle + particle.d) + 1 + particle.r / 2;
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
    const body = document.getElementsByTagName("body")[0];
    body.style.backgroundColor = color;
  };
}

let config1 = {
  src: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/175711/open-peeps-sheet.png",
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
  topOffset: 150,
};

let config2 = {
  src: "img/personas.png",
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
};

const scene = new Scene(config2);
const ambient = new Ambient(scene);
const controlls = new Controlls(scene, ambient);
