export class Updater {
  
  constructor(url, progressCallback, events){
    this.url = url;
    this.uploading = false;
    this.progressCB = progressCallback;
    this.events = events;
    this.can = true;
  }

  getOffset() {
    let offset = document.getElementById("offset").value;
    if (offset == "") offset = document.getElementById("offset").placeholder;
    return Number(offset);
  }

  canUpdate() {
    return !this.uploading;
  }

  unbrick() {
    try {
      fetch(`${this.url}/unbrick`);
      if (this.events) {
        this.events.removeEventListener("flasher", this.progressCB);
        this.events.addEventListener("flasher", this.progressCB);
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  unbrickEvents(e) {
    
  }

  // upload(file, progressCallback) {

  //   if (progressCallback) this.progressCB = progressCallback;
  //   this.uploading = true;
  //   this.can
  //   const formData = new FormData();
  //   const request = new XMLHttpRequest();

  //   request.addEventListener('load', () => {
  //     // request.response will hold the response from the server
  //     if (request.status === 200) {
  //       this.OTASuccess = true;
  //     } else if (request.status !== 500) {
  //       this.OTAError = `[HTTP ERROR] ${request.statusText}`;
  //     } else {
  //       this.OTAError = request.responseText;
  //     }
  //     this.uploading = false;
  //   });

  //   // Upload progress
  //   // request.upload.addEventListener("progress", (e) => {
  //   //   this.progress = Math.trunc((e.loaded / e.total) * 100);
  //   // });
  //   if (this.progressCB) request.upload.addEventListener("progress", this.progressCB);
    
  //   if (this.progressCB && this.events) {
  //     this.events.removeEventListener("flasher", this.progressCB);
  //     this.events.addEventListener("flasher", this.progressCB);
  //   }

  //   formData.append("offset", this.getOffset());
  //   formData.append("size", file.size);
  //   formData.append("firmware", file, file.name);

  //   request.open('post',`${this.url}/flash`);
  //   request.send(formData);
  // }

  upload(file, progressCallback) {

    if (progressCallback) this.progressCB = progressCallback;
    this.uploading = true;

    try{
      this.connection = new WebSocket(`ws://weblink.local/wsflash`);

      this.connection.addEventListener("open", () => {
        this.connection.send("Connected");
      });

      this.connection.addEventListener("error", (error) => {
        console.log("WebSocket Error ", error);
        this.connection.close();
      });

      this.connection.addEventListener("message", (m) => {
          console.log("Server: ", m.data);
      });
      this.connection.addEventListener("close", () => {
        console.log("WebSocket connection closed");
        delete this.connection;
      });
    } catch (err) {
      console.log(err);
      delete this.connection;
    }
    
    if (this.connection) {
      setTimeout(() => {
        console.log("Flashing WS");
        this.connection.send(`#w;134217728;${file.size};3;${file.name}`);
        this.connection.binaryType = "blob";
        console.log("Sending file");
        this.connection.send(file);
      }, 1000);
      
      // const reader = new FileReader();

      // reader.onloadend = (e) => {
      //   let rawData = new ArrayBuffer();
      //   this.connection.binaryType = "blob";
      //   this.connection.send(`#f;134217728;${file.size};${file.name}`)
      //   this.connection.send(e.target.result);
      // }

      // reader.readAsArrayBuffer(file);
    }
  }

  uploadHex(hex) {
    hex = hex.replace(/\s/g, '');
    const bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    const blob = new Blob([bytes.buffer]);

    if (progressCallback) this.progressCB = progressCallback;
    this.uploading = true;
    const formData = new FormData();
    const request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      // request.response will hold the response from the server
      if (request.status === 200) {
        this.OTASuccess = true;
      } else if (request.status !== 500) {
        this.OTAError = `[HTTP ERROR] ${request.statusText}`;
      } else {
        this.OTAError = request.responseText;
      }
      this.uploading = false;
    });

    if (this.progressCB) request.upload.addEventListener("progress", this.progressCB);
    if (this.progressCB && this.events) {
      this.events.removeEventListener("flasher", this.progressCB);
      this.events.addEventListener("flasher", this.progressCB);
    }
    
    formData.append("offset", getOffset());
    formData.append("size", blob.length);
    formData.append("firmware", blob, "custom.hex");

    request.open('post',`${this.url}/flash`);
    request.send(formData);
  }

  end() {
    this.events.removeEventListener("flasher", this.progressCB);
  }
}