export class Settings {
  constructor(div, url, optional = null) {
    this.div = div;
    this.endpoint = url;
    this.inputs = this.div.querySelectorAll(".setting");
    this.inputsLocal = this.div.querySelectorAll(".setting-local");
    if (optional.nested) {
      this.nested = optional.nested;
    }
    this.default = optional.default;
  }
  async populateUI(remote) {
    if (remote || this.settings === null) {
      await this.download();
      // console.log("Settings:", this.settings);
    }
    if (this.settings === null) {
      console.error(`Can't access settings from ${this.endpoint}`);
    }
    this.inputs.forEach((el) => {
      if (el.id in this.settings) {
        this._setValue(el, this.settings[el.id]);
      }
    });
    // Populating nested settings
    for (let subset in this.nested) {
      const inputs = this.nested[subset].querySelectorAll(".setting");
      const settings = this.settings[subset];
      inputs.forEach((el) => {
        const id = el.id.split(":")[1];
        if (id in settings) {
          this._setValue(el, settings[id]);
        }
      });
    }
    this.inputsLocal.forEach((el) => {
      const local = localStorage.getItem(el.id);
      if (local) {
        this._setValue(el, JSON.parse(local));
      }
    });
    document.getElementById("sw_version").innerHTML = `v.${(this.settings.sw_version/100).toFixed(2)}`;
  }
  _setValue(el, value) {
    if (el.value === undefined) {
      if (el.classList.contains("custom-select")) {
        // console.log("Value:", value);
        el.setAttribute("value", el.id + ":" + value);
      } else {
        el.setAttribute("value", value);
      }
    } else {
      if (el.type === "checkbox") {
        el.checked = value;
      } else {
        if (value == -1) {
          el.value = "";
        } else {
          el.value = value;
        }
      }
    }
  }
  _getValue(el) {
    let value;
    if (el.value === undefined) {
      if (el.classList.contains("custom-select")) {
        value = el.getAttribute("value").split(":")[1];
      } else {
        value = el.getAttribute("value");
      }
    } else {
      if (el.type === "checkbox") {
        value = el.checked;
      } else {
        value = el.value;
      }
    }
    return value;
  }
  save(div, remote) {
    let validity = true;
    let validityViolator;
    this.inputsLocal.forEach((el) => {
      // console.log(this._getValue(el));
      localStorage.setItem(el.id, JSON.stringify(this._getValue(el)));
    });
    if (div == this.div) {
      this.inputs.forEach((el) => {
        if (el.getAttribute("type") === "text") {
          if (!el.checkValidity()) {
            console.log("FALSE");
            validity = false;
            validityViolator = el;
            return false;
          }
        }
        this.settings[el.id] = this._getValue(el);
      });
    } else {
      //Saving nested
      for (let subset in this.nested) {
        const inputs = div.querySelectorAll(".setting");
        inputs.forEach((el) => {
          if (el.getAttribute("type") === "text") {
            if (!el.reportValidity()) {
              console.log("FALSE");
              validity = false;
              validityViolator = el;
              return false;
            }
          }
          const id = el.id.split(":")[1];
          this.settings[subset][id] = this._getValue(el);
        });
      }
    }
    if (remote === true && validity === true) {
      try {
        this.upload();
      } catch (err) {
        console.log(err);
      }
    }
    if (validity === false) {
      return validityViolator;
    } else {
      return false;
    }
  }
  async download() {
    try {
      let remoteSettings = await fetch(this.endpoint, {
        method: "GET",
      }).then((response) => {
        return response.json();
      });
      this.settings = remoteSettings;
    } catch (err) {
      console.log(err);
      this.settings = this.default;
      // console.log(this.settings);
    }
  }
  async upload() {
    console.log(JSON.stringify(this.settings));
    await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(this.settings),
    });
  }
}
