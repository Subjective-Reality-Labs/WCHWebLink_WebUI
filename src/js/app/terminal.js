const maxLinesTerminal = 500;

export class Terminal {  
  constructor(url, update, connect, disconnect, send, events) {
    this.url = url;
    this.canSend = true;
    this.willSend = false;
    this.connecting = false;
    this.updateCB = update;
    this.connectCB = connect;
    this.disconnectCB = disconnect;
    this.sendCB = send;
    this.events = events;
    this.sendButton = document.querySelector("#terminal-send");
    this.input = document.querySelector("#terminal-input");
    this.window = document.querySelector(".terminal-text");
    this.parseEvents = this.parseEvents.bind(this);
    // this.update = this.update.bind(this);
    this.sendButton.addEventListener("click", () => {
      this.send();
    });
    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.send();
      }
    });
  }
  connect() {
    try {
      this.connecting = true;  
      this.connection = new WebSocket(`ws://${this.url}`);
      if (this.events) {
        this.events.removeEventListener("terminal", this.parseEvents);
        this.events.addEventListener("terminal", this.parseEvents);
      }
      this.connection.addEventListener("open", () => {
        this.connection.send("Connected");
        this.connecting = false;
        this.connectCB();
      });
      this.connection.addEventListener("error", (error) => {
        console.log("WebSocket Error ", error);
        this.connection.close();
        this.disconnectCB();
      });
      this.connection.addEventListener("message", (m) => {
        if (m.data instanceof Blob) {
          m.data.text().then((text)=>{
            if (text[0] == "#") {
              if (this.updateCB != null) this.updateCB(text.slice(1));
              this.update(text.slice(1));
            }
          });
        } else {
          console.log("Server: ", m.data);
        }
      });
      this.connection.addEventListener("close", () => {
        console.log("WebSocket connection closed");
        delete this.connection;
        this.disconnectCB();
        // let timeout = 500;
        // setTimeout(this.connect(), Math.min(5000, (timeout += timeout)));
      });
      this.sendButton.classList.remove("deactive");
    }
    catch (err) {
      console.log(err);
      this.connecting = false;
    }
  }
  disconnect() {
    // console.log("WebSocket connection closed");
    this.events.removeEventListener("terminal", this.parseEvents);
    this.connection.close();
    // delete this.connection;
    // this.disconnectCB();
  }
  send(message = "") {
    if (!this.canSend) {
      this.willSend = true;
      return;
    }
    this.canSend = false;
    this.willSend = false;
    if (this.connection.readyState === 1) {
      if (message == "") {
        this.connection.send(`#${this.input.value}\n`);
        this.update(`>_  ${this.input.value}\n`);
        this.input.value = "";
      } else {
        this.connection.send(message);
        this.update(`>_ ${message}\n`);
      }
      this.sendButton.classList.add("deactive");
      setTimeout(() => {
        this.sendButton.classList.remove("deactive");
      }, 1000);
      this.sendCB();
    }
    
  }
  parseEvents(m) {
    console.log(m.data);
    if (m.data == "+") {
      this.canSend = true;
      this.sendButton.classList.remove("deactive");
    }
    if (m.data == "-") {
      this.canSend = false;
      this.sendButton.classList.add("deactive");
    }
  }

  update(text) {
    let newText = this.window.value + text;
    let lines = newText.split("\n");
    if (lines.length > maxLinesTerminal) {
      lines.splice(0, lines.length - maxLinesTerminal);
      newText = lines.join("\n");
    }
    this.window.value = newText;
    if (!document.querySelector("#terminal-scroll").classList.contains("deactive")) {
      this.window.scrollTop = this.window.scrollHeight;
    }
  }
}