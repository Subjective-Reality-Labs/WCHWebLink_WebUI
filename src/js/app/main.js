import { Popup } from "./popup.js";
import "../custom_select.js"
import { Terminal } from "./terminal.js"
import { Settings } from "./settings.js";
import { Updater } from "./updater.js";

const maxLinesTerminal = 500;
let canFlash = true;

window.mainJS = true;

const URL = "http://weblink.local"
let docHeight = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
);

const settingsPlug = {
  wifi: {
    hotspot_name: "WebLink",
    hotspot_password: "ch32v003isfun",
  },
  uart: false,
  swio_pin: 10,
  t1coeff: 7,
  pin3v3: -1,
  poll_delay: 1000,
  sw_version: 100,
};

const linkEvents = new EventSource(`${URL}/events`);
const updater = new Updater(URL, flasherProgress, linkEvents);
const popup = new Popup(document.querySelector(".popup-container"), updater, URL);
const generalSettings = new Settings(
  document.querySelector(".card.set"),
  `${URL}/rest/settings`,
  {
    nested: {
      wifi: document.querySelector(".card.wifi"),
    },
    default: settingsPlug,
  }
);
// url, update, connect, disconnect, send
const terminal = new Terminal(`${URL?URL.replace(/(^\w+:|^)\/\//, ''):location.hostname}/terminal`,
  (m)=>{},
  ()=>{
    terminalConnect.classList.add("hide");
    terminalControls.classList.remove("hidden");
  },
  ()=>{
    terminalConnect.classList.remove("hide");
    terminalControls.classList.add("hidden");
  },
  ()=>{},
  linkEvents
);

//Selectors
const root = document.documentElement;
const wifiConnectDiv = document.querySelector(".wifi-connect");
const micro = document.querySelector(".micro");
const microClone = document.querySelector(".micro.clone");
const terminalDiv = document.querySelector(".terminal");
const terminalText = document.querySelector(".terminal > textarea");
const terminalConnect = document.querySelector(".terminal > .but.connect");
const terminalControls = document.querySelector(".terminal-controls");
const offsetInput = document.querySelector("#offset");
const offsetSelector = document.querySelectorAll("#select-offset > input[type=radio]");
const firmware = document.querySelector("#firmware_file");
const firmwareLabel = document.querySelector(".file-label");
const firmwareContainer = document.querySelector(".file-container");
const flashButton = document.querySelector(".flash");
const about = document.querySelector(".about");
const resetBut = document.querySelector("#reset");
const unbrickBut = document.querySelector("#unbrick");
const settingsBut = document.querySelector(".settings-button");
const setButs = document.querySelectorAll(".set-buttons > .but");
const setCards = document.querySelectorAll(".cards > .card");
const moreButs = document.querySelectorAll(".more");
const settings = document.querySelector(".settings");
const customHexCheck = document.querySelector("#custom-hex-check");
const customHex = document.querySelector("#custom-hex");

const settingsWifi = {
  hotspot_name: "",
  hostpot_password: "",
};

///////////////////////
/// Event listeners ///
///////////////////////

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    window.location.reload(); 
  }
});

if(document.readyState !== 'loading') {
  init();
}
else {
  document.addEventListener('DOMContentLoaded', function () {
      init()
  });
}

// Set window height to css variable on resize
window.addEventListener("resize", () => {
  docHeight = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
  root.style.setProperty(
    "--true-height",
    Math.max(document.documentElement.clientHeight, window.innerHeight || 0) +
      "px"
  );
});

microClone.addEventListener("click", () => {
  animateMicro();
});

offsetInput.addEventListener("change", () => {
  offsetInput.value[1].toLowerCase();
  if (!(offsetInput.value[0] == "0" && offsetInput.value[1] == "x")) {
        offsetInput.value = "0x" + offsetInput.value.toUpperCase();
      } else {
        offsetInput.value = "0x" + offsetInput.value.substr(2).toUpperCase();
      }
  changeOffsetSelector(offsetInput.value);
});

