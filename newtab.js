const wikiLangs = [
  "fr",
  "ru",
  "pt",
  "es",
  "hu",
  "zh",
  "pl",
  "ca",
  "he",
  "ar",
  "af",
  "it",
  "vi",
  "id",
  "sl",
  "nl",
  "eu",
  "sv",
  "fi",
  "no",
  "sr",
  "mk",
  "ast",
  "eo",
  "az",
  "sh",
  "ka",
  "gl",
  "uk",
  "cs",
  "ms",
  "tr",
  "fa",
  "la",
  "bs",
  "th",
  "tum",
  "ro",
  "ml",
  "bg",
  "ko",
  "scn",
  "el",
  "ne",
  "mn",
  "ba",
  "ja",
  "sc",
  "tt",
  "be",
  "ur",
  "bar",
  "et",
  "ckb",
  "lmo",
  "sk",
  "zh-yue",
  "als",
  "jv",
  "mr",
  "fo",
  "hy",
  "vls",
  "lv",
  "or",
  "sco",
  "mai",
  "nn",
  "be-tarask",
  "sq",
  "pam",
  "hi",
  "ceb",
  "te",
  "oc",
  "li",
  "sa",
  "tl",
  "ia",
  "min",
  "mzn",
  "nds-nl",
  "si",
  "simple",
  "lt",
  "uz",
  "arz",
  "dty",
  "su",
  "kk",
  "dv",
  "sw",
  "an",
  "km",
  "nap",
  "da",
  "gv",
  "cdo",
  "gor",
  "gu",
  "myv",
  "ta",
  "vec",
  "wuu",
  "ext",
  "hak",
  "mdf",
  "vo",
  "kn",
  "lfn",
  "yi",
  "cv",
  "sd",
  "wa",
  "zh-classical",
  "as",
  "bxr",
  "qu",
  "fy",
  "gan",
  "ilo",
  "srn",
  "stq",
  "tyv",
  "bn",
  "crh",
  "ie",
  "is",
  "krc",
  "mt",
  "av",
  "ce",
  "ps",
  "map-bms",
  "om",
  "se",
  "yo",
  "zea",
  "am",
  "diq",
  "frr",
  "lo",
  "pnt",
  "tn",
  "azb",
  "io",
  "szl",
  "zh-min-nan",
  "bat-smg",
  "bbc",
  "bjn",
  "lez",
  "xmf",
  "zgh",
  "ady",
  "ga",
  "glk",
  "got",
  "hr",
  "jam",
  "kv",
  "lij",
  "mrj",
  "nds",
  "alt",
  "bcl",
  "bo",
  "br",
  "cy",
  "koi",
  "ku",
  "mhr",
  "new",
  "nv",
  "olo",
  "sah",
  "tg",
  "udm",
  "ace",
  "bew",
  "cu",
  "dag",
  "hif",
  "ht",
  "iu",
  "kbd",
  "kcg",
  "ln",
  "mwl",
  "nah",
  "nov",
  "nqo",
  "pa",
  "pi",
  "pnb",
  "ts",
  "tw",
];
async function setRandomWikiBackground() {
  const loader = document.getElementById("loader");
  loader.style.display = "block";
  try {
    const bg = document.getElementById("background");
    bg.style.background = "#252525";

    // List of Wikipedia language codes (add more if you want)

    const lang = wikiLangs[Math.floor(Math.random() * wikiLangs.length)];

    // Use selected language for all API calls
    const randomApiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*`;
    const randomResponse = await fetch(randomApiUrl);
    const randomData = await randomResponse.json();
    const title = randomData.query.random[0].title;
    document.getElementById("article-info").textContent = title;
    document.getElementById(
      "article-info"
    ).href = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`;

    const apiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      title
    )}&prop=images&format=json&origin=*`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const pages = data.query.pages;
    let images = [];

    for (const pageId in pages) {
      const page = pages[pageId];
      if (page.images) {
        for (const img of page.images) {
          if (/\.(jpg|jpeg|png)$/i.test(img.title)) {
            images.push(img.title);
          }
        }
      }
    }

    if (images.length === 0) {
      console.log("No images found, retrying...");
      loader.style.display = "none";
      setRandomWikiBackground();
      return;
    }

    const randomImageTitle = images[Math.floor(Math.random() * images.length)];

    const imageInfoUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      randomImageTitle
    )}&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const imageInfoResponse = await fetch(imageInfoUrl);
    const imageInfoData = await imageInfoResponse.json();

    let imageUrl = null;
    for (const pageId in imageInfoData.query.pages) {
      const imgInfo = imageInfoData.query.pages[pageId].imageinfo;
      if (imgInfo && imgInfo.length > 0) {
        imageUrl = imgInfo[0].url;
        break;
      }
    }

    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        bg.style.backgroundImage = `url('${imageUrl}')`;
        bg.style.backgroundSize = "cover";
        bg.style.backgroundPosition = "center";
        loader.style.display = "none";
      };
      img.onerror = () => {
        loader.style.display = "none";
      };
      img.src = imageUrl;
    } else {
      loader.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching Wikipedia image:", error);
    const bg = document.getElementById("background");
    bg.style.background = "linear-gradient(135deg, #202020ff, #764ba2)";
    loader.style.display = "none";
  }
}

async function getTime() {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formattedTime;
}

async function updateTime() {
  const now = new Date();
  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  document.getElementById("fancy-date").textContent = formattedDate;

  setInterval(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    document.getElementById("fancy-date").textContent = formattedDate;
  }, 60000);
  const formattedTime = await getTime();
  document.getElementById("clock").textContent = formattedTime;

  setInterval(async () => {
    const newTime = await getTime();
    document.getElementById("clock").textContent = newTime;
  }, 1000);
}
updateTime();
setRandomWikiBackground();
