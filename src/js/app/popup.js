export class Popup {
  constructor(div, updater, url) {
    this.container = div;
    this.popupDiv = div.querySelector(".popup");
    this.content = div.querySelector(".content");
    this.confButs = div.querySelector(".confirm-buttons");
    this.updater = updater;
    this.url = url
  }
  draw(type, options) {
    this.clearPopup();
    switch (type) {
      case "wifi-connect":
        this.makeLabel(options.wifiName, "wifi-ap-password");
        this.makeInput("Password", "wifi-ap-password", "password");
        this.makeButton("Connect", () => {
          options.callback();
        });
        this.makeButton("Cancel", this.closePopup);

        break;
      case "wifi-manual":
        this.makeLabel("Add WiFi", "wifi-ap-name");
        this.makeInput("Name", "wifi-ap-name", "text");
        this.makeInput("Password", "wifi-ap-password", "password");
        this.makeButton("Connect", () => {
          wifiConnect(
            document.getElementById("wifi-ap-name").value,
            document.getElementById("wifi-ap-password").value
          );
        });
        this.makeButton("Cancel", this.closePopup);
        break;
      case "wifi-info":
        this.content.innerHTML = `<p>${options.wifiName}</p>
          <p>Signal strength: ${options.signal}</p>
          <p>Link's IP: ${options.ip}</p>`;
        this.makeButton("Ok", this.closePopup);
        break;
      case "reboot":
        this.makeAlert("Reset connected board?");
        this.makeButton("Yes", ()=>{
          try {
            fetch(`${this.url}/reset`);
          }
          catch(err) {
            console.log(err);
          }
          this.closePopup();
        });
        this.makeButton("Cancel", this.closePopup);
        break;
      case "unbrick":
        this.makeAlert("This will erase all flash.");
        this.makeButton("Ok", ()=>{
          this.updater.unbrick();
          this.closePopup();
        });
        this.makeButton("Cancel", this.closePopup);
        break;
      case "ignore-file-type":
        this.makeAlert("Selected file is not binary. Are you sure you want to proceed?");
        this.makeButton("Yes", ()=>{
          this.closePopup();
          });
        this.makeButton("Oops", ()=>{
          // options.firmware.value = "";
          options.cb();
          // options.firmware.nextElementSibling.innerText = "Select binary";
          this.closePopup();
        });
        break;
      case "connecting":
        this.makeAlertProgress("Connecting");
        break;
      case "alert":
        this.makeAlert(options.alertText);
        this.makeButton("Ok", this.closePopup);
        break;
      case "about":
        const aboutHTML = `<div class="about-popup"><p>WCH WebLink</p>
        <p>ESP32 programmer for CH32V003.<br/>
        Based on <a href="https://github.com/cnlohr/ch32v003fun/tree/master/minichlink" target="_blank">minichlink</a> by cnlohr.</p>
        <p>©2024</p><div class="group-horizontal">
        <a href="https://github.com/Subjective-Reality-Labs/WCH_WebLink" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 33 33">
        <path fill-rule="evenodd" d="M16.289,0C7.294,0,0,7.293,0,16.29c0,7.197,4.667,13.303,11.141,15.457
          c0.814,0.148,1.112-0.354,1.112-0.785c0-0.387-0.014-1.412-0.022-2.771c-4.531,0.984-5.487-2.184-5.487-2.184
          c-0.741-1.881-1.809-2.383-1.809-2.383c-1.479-1.01,0.112-0.99,0.112-0.99c1.635,0.115,2.495,1.68,2.495,1.68
          c1.453,2.488,3.813,1.77,4.741,1.354c0.148-1.053,0.569-1.771,1.034-2.178c-3.617-0.412-7.42-1.809-7.42-8.051
          c0-1.778,0.635-3.232,1.677-4.371c-0.167-0.412-0.727-2.068,0.16-4.311c0,0,1.368-0.438,4.479,1.67
          c1.299-0.361,2.693-0.542,4.078-0.548c1.384,0.006,2.776,0.187,4.078,0.548c3.11-2.108,4.476-1.67,4.476-1.67
          c0.889,2.243,0.329,3.899,0.162,4.311c1.043,1.139,1.674,2.593,1.674,4.371c0,6.258-3.809,7.635-7.438,8.038
          c0.585,0.504,1.105,1.498,1.105,3.018c0,2.178-0.02,3.934-0.02,4.469c0,0.436,0.293,0.941,1.12,0.783
          c6.468-2.158,11.13-8.26,11.13-15.455C32.579,7.293,25.286,0,16.289,0z"/>
        </svg></a>
        <a href="http://subjectiverealitylabs.com/" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
          <path d="M93.1,135.14c-1.92-1.37-7-1.24-9-1.2H79l-3.3,15.59,6.58,0c3.6-.19,7.69-.42,9.93-2.35a8.34,8.34,0,0,0,2.87-6.69C95.15,138,94.46,136.12,93.1,135.14Z"/>
          <path d="M192,0H0V192H192V60L166.15,45,192,30ZM54.26,144.45H48.49a1,1,0,0,1-1-1.25,7.62,7.62,0,0,0,.26-2.66c-.19-4.46-4.06-7.33-9.88-7.33-3.11,0-8.34,1-8.34,7.4,0,3.53,2.54,4.68,9.88,7.47l.94.35c5.82,2.24,12,5.33,12,13.71,0,9.62-6.59,15.6-17.21,15.6-4.45,0-9.87-.54-13.72-4.39l-.55,2.85a1,1,0,0,1-1,.81H14a1,1,0,0,1-.78-.37,1,1,0,0,1-.2-.84L16.34,160a1,1,0,0,1,1-.8h5.77a1,1,0,0,1,.77.37,1,1,0,0,1,.21.82,16.65,16.65,0,0,0-.28,3c0,3.26,1,7.61,10,7.61,3.64,0,9.73-1.11,9.73-8.56,0-3.85-5.09-5.8-10.48-7.88l-.26-.1c-5.86-2.22-12.1-5.3-12.1-13.7,0-10.55,9.15-14.29,17-14.29,5.13,0,9.61,1.65,12.41,4.5l.71-3a1,1,0,0,1,1-.77h5.91a1,1,0,0,1,1,1.22l-3.36,15.18A1,1,0,0,1,54.26,144.45Zm44.8,18.93a32.28,32.28,0,0,1-.84,7h3.41a1,1,0,0,1,.78.37,1,1,0,0,1,.2.84l-1,4.68a1,1,0,0,1-1,.78H90a1,1,0,0,1-.77-.37,1,1,0,0,1-.2-.84,57.44,57.44,0,0,0,1.65-12.05c0-5.78-1.78-7-5.53-7.4-3-.16-5.24-.21-7.23-.14H74.19l-3.07,14.13h5.33a1,1,0,0,1,.77.37,1,1,0,0,1,.21.83l-1,4.67a1,1,0,0,1-1,.8H56.37a1,1,0,0,1-.77-.37,1,1,0,0,1-.21-.83l1-4.67a1,1,0,0,1,1-.8H62.5l7.89-36.4H65.13a1,1,0,0,1-.77-.37,1,1,0,0,1-.2-.84l1-4.67a1,1,0,0,1,1-.79h19c5.13,0,10.44,0,13.78,2.58,3.34,2,5,5.26,5,9.66,0,7.06-3.84,11.88-10.7,13.68C97.44,154.92,99.06,158,99.06,163.38Zm47.21,12.83a1,1,0,0,1-1,.8H106.52a1,1,0,0,1-.77-.37,1,1,0,0,1-.2-.83l.94-4.67a1,1,0,0,1,1-.8H113l7.61-36.4H115.5a1,1,0,0,1-.77-.36,1,1,0,0,1-.21-.84l1-4.67a1,1,0,0,1,1-.8H136.6a1,1,0,0,1,1,1.2l-1,4.67a1,1,0,0,1-1,.8h-6.34l-7.61,36.4h17.59l2.24-10.81a1,1,0,0,1,1-.8h6.13a1,1,0,0,1,1,1.21Z"/>
        </svg></a></div></div>`
        this.content.innerHTML += aboutHTML;
        this.makeButton("Ok", this.closePopup);
        break;
      case "update":
        this.makeInputFile("Select firmware file", ()=>{
          this.content.parentElement.querySelector(".but").disabled = false;
        });
        this.makeCheckbox("Allow downgrade", "downgrade");
        this.makeButton("Upload", ()=>{
          const inputFile = this.content.querySelector(".file-input").files[0];
          this.clearPopup();
          // this.makeAlertProgress("Uploading firmware");
          this.makeAlert("Uploading firmware");
          this.updater.upload(inputFile, (e)=>{
            const alert = this.content.querySelector("h2");
            if (e.type === "progress") {
              alert.innerHTML = `Uploading update\n${parseInt(e.loaded/e.total*100)}%`;
            } else if (e.type === "updater") {
              alert.innerHTML = `${e.data}`;
            } else if (e.type === "tarprogress") {
              let text = alert.innerHTML.split("\n")[0];
              alert.innerHTML = `${text}\n${e.data}`;
            }
            // console.log(e);
          });
        }, true);
        this.makeButton("Cancel", this.closePopup);
    }
    this.container.classList.add("active");
  }
  clearPopup() {
    this.confButs.innerHTML = "";
    this.content.innerHTML = "";
  }
  closePopup() {
    this.container.addEventListener(
      "transitionend",
      () => {
        this.clearPopup();
      },
      { once: true }
    );
    this.container.classList.remove("active");
  }
  makeInputFile(text, func=null) {
    const id = `file_input_${Math.random().toString(36).slice(2, 7)}`;
    const fileContainerHTML = 
    `<div class="file-container">
    <input type="file" id="${id}" class="file-input">
    <label for="${id}" class="file-label">${text}</label>
    </div>`;
    this.content.innerHTML += fileContainerHTML;
    const input = document.getElementById(id);
    const label = input.nextElementSibling;
    const container = label.parentElement;
    input.addEventListener("change", (e) =>{
      label.innerHTML = e.target.value.split('\\').pop();
      if (func != null) func();
    });
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      container.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    })
    ;['dragenter', 'dragover'].forEach(eventName => {
      container.addEventListener(eventName, () => {
        container.classList.add("highlight");
      })
    });
    ;['dragleave', 'drop'].forEach(eventName => {
      container.addEventListener(eventName, () => {
        container.classList.remove("highlight");
      })
    });
    container.addEventListener("drop", (e) => {
      input.files = e.dataTransfer.files;
      label.innerHTML = input.value.split('\\').pop();
      if (func != null) func();
    });
  }
  makeButton(text, func, disabled = false) {
    const button = document.createElement("button");
    if (disabled) button.disabled = true;
    button.classList.add("but");
    button.innerText = text;
    button.addEventListener("click", func.bind(this));
    this.confButs.appendChild(button);
    return button;
  }
  makeAlert(text) {
    const labelHTML = `<h2>${text}</h2>`;
    this.content.innerHTML += labelHTML;
  }
  makeAlertProgress(text) {
    const labelHTML = `<h2 class="progress">${text}</h2>`;
    this.content.innerHTML += labelHTML;
  }
  makeLabel(text, name) {
    const labelHTML = `<label name=${name} for=${name}>${text}</label>`;
    this.content.innerHTML += labelHTML;
  }
  makeInput(text, name, type) {
    const inputHTML = `<input type="${type}" id=${name} placeholder=${text}>`;
    this.content.innerHTML += inputHTML;
  }
  makeCheckbox(text, name) {
    const inputHTML = `<div class="check-lbl">
    <input type="checkbox" id="${name}">
    <label for="${name}">${text}</label>
    </div>`;
    this.content.innerHTML += inputHTML;
  }
}

async function wifiConnect(name, password) {
  popup.draw("connecting");
  try {  
    let result = await fetch(encodeURI(`${URL}/wifi/connect?n=` + name + "&p=" + password), {method: "GET",})
      .then((response) => {
        return response.json();
      });
    if (result.status === "Not connected.") {
      popup.draw("alert", options={alertText: "Failed to connect"});
    } else if (result.status === "Connected") {
      popup.draw("alert", options={alertText: `Already connected to ${result.ssid}`});
    } else {
      popup.draw("alert", options={alertText: `${result.status} to ${result.ssid}`});
    }
  } catch(err) {
    console.log(err);
  }
}