document.querySelector("#select-offset").addEventListener("change", () => {
  // console.log(this);
  updateOffsetInput(document.querySelector("#select-offset").getAttribute("value"));
});

firmware.addEventListener("change", () => {
  if (firmware.value != "") {
    checkFirmwareFile();
  }
  if (firmware.value == "") {
    firmwareLabel.innerText = "Select binary";
    flashButton.classList.add("hidden");
  } else {
    firmwareLabel.innerText = firmware.files[0].name;
    flashButton.classList.remove("hidden");
  }
});

about.addEventListener("click", () => {
  popup.draw("about");
});

terminalConnect.addEventListener("click", () => {
  terminal.connect();
  terminalControls.classList.remove("hidden");
});

document.querySelector("#terminal-scroll").addEventListener("click", () => {
  document.querySelector("#terminal-scroll").classList.toggle("deactive");
});

document.querySelector("#terminal-close").addEventListener("click", () => {
  terminal.disconnect();
});

flashButton.addEventListener("click", () => {
  if (canFlash) {
    if (customHexCheck.checked) {
      if (customHex.value != "" && customHex.checkValidity()) {
        updater.uploadHex(customHex.value);
      }
    }
    updater.upload(firmware.files[0]);
    canFlash = false;
    terminal.update(`[Uploading binary]\n`);
    document.documentElement.style.setProperty("--flash-progress", "0%");
    setTimeout(() => {
      document.documentElement.style.setProperty("--flash-progress", "100%");
      canFlash = true;
    }, 3000);
  } 
});

resetBut.addEventListener("click", () => {
  popup.draw("reboot");
});

unbrickBut.addEventListener("click", () => {
  popup.draw("unbrick");
});

setButs.forEach((but) => {
  but.addEventListener("click", () => {
    const name = but.classList[0];
    const card = document.querySelector("." + name + ".card");
    // if (
    //   but.classList.contains("active") ||
    //   !settings.classList.contains("active")
    // ) {
    //   settings.classList.toggle("active");
    //   document.querySelector(".settings-background").classList.toggle("active");
    //   if (settings.classList.contains("active")) populateSettings();
    // }
    switchCard(card, but);
  });
});

moreButs.forEach((but) => {
  but.addEventListener("click", () => {
    const cont = but.nextElementSibling;
    but.classList.toggle("active");
    toggleMore(cont);
  });
});

setCards.forEach((card) => {
  card.childNodes.forEach((el) => {
    el.addEventListener("change", () => {
      card.querySelector(".confirm-buttons").classList.add("visible");
    });
  });
});

document.querySelectorAll(".confirm-buttons .but.save").forEach((el) =>
  el.addEventListener("click", () => {
    if (!saveSettings(el.parentNode.parentNode))
      el.parentNode.classList.remove("visible");
  })
);

settingsBut.addEventListener("click", toggleSettings, true);

customHexCheck.addEventListener("change", () => {
  if (customHexCheck.checked) {
    customHex.classList.remove("hidden");
    flashButton.classList.remove("hidden");
    flashButton.classList.add("only");
    firmwareContainer.classList.add("hex");
  } else {
    customHex.classList.add("hidden");
    if (firmware.value == "") {
      flashButton.classList.add("hidden");
    }
    flashButton.classList.remove("only");
    firmwareContainer.classList.remove("hex");
  }
});

document.querySelector("#pin3v3").addEventListener("change", () => {
  // if (document.querySelector(".set.card>.confirm-buttons").classList.contains("visible")) {
    changeUnbrickErase();
  // }
});

//////////////////////////
///    WIFI section   ////
//////////////////////////
// Set wifi network list width on change
var ro = new ResizeObserver((entries) => {
  for (let entry of entries) {
    entry.target.style.setProperty(
      "--list-width",
      entry.target.clientWidth + "px"
    );
  }
});
ro.observe(wifiConnectDiv.querySelector(".networks"));

