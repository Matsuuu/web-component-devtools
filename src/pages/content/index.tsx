import "./style.css";

const div = document.createElement("div");
div.id = "__root";
document.body.appendChild(div);

const rootContainer = document.querySelector("#__root");
if (!rootContainer) throw new Error("Can't find Content root element");
console.log("This is where we would do rendering but it's a todo");

try {
  console.log("content script loaded");
} catch (e) {
  console.error(e);
}
