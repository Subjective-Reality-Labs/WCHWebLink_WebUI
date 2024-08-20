import "./app/main.js"
import "./custom_select.js"

setTimeout(()=>{
  if (window.mainJS != true) {
  //the flag was not found, so the code has not run
    window.location.reload();
  }
}, 1000);