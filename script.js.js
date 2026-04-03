let CART = [];

function updateCounts() {
  const total = CART.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = total;
  cartCountBottom.textContent = total;
}

/* ADD TO CART + DECORATION */
function addToCart(item, qty, choice, category, btn) {
  let addon = "";

  if (
    (category === "BLOCK CAKE" && choice.includes("45")) ||
    (category === "SLAB CAKE" && choice.includes("90"))
  ) {
    if (confirm("Add Decoration + RM 10.50 ?")) {
      addon = "Decoration + RM 10.50";
    }
  }

  const existing = CART.find(
    i => i.item === item && i.choice === choice && i.addon === addon
  );

  if (existing) existing.qty += qty;
  else CART.push({ item, qty, choice, addon });

  updateCounts();

  btn.textContent = "✓ Added";
  btn.classList.add("added");
  setTimeout(() => {
    btn.textContent = "Add";
    btn.classList.remove("added");
  }, 1000);
}

/* HIDE MENU UNTIL SEARCH */
function renderMenu(keyword = "") {
  menuContainer.innerHTML = "";
  keyword = keyword.trim().toLowerCase();
  if (!keyword) return;

  Object.keys(PRODUCTS).forEach(category => {
    PRODUCTS[category].forEach(p => {
      const text = (p.name + p.choice + p.addon).toLowerCase();
      if (!text.includes(keyword)) return;

      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div>
          <div class="item-name">${p.name}</div>
          ${p.addon ? `<div class="item-meta">${p.addon}</div>` : ""}
        </div>
        <div class="controls">
          ${
            p.choice
              ? `<select class="qty-box">
                  ${p.choice.split("/").map(c => `<option>${c.trim()}</option>`).join("")}
                </select>`
              : ""
          }
          <input type="number" min="1" value="1" class="qty-box">
          <button class="add-btn">Add</button>
        </div>
      `;

      const btn = card.querySelector(".add-btn");
      btn.onclick = () =>
        addToCart(
          p.name,
          Number(card.querySelector("input").value),
          card.querySelector("select")?.value || "",
          category,
          btn
        );

      menuContainer.appendChild(card);
    });
  });
}

smartSearchInput.oninput = e => renderMenu(e.target.value);

/* CART POPUP */
submitOrderBtn.onclick = () => {
  if (!CART.length) return alert("Cart empty");
  summaryPopup.style.display = "flex";
  renderCart();
};

function renderCart() {
  popupSummary.innerHTML = "";
  CART.forEach((c, i) => {
    const line = document.createElement("div");
    line.style.display = "flex";
    line.style.gap = "8px";
    line.style.marginBottom = "6px";
    line.innerHTML = `
      <div style="flex:1;">
        ${c.item}${c.choice ? ` (${c.choice})` : ""}
        ${c.addon ? `<div class="item-meta">${c.addon}</div>` : ""}
      </div>
      <input type="number" value="${c.qty}">
      <button>✕</button>
    `;
    line.querySelector("input").oninput = e => {
      c.qty = Math.max(1, Number(e.target.value));
      updateCounts();
    };
    line.querySelector("button").onclick = () => {
      CART.splice(i, 1);
      renderCart();
      updateCounts();
    };
    popupSummary.appendChild(line);
  });
}

/* SUBMIT */
function buildText() {
  if (!customerName.value || !brandName.value || !contactNumber.value)
    return alert("Please fill all details");

  let text =
`Customer: ${customerName.value}
Brand: ${brandName.value}
Contact: ${contactNumber.value}

`;

  CART.forEach(c => {
    text += `• ${c.item}${c.choice ? ` (${c.choice})` : ""}${c.addon ? ` + ${c.addon}` : ""} x ${c.qty}\n`;
  });

  return text;
}

function submitWhatsApp() {
  const t = buildText();
  if (t) window.open(`https://wa.me/?text=${encodeURIComponent(t)}`);
}

function submitEmail() {
  const t = buildText();
  if (t) location.href = `mailto:?subject=New Order&body=${encodeURIComponent(t)}`;
}

function closeSummary() {
  summaryPopup.style.display = "none";
}
