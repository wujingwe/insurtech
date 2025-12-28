window.addEventListener("MESSAGE_GOTO", (event) => {
  const payload = event.detail;
  const base64 = Base64.encode(payload);

  if (typeof goto === "function") {
    goto(base64);
  } else {
    console.error("The 'goto' function isn't available on this page.");
  }
});
