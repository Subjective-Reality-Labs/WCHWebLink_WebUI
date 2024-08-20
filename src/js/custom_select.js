(function () {
  const selects = document.querySelectorAll(".custom-select");
  // create an observer instance
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // console.log(mutation.target);
      if (mutation.attributeName === "value") {
        document.getElementById(
          mutation.target.getAttribute("value")
        ).checked = true;
      }
    });
  });

  selects.forEach((select) => {
    observer.observe(select, { attributes: true });
    //TODO: FIX THIS!!1
    select.setAttribute("value", "select-offset");
    //Hide labels on start
    select.querySelector(".custom-select-labels").classList.add("__hidden");
    //Check radio based on select value
    const radios = select.querySelectorAll("input[type=radio]");
    const labels = select.querySelectorAll("label");
    select.addEventListener("click", () => {
      toggleSelect(select);
    });
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        select.setAttribute("value", radio.id);
      });
    });
    labels.forEach((label) => {
      label.addEventListener("click", (e) => {
        toggleSelect(select);
      });
    });
  });
  function toggleSelect(select) {
    select.classList.toggle("active");
    if (select.classList.contains("active")) {
      select.querySelector(":checked").classList.add("__hidden");
      select
        .querySelector(".custom-select-labels")
        .classList.remove("__hidden");
    } else {
      select.querySelector(":checked").classList.remove("__hidden");
      select.querySelector(".custom-select-labels").classList.add("__hidden");
    }
  }
  //Close select on click outside
  window.addEventListener("click", (e) => {
    selects.forEach((select) => {
      if (!select.contains(e.target) && select.classList.contains("active")) {
        toggleSelect(select);
      }
    });
  });
})();

function selectSelect(nodelist, title) {
  nodelist.forEach((element, index) => {
    if(element.title == title) {
      offsetSelector[index].checked = true;
    }}); 
}