document
  .querySelector(".wifi-connect > .title")
  .addEventListener("click", function () {
    wifiScan(this.parentNode);
  });

document
  .querySelector(".wifi-connect > .manual")
  .addEventListener("click", function () {
    popup.draw("wifi-manual");
  });

document
  .querySelector(".but.wifi-current")
  .addEventListener("click", async function () {
    try {
      let wifiName; 
      let result = await fetch(`${URL}/wifi/report`, {method: "GET",})
        .then((response) => {
          return response.json();
        });
      console.log(result);
      if (result.status === "Not connected.") {
        wifiName = `AP mode: ${result.ap_ssid}`
      } else {
        wifiName =`${result.ssid}`;
      }
      popup.draw("wifi-info", {
        wifiName: wifiName,
        ip: result.ip,
        signal: `${result.rssi}%`,
        // signal: String(result.rssi),
      });
    } catch(err) {
      console.log(err);
    }
  });
history.pushState(null, null, window.location.pathname);

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  firmwareContainer.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
})
;['dragenter', 'dragover'].forEach(eventName => {
  firmwareContainer.addEventListener(eventName, () => {
    firmwareContainer.classList.add("highlight");
  })
});
;['dragleave', 'drop'].forEach(eventName => {
  firmwareContainer.addEventListener(eventName, () => {
    firmwareContainer.classList.remove("highlight");
  })
});
firmwareContainer.addEventListener("drop", (e) => {
  firmware.files = e.dataTransfer.files;
  firmware.dispatchEvent(new InputEvent("change"))
  // firmwareLabel.innerHTML = firmware.value.split('\\').pop();
});

////////////////////////////////////
///  END of event handlers////// ///
////////////////////////////////////

function init() {
  
  if (JSON.parse(localStorage.getItem("load_full")) === true) {
    showFull();
  }
  const preloads = document.querySelectorAll(".preload-transitions");
  preloads.forEach((el) => {
    el.classList.remove("preload-transitions");
  });
  
  root.style.setProperty(
    "--true-height",
    Math.max(document.documentElement.clientHeight, window.innerHeight || 0) +
      "px"
  );
  drawCog(settingsBut);
  populateSettings();
  if (document.querySelector('meta[name="wifi"]').content == "AP") showWifi();
}

function map(x, in_min, in_max, out_min, out_max) {
  const result =(x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  return Math.min(Math.max(result, out_min), out_max);
}

function convertRemToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function switchCard(c, b) {
  const index = Array.from(setCards).indexOf(c);
  setCards.forEach((card, i) => {
    if (card === c) {
      card.classList.add("active");
    } else {
      if (index > i) {
        card.classList.remove("hidden-down");
        card.classList.add("hidden-up");
      } else {
        card.classList.remove("hidden-up");
        card.classList.add("hidden-down");
      }
      card.classList.remove("active");
    }
  });
  setButs.forEach((but) => {
    if (but === b) {
      but.classList.add("active");
    } else {
      but.classList.remove("active");
    }
  });
}

function animateMicro() {
  microClone.classList.add("out");
  microClone.classList.add("animate-out");
  microClone.addEventListener("animationend", () => {
    microClone.classList.add("hidden");
    micro.classList.remove("out");
    micro.addEventListener("transitionend", () => {
      micro.classList.remove("closed");
      micro.style.height="30rem";
      micro.addEventListener("transitionend", () => {
        let content = document.querySelector(".micro > .content");
        content.classList.add("visible");
        content.classList.remove("hidden");
        micro.classList.add("open")
        micro.style.height=null;
      }, {once: true});
      terminalDiv.classList.remove("closed");
      terminalDiv.classList.add("open");
    }, {once: true});
  }, {once: true});
}

// const microObserver = new MutationObserver((m) => {
//   m.forEach((mu) => {
//     if (mu.type == "attributes" && mu.attributeName == "class") {
//       let state = mu.target.classList.contains("open");
//       micro.style.height = null;
//     }
//   });
// });
// setButsObserver.observe(micro, { attributes: true });

function drawSignal(s, div) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // div.innerHTML = "";
  svg.setAttribute("viewBox", "-100 -200 200 200");
  path.setAttribute("fill", "#000000");

  if (s < 100) {
    const stroke = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    const strokeMask = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path.setAttribute(
      "d",
      `m 0 -18 l ${s * -0.8} ${s * -0.8} q ${s * 0.8} ${s * -0.6} ${
        s * 1.6
      } 0 z`
    );
    stroke.setAttribute("d", `m 0 0 l -100 -100 q 100 -80 200 0 z`);
    stroke.setAttribute("fill", "#000000");
    strokeMask.setAttribute("d", `m 0 -18 l -80 -80 q 80 -60 160 0 z`);
    strokeMask.setAttribute("fill", "#FFFFFF");
    svg.appendChild(stroke);
    svg.appendChild(strokeMask);
  } else {
    path.setAttribute(
      "d",
      `m 0 0 l ${s * -1} ${s * -1} q ${s} ${s * -0.8} ${s * 2} 0 z`
    );
  }

  svg.appendChild(path);
  div.appendChild(svg);
}

