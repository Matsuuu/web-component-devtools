import "@pages/panel/index.css";
import "@assets/styles/tailwind.css";

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Panel root element");
  console.log("This is where we would do rendering but it's a todo");
}

init();
