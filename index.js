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

  resize = async () => {
    this.world.width = this.CANVAS.clientWidth * devicePixelRatio;
    this.world.height = this.CANVAS.clientHeight * devicePixelRatio;

    this.CTX.scale(devicePixelRatio, devicePixelRatio);

    this.CANVAS.width = this.world.width;
    this.CANVAS.height = this.world.height;

    if (this.tumulto) {
      this.tumulto.resize();
    }
  };

  update = () => {
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
        this.tumulto.scene.config.maxOffsetY.max
      );
    } else {
      this.maxOffsetY = Utils.getRandomNumber(10, 20);
    }

    if (this.tumulto.scene.config.xVelocity) {
      this.dx = Utils.getRandomNumber(
        this.tumulto.scene.config.xVelocity.min,
        this.tumulto.scene.config.xVelocity.max
      );
    } else {
      this.dx =
        this.tumulto.scene.config.xVelocity ||
        Number.parseFloat(Math.random() * 3) + 2.5;
    }

    if (this.tumulto.scene.config.yVelocity) {
      this.dy = Utils.getRandomNumber(
        this.tumulto.scene.config.yVelocity.min,
        this.tumulto.scene.config.yVelocity.max
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
        this.tumulto.scene.world.width
      );
    }

    if (resetY) {
      const minimumHeight =
        this.tumulto.scene.world.height - Number.parseFloat(this.height / 2.5);
      this.y = this.startY = Utils.getRandomNumber(
        this.tumulto.scene.world.height -
          this.height -
          this.tumulto.scene.config.topOffset,
        minimumHeight
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

  static getRandomNumber = (min, max) => {
    return Number.parseFloat((min + Math.random() * (max - min)).toFixed(2));
  };

  static loadImage = async (imgSrc) => {
    const divLoader = document.getElementById("loader");

    const body = document.getElementsByTagName("body")[0];
    body.appendChild(divLoader);

    divLoader.style.display = "flex";
    window.setTimeout(() => {
      //divLoader.style.opacity = 1;
      //divLoader.style.backgroundColor = "rgb(200,200,200)";
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
  slider = null;
  scene = null;

  constructor(scene) {
    this.scene = scene;

    document.querySelectorAll('[id^="config-"]').forEach((e) => {
      let [, key, subKey] = e.id.split("-");
      if (subKey) {
        e.value = this.scene.config[key][subKey];
      } else {
        e.value = this.scene.config[key];
      }

      e.addEventListener("input", this.#changeValue);
    });

    document.querySelectorAll('[id^="select-set-"]').forEach((e) => {
      e.addEventListener("click", this.#changeSet);
    });
  }

  #changeValue = (e) => {
    let [, key, subKey] = e.target.id.split("-");

    if (subKey) {
      this.scene.config[key][subKey] = Number.parseFloat(e.target.value);
    } else {
      this.scene.config[key] = Number.parseFloat(e.target.value);
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

  constructor(scene) {
    this.scene = scene;
  }

  init() {
    this.#resize();
  }

  #resize() {}
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
  //debug: 1,
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
    min: 0.5,
    max: 2,
  },
  maxOffsetY: {
    min: 5,
    max: 25,
  },
  topOffset: 150,
  //debug: 1,
};

const scene = new Scene(config1);
const controlls = new Controlls(scene);
const ambien = new Ambient(scene);