function drawLock(div) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.innerHTML = `<rect x="5" width="40" height="25" fill="black" stroke="white"/>
  <rect y="21" width="50" height="35" fill="black"/>
  <rect x="15" y="9" width="20" height="12" fill="white"/>
  <rect x="20" y="34" width="10" height="10" fill="white"/>`;
  svg.setAttribute("viewBox", "0 0 56 56");
  svg.setAttribute(
    "style",
    "position: absolute; right: 0rem; bottom: 0rem; height: 0.4em; width: 0.4em;"
  );
  div.appendChild(svg);
}

function drawCog(div) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.innerHTML = `<path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>`
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("style", "height: 100%;");
  div.appendChild(svg);
}

function populateWifi(list, div) {
  div.innerHTML = "";
  list.split("\n").forEach((el) => {
    let wifiArr = el.split(",");
    const newNetwork = document.createElement("li");
    const netSignal = document.createElement("div");
    const netSecur = document.createElement("div");
    netSignal.classList.add("wifi-signal");
    netSecur.classList.add("wifi-security");
    drawSignal(wifiArr[0], netSignal);
    if (wifiArr[1] === "1") drawLock(netSignal);
    const netName = document.createElement("p");
    netName.innerText = wifiArr[2];
    newNetwork.addEventListener("click", function () {
      popup.draw("wifi-connect", { 
      wifiName: this.innerText, 
      callback: ()=>{
        wifiConnect(
          this.innerText.trim(),
          document.getElementById("wifi-ap-password").value
        );}
      });
    });
    div.appendChild(newNetwork);
    div.style.setProperty("--list-width", div.clientWidth + "px");
    newNetwork.appendChild(netSignal);
    newNetwork.appendChild(netName);
    newNetwork.appendChild(netSecur);
    getScrollWidth(netName);
  });
}

function getScrollWidth(el) {
  el.style.setProperty("--own-width", el.scrollWidth + "px");
  el.style.setProperty("animation-play-state", "running");
}

async function wifiScan(el) {
  const title = el.querySelector(".title > h3");
  const networks = el.querySelector(".networks");
  el.classList.add("scan");
  title.innerHTML = "Scanning";
  // const wifiList = await fetch(`${URL}/wifi/list`, {
  //   method: "GET",
  // }).then((response) => response.text());
  const wifiList = await fetchRetry(`${URL}/wifi/list`, {
    method: "GET",
  }).then((response) => response.text());
  console.log(wifiList);
  el.classList.remove("scan");
  title.innerHTML = "Available networks";
  el.classList.add("ready");
  if (wifiList != "0") {
    populateWifi(wifiList, networks);
  }
}

