function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  document.getElementById(
    "clock"
  ).textContent = `${hours}:${minutes}:${seconds}`;
}

function applySettings(settings) {
  const background = document.getElementById("background");
  const clock = document.getElementById("clock");
  if (settings.backgroundData) {
    background.style.backgroundImage = `url(${settings.backgroundData})`;
  } else if (settings.backgroundUrl) {
    background.style.backgroundImage = `url(${settings.backgroundUrl})`;
  } else {
    background.style.backgroundImage = "";
  }
  clock.style.fontFamily = settings.fontFamily || "Arial";
  clock.style.fontSize = (settings.fontSize || 48) + "px";
  clock.style.color = settings.fontColor || "#ffffff";
  // Set clock position if provided
  clock.style.left = settings.clockX || "100px";
  clock.style.top = settings.clockY || "100px";
  // Controls values
  document.getElementById("bgUrl").value = settings.backgroundUrl || "";
  document.getElementById("fontFamily").value = settings.fontFamily || "Arial";
  document.getElementById("fontSize").value = settings.fontSize || 48;
  document.getElementById("fontColor").value = settings.fontColor || "#ffffff";
}

function saveSettings() {
  const settings = {
    backgroundUrl: document.getElementById("bgUrl").value.trim(),
    fontFamily: document.getElementById("fontFamily").value,
    fontSize: parseInt(document.getElementById("fontSize").value, 10),
    fontColor: document.getElementById("fontColor").value,
  };
  chrome.storage.sync.get(["backgroundData", "clockX", "clockY"], (prev) => {
    settings.backgroundData = prev.backgroundData || "";
    settings.clockX = prev.clockX || "100px";
    settings.clockY = prev.clockY || "100px";
    chrome.storage.sync.set(settings, () => {
      applySettings(settings);
    });
  });
}

function loadSettings() {
  chrome.storage.sync.get(
    [
      "backgroundUrl",
      "backgroundData",
      "fontFamily",
      "fontSize",
      "fontColor",
      "clockX",
      "clockY",
    ],
    (settings) => {
      applySettings(settings);
    }
  );
}

// Settings modal logic
document.getElementById("gear").onclick = () => {
  document.getElementById("settingsModal").style.display = "block";
};
document.getElementById("closeSettings").onclick = () => {
  document.getElementById("settingsModal").style.display = "none";
};
window.onclick = (e) => {
  if (e.target === document.getElementById("settingsModal")) {
    document.getElementById("settingsModal").style.display = "none";
  }
};

// Background upload
document.getElementById("bgUpload").onchange = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    const dataURL = ev.target.result;
    chrome.storage.sync.set({ backgroundData: dataURL }, () => {
      // Save existing settings also to update
      chrome.storage.sync.get(
        [
          "backgroundUrl",
          "fontFamily",
          "fontSize",
          "fontColor",
          "clockX",
          "clockY",
        ],
        (prev) => {
          applySettings(Object.assign(prev, { backgroundData: dataURL }));
        }
      );
    });
  };
  reader.readAsDataURL(file);
};

// Clock dragging logic (50px grid snap)
let drag = false,
  offset = { x: 0, y: 0 };

const clock = document.getElementById("clock");
clock.onmousedown = function (e) {
  drag = true;
  offset.x = e.clientX - clock.offsetLeft;
  offset.y = e.clientY - clock.offsetTop;
};
document.onmousemove = function (e) {
  if (!drag) return;
  let x = Math.round((e.clientX - offset.x) / 50) * 50;
  let y = Math.round((e.clientY - offset.y) / 50) * 50;
  clock.style.left = x + "px";
  clock.style.top = y + "px";
};
document.onmouseup = function (e) {
  if (drag) {
    drag = false;
    // Save position to storage
    chrome.storage.sync.set({
      clockX: clock.style.left,
      clockY: clock.style.top,
    });
  }
};

// Initial clock and load settings
updateClock();
setInterval(updateClock, 1000);

window.onload = () => {
  loadSettings();
  document.getElementById("saveBtn").addEventListener("click", saveSettings);
};
