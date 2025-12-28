const API = "https://insurtech.lia-roc.org.tw/lia-passbook-server/api/ipb/";
const PATHS = {
  "ipb201w/convenant": "ipb201w/convenant",
  "ipb202w": "ipb202w"
};

chrome.runtime.onMessage.addListener(({ action, idToken, payload }, sender, sendResponse) => {
  if (!action || !PATHS[action]) {
    sendResponse({ success: false, error: "unknown action" });
    return true;
  }

  fetch(API + PATHS[action], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + idToken
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data: data }))
      .catch(error => {
        console.error('background fetch error', error);
        sendResponse({ success: false, error: error.message || String(error) });
      });

  return true;
});
