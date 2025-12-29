function unblock() {
  const popup = document.querySelector("#noDatanoteiceMemberUpgrade")
  if (popup) {
    popup.style.display = "none";
  }

  const items = document.querySelectorAll(".insuranceBx > li");
  items.forEach(li => {
    // Remove "blur-panel" for ".insuranceBx li" tags
    if (li.classList.contains("blur-panel")) {
      li.classList.remove("blur-panel");
    }

    // Remove "cursor: not-allowed;" for children inside li
    const children = li.querySelectorAll('*');
    children.forEach(child => {
      if (child.style.cursor === "not-allowed") {
        child.style.removeProperty("cursor");
      }
    })
  });

  const pathname = window.location.pathname;
  if (pathname.includes("my_list.html")) {
    processMyList(items);
  } else if (pathname.includes("my_list_sub.html")) {
    processMyListSub(items);
  }
}

async function processMyList(items) {
  const idToken = sessionStorage.getItem("idToken");
  if (!idToken) {
    console.warn("No idToken in sessionStorage; skipping API flows");
    return;
  }

  const tasks = Array.from(items).map(async (li) => {
    if (li.classList.contains("processed")) return;
    li.classList.add("processed");

    const h4 = li.querySelector(".info h4");
    const cmpName = h4.textContent.trim();

    const p = li.querySelector(".info p");
    const insNo = p.textContent.trim();

    const select = document.querySelector("#selectGuarantor");
    const userType = select?.value ?? null;

    try {
      const serverData = await sendMessageAsync("ipb201w/convenant", idToken, { cmpName, insNo, userType });
      const data = serverData.data;
      const content = data.content;
      const memo = content.map(item => ({ fromTable: item.fromTable, tableId: item.tableId }));
      sessionStorage.setItem(insNo, JSON.stringify(memo));

      const insurance = content[0];
      const h5 = li.querySelector(".info h5");
      if (h5 && insurance?.prodCode) h5.textContent = insurance.prodCode.trim();

      const spans = li.querySelectorAll("div.object span");
      if (spans && spans.length >= 2) {
        if (insurance?.askName) spans[0].textContent = insurance.askName.trim();
        if (insurance?.name) spans[1].textContent = insurance.name.trim();
      }

      const div = li.querySelector(".info");
      const payload = { cmpName, insNo, userType };
      processLink(div, payload);
    } catch (err) {
      console.error("ipb201w/convenant failed", err);
    }
  });

  await Promise.all(tasks);
}

async function processMyListSub(items) {
  const idToken = sessionStorage.getItem("idToken");
  if (!idToken) {
    console.warn("No idToken in sessionStorage; skipping API flows");
    return;
  }

  const tasks = Array.from(items).map(async (li, index) => {
    if (li.classList.contains("processed")) return;
    li.classList.add("processed");

    const h4 = li.querySelector(".info h4");
    const cmpName = h4.textContent.trim();

    const insuranceEncodeData = sessionStorage.getItem("insuranceEncodeData");
    if (!insuranceEncodeData) {
      console.error("processMyListSub: missing insuranceEncodeData in sessionStorage");
      return;
    }

    let json;
    try {
      const jsonString = atob(insuranceEncodeData);
      json = JSON.parse(jsonString);
    } catch (err) {
      console.error("processMyListSub: failed to decode/parse insuranceEncodeData", err);
      return;
    }

    const insNo = json.insNo;
    const userType = json.userType;

    let memo;
    try {
      memo = JSON.parse(sessionStorage.getItem(insNo));
    } catch (err) {
      console.warn('processMyListSub: invalid memo JSON', err);
      return;
    }
    if (!Array.isArray(memo) || !memo[index]) {
      console.warn(`processMyListSub: memo entry missing for index=${index}`);
      return;
    }

    const { fromTable, tableId } = memo[index];
    try {
      const serverData = await sendMessageAsync("ipb202w", idToken, { cmpName, insNo, userType, fromTable, tableId });
      const insurance = serverData.data;
      const h5 = li.querySelector(".info h5");
      if (h5 && insurance?.prodCode) h5.textContent = insurance.prodCode.trim();

      const spans = li.querySelectorAll("div.object span");
      if (spans && spans.length >= 2) {
        if (insurance?.askName) spans[0].textContent = insurance.askName.trim();
        if (insurance?.name) spans[1].textContent = insurance.name.trim();
      }

      const div = li.querySelector(".info");
      const payload = { cmpName, insNo, userType, fromTable, tableId };
      processLink(div, payload);
    } catch (err) {
      console.error("ipb202w failed", err);
    }
  });

  await Promise.all(tasks);
}

function processLink(div, payload) {
  let link = div.querySelector("a");
  if (!link) {
    const newLink = document.createElement("a");
    newLink.className = "ext";
    newLink.href="javascript:;";

    while (div.firstChild) {
      newLink.appendChild(div.firstChild);
    }
    div.appendChild(newLink);

    link = newLink;
  }

  const json = JSON.stringify(payload);
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const event = new CustomEvent("MESSAGE_GOTO", { detail: json });
    window.dispatchEvent(event);
  });
}

const observer = new MutationObserver(() => {
  unblock();
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// initial run
unblock();
