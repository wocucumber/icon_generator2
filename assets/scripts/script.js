class Dialog {
  /** @type {JQuery} */
  #$;

  /** @type {JQuery} */
  #$main;

  /** @type {(id: number)=>void} */
  #whenChanged;

  /**
   * 
   * @param {JQuery} $dialog 
   * @param {string[]} images 
   * @param {Function} whenChanged 
   */
  constructor($dialog, images, whenChanged) {
    this.#$ = $dialog;
    this.#whenChanged = whenChanged;
    this.#$main = this.#$.children(".dialog-main");

    this.#setupImages(images);
    this.#$.children(".dialog-header").children(".dialog-header-close").on("click", () => {
      this.hide();
    });
  }
  #setupImages(images) {
    this.#$main.html("");

    let i = 0;
    for (const image of images) {
      const currentIndex = i;
      this.#$main.append(
        $("<img>").attr("src", image).attr("data-id", i).addClass("icon").on("click", ()=>this.#whenChanged(currentIndex, image))
      );
      i ++;
    }
  }

  show() {
    this.#$.addClass("dialog-shown");
  }
  hide() {
    this.#$.removeClass("dialog-shown");
  }
  select(id) {
    this.#$main.children(".has-selected").removeClass("has-selected");
    this.#$main.children("[data-id=\""+id+"\"]").addClass("has-selected");
  }
}

let canvas;
let ctx;
const cW = 1000;
const cH = 1000;

const dialogs = {
  /** @type {Dialog} */
  ch: {},

  /** @type {Dialog} */
  bg: {},
}

const images = {
  ch: [
    "aoupa",
    "dekaupa",
    "gao",
    "miniupa",
    "holstein",
    "holstein_brown",
    "jersey",
    "jersey_white",
    "kamokenpi",
    "kui",
    "nanda",
    "tanutanu",
    "pig",
    "saba",
    "napoleon",
    "salmon"
  ],
  bg: [
    "farm",
    "room",
    "mountain",
    "forest",
    "sky",
    "sea"
  ]
}

const loadedImages = {}

let current = {
  ch: 0,
  bg: 0
}

/**
 * 
 * @param {string} val 
 * @param {"ch"|"bg"} dir 
 */
function getImagePath(val, dir) {
  return "assets/"+dir+"/"+val+".png"
}

async function main() {
  canvas = $("#preview").get(0);
  ctx = canvas.getContext("2d");

  dialogs.ch = new Dialog($("#dialog-ch"), images.ch.map(e=>getImagePath(e, "ch")), (id) => {
    dialogs.ch.select(id);
    dialogs.ch.hide();
    current.ch = id;
    updateIcon();
  });
  dialogs.ch.select(0);

  dialogs.bg = new Dialog($("#dialog-bg"), images.bg.map(e=>getImagePath(e, "bg")), (id) => {
    dialogs.bg.select(id);
    dialogs.bg.hide();
    current.bg = id;
    updateIcon();
  });
  dialogs.bg.select(0);

  $("#btn-ch").on("click", () => {
    dialogs.ch.show();
  });

  $("#btn-bg").on("click", () => {
    dialogs.bg.show();
  });

  $("#is-rounded").on("change", function(){
    onChangeIsRounded();
  });

  if (navigator.canShare && navigator.canShare({ files: [new File([await getBlob()], "icon"+current.bg+"-"+current.ch+".png")] }))
    $("#share").on("click", () => {
      share();
    });
  else
    $("#share").addClass("disabled")

  $("#open").on("click", () => {
    openIcon();
  });

  $("#download").on("click", () => {
    download();
  });
  
  onChangeIsRounded();

  updateIcon();
}

async function updateIcon() {
  const bgPath = getImagePath(images.bg[current.bg], "bg");
  const chPath = getImagePath(images.ch[current.ch], "ch");

  $("#btn-ch-img").attr("src", chPath);
  $("#btn-bg-img").attr("src", bgPath);

  ctx.clearRect(0, 0, cW, cH);

  ctx.drawImage(
    await getImage(bgPath),
    0, 0, cW, cH);

  ctx.drawImage(
    await getImage(chPath),
    0, 0, cW, cH);
}

function onChangeIsRounded() {
  const currentValue = $("#is-rounded").prop("checked");

  if (currentValue) {
    $("#preview,.icon,.i-btn-icon").addClass("preview-rounded");
  } else {
    $(".preview-rounded").removeClass("preview-rounded");
  }
}

async function share() {
  const file = { files: [new File([await getBlob()], "icon"+current.bg+"-"+current.ch+".png")] };

  if (!navigator.canShare || !navigator.canShare(file)) return alert("共有不可");

  navigator.share(file);
}

async function openIcon() {
  const url = URL.createObjectURL(await getBlob());

  try {
    window.open(url, "_blank");
  } catch {
    location.href = url;
  }
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000);
}
async function download() {
  const url = URL.createObjectURL(await getBlob());
  const a = document.createElement("a");
  a.href = url;
  a.download = "icon"+current.bg+"-"+current.ch+".png";
  a.click();
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 5000);
}

function getBlob() {
  return new Promise(resolve => {
    canvas.toBlob((blob) => {
      resolve(blob);
    });
  });
}

function getImage(url) {
  return new Promise(resolve => {
    if (loadedImages[url]) return resolve(loadedImages[url]);

    const img = new Image();
    img.src = url;
    img.addEventListener("load", () => {
      loadedImages[url] = img;
      resolve(img);
    });
  });
}

$(() => {
  main();
});