async function wifiConnect(name, password) {
  popup.draw("connecting");
  try {  
    let result = await fetchRetry(encodeURI(`${URL}/wifi/connect?n=` + name + "&p=" + password), {method: "GET",})
      .then((response) => {
        if (response.headers.get("content-type") == "application/json") {
          return response.json();
        }});
    console.log(result);
    if (result.status === "Not connected.") {
      popup.draw("alert", {alertText: "Failed to connect"});
    } else if (result.status === "Connected") {
      popup.draw("alert", {alertText: `Already connected to ${result.ssid}`});
    } else {
      popup.draw("alert", {alertText: `${result.status} to ${result.ssid}`});
    }
  } catch(err) {
    console.log(err);
  }
}

function selectSelect(nodelist, title) {
  nodelist.forEach((element, index) => {
    if(element.title == title) {
      offsetSelector[index].checked = true;
    }
  }); 
}

function toggleMore(el, state = null) {
  if (el.classList.contains("active") || state === false) {
    el.setAttribute("style", "--h:" + 0);
    el.classList.remove("active");
  } else {
    el.style.setProperty("--h", el.scrollHeight);
    el.classList.add("active");
  }
}

async function populateSettings() {
  const rpt = document.querySelector(".wifi-current.but");
  try {  
    let result = await fetch(`${URL}/wifi/report`, {method: "GET",})
      .then((response) => {
        return response.json();
      });
    if (result.status === "Not connected.") {
      rpt.innerHTML = `AP mode: ${result.ap_ssid}`
    } else {
      rpt.innerHTML=`${result.ssid}`;
    }
    settings.querySelectorAll(".confirm-buttons").forEach((but) => {
      but.classList.remove("visible");
    });
    document.querySelectorAll(".content .more-div").forEach((el) => {
      el.classList.remove("active");
      el.removeAttribute("style");
    });
    document.querySelectorAll(".content .more").forEach((el) => {
      el.classList.remove("active");
    });
    generalSettings.populateUI(true);
    changeUnbrickErase();
  } catch(err) {
    console.log(err);
  }
}

function saveSettings(div) {
  let save = generalSettings.save(div, true);
  if (save) {
    save.classList.add("error");
    save.addEventListener(
      "input",
      function () {
        this.classList.remove("error");
      },
      { once: true }
    );
    changeUnbrickErase();
    return true;
  }
  return false;
}

function changeOffsetSelector(offset) {
  switch (offset) {
    case "0x08000000":
      selectSelect(offsetSelector, "flash");
      break;
    
    case "0x1FFFF000":
      selectSelect(offsetSelector, "bootloader");
      break;
    
    case "0x1FFFF800":
      selectSelect(offsetSelector, "option");
      break;
    
    case "0x20000000":
      selectSelect(offsetSelector, "ram");
      break;

    default:
      selectSelect(offsetSelector, "custom");
      break;
  }
};

function updateOffsetInput(offset) {
  switch (offset) {
    case "flash":
      offsetInput.value = "0x08000000";
      break;

    case "bootloader":
      offsetInput.value = "0x1FFFF000";
      break;

    case "option":
      offsetInput.value = "0x1FFFF800";
      break;

    case "ram":
      offsetInput.value = "0x20000000";
      break;
  }
}

// function updateTerminalWindow(text) {
//   let newText = terminalText.value + text;
//   let lines = newText.split("\n");
//   if (lines.length > maxLinesTerminal) {
//     lines.splice(0, lines.length - maxLinesTerminal);
//     newText = lines.join("\n");
//   }
//   terminalText.value = newText;
//   if (!document.querySelector("#terminal-scroll").classList.contains("deactive")) {
//     terminalText.scrollTop = terminalText.scrollHeight;
//   }
// }

