/**
 * sendMessageAsync
 * Promise-based helper to send messages to the background/service worker.
 *
 * @param {string} action - action string understood by background (e.g. 'ipb201w/convenant')
 * @param {string} idToken - access token for Authorization header
 * @param {object} payload - data to send in the request body
 * @returns {Promise<any>} resolves with background `data` on success, rejects on error
 */
function sendMessageAsync(action, idToken, payload) {
  return new Promise((resolve, reject) => {
    if (!action || typeof action !== "string") {
      return reject(new Error("sendMessageAsync: action must be a non-empty string"));
    }

    try {
      chrome.runtime.sendMessage({ action, idToken, payload }, (response) => {
        const lastErr = chrome.runtime.lastError;
        if (lastErr) return reject(lastErr);

        if (!response) return reject(new Error("sendMessageAsync: no response from background"));

        if (response.success) {
          return resolve(response.data);
        }

        const err = new Error(response.error || "sendMessageAsync: background returned failure");
        err.response = response;
        return reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

window.sendMessageAsync = sendMessageAsync;