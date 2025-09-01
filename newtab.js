async function setRandomWikiBackground() {
  try {
    // Show loading state
    const bg = document.getElementById("background");
    bg.style.background = "linear-gradient(135deg, #1e3c72, #2a5298)";

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 10000)
    );

    const loadImagePromise = async () => {
      // 1. Get a random page title using Wikipedia API (CORS-friendly)
      const randomApiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*`;
      const randomResponse = await fetch(randomApiUrl);
      const randomData = await randomResponse.json();
      const title = randomData.query.random[0].title;
      document.getElementById("article-info").textContent = title;
      document.getElementById(
        "article-info"
      ).href = `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;

      // 2. Get images from that page
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
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
        setRandomWikiBackground();
        return;
      }

      // 3. Pick a random image
      const randomImageTitle =
        images[Math.floor(Math.random() * images.length)];

      // 4. Get direct image URL
      const imageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
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
        // Preload the image to ensure smooth transition
        const img = new Image();
        img.onload = () => {
          bg.style.backgroundImage = `url('${imageUrl}')`;
          bg.style.backgroundSize = "cover";
          bg.style.backgroundPosition = "center";
        };
        img.src = imageUrl;
      }
    };

    await Promise.race([loadImagePromise(), timeoutPromise]);
  } catch (error) {
    console.error("Error fetching Wikipedia image:", error);
    // Fallback to a nice gradient if loading fails
    const bg = document.getElementById("background");
    bg.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
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
  const formattedTime = await getTime();
  document.getElementById("clock").textContent = formattedTime;

  setInterval(async () => {
    const newTime = await getTime();
    document.getElementById("clock").textContent = newTime;
  }, 1000);
}
updateTime();
setRandomWikiBackground();