function settingsListener(e) {
  if (document.getElementById('settings').contains(e.target) || 
      document.querySelector(".popup-container").contains(e.target)||
      settingsBut.contains(e.target)) {
    return;
  } else {
    toggleSettings(e);
  }
}

function toggleSettings(e) {
  // console.
  if (e) e.stopPropagation();
  if (settings.classList.contains("hide")) {
    populateSettings();
    settings.classList.remove("hide");
    switchCard(settings.querySelector(".set.card"), settings.querySelector(".set.but"));
    window.addEventListener('click', settingsListener);
    window.addEventListener('touchend', settingsListener);
  } else {
    window.removeEventListener('click', settingsListener);
    window.removeEventListener('touchend', settingsListener);
    settings.classList.add("hide");
    settings.querySelector(".confirm-buttons").classList.remove("visible");
  }
}

function showFull() {
  let content = document.querySelector(".micro > .content");
  micro.classList.add("block-transitions");
  terminalDiv.classList.add("block-transitions");
  micro.classList.remove("closed", "out");
  micro.classList.add("open");
  microClone.classList.add("hidden");
  content.classList.add("visible");
  content.classList.remove("hidden");
  terminalDiv.classList.remove("closed");
  terminalDiv.classList.add("open");
}

function showWifi() {
  settings.classList.add("block-transitions");
  settings.classList.remove("hide");
  switchCard(settings.querySelector(".wifi.card"), settings.querySelector(".wifi.but"));
  setTimeout(() => {
    settings.classList.remove("block-transitions");
  }, 100);
}

function changeUnbrickErase() {
  if(document.querySelector("#pin3v3").value > 0 && document.querySelector("#pin3v3").value != "") {
    unbrickBut.innerHTML = `unbrick`;
  } else {
    unbrickBut.innerHTML = `erase`;
  }
}

function flasherProgress(message) {
  if (message.type == "flasher") {
    if (!isNaN(message.data[0]) && message.data != "") {
      let progress = (message.data.split("/")[0]/message.data.split("/")[1])*50;
      document.documentElement.style.setProperty("--flash-progress", `${progress}%`);
    } else if (message.data == "Will flash") {
      document.documentElement.style.setProperty("--flash-progress", "55%");
    } else if (message.data == "Flashed succesfully") {
      document.documentElement.style.setProperty("--flash-progress", "100%");
      canFlash = true;
    } else if (message.data.slice(0, 12) == "Erase failed") {
      popup.draw("alert", {alertText: message.data});
    } else if (message.data.slice(0, 14) == "Unbrick failed") {
      popup.draw("alert", {alertText: message.data});
    } else if (message.data == "Link init failed") {
      popup.draw("alert", {alertText: "Failed to initialize the Link.\nCheck the connection."});
    }
    terminal.update(`[${message.data}]\n`);
  }
}

function resetFileInput(el) {
  el.value = null;
  el.dispatchEvent(new InputEvent("change"));
}

function checkFirmwareFile() {
  if (firmware.files[0].type != "application/octet-stream" && firmware.files[0].size <= 16384) {
    console.log("Wrong file type");
    console.log(firmware.files[0].type);
    popup.draw("ignore-file-type", {cb: ()=>{resetFileInput(firmware)}});
  } else if (firmware.files[0].size > 16384) {
    console.log("File size too big for WCH32v003");
    resetFileInput(firmware);
    flashButton.classList.add("hidden");
    firmwareLabel.innerText = "Select binary";
    popup.draw("alert", {alertText: "File size is too big for ch32v003. Max size is 16384 bytes"});
  }
}

async function fetchRetry(...args) {
  let count = 5;
  while(count > 0) {
    try {
      return await fetch(...args);
    } catch(error) {
      console.log(error);
    }
    count -= 1;
  }

  throw new Error(`Too many retries`);
}  