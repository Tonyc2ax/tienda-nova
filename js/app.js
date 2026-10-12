(() => {
  "use strict";

  const config = window.STORE_CONFIG;
  const products = window.STORE_PRODUCTS;
  const cartKey = "nova-shop-cart-v1";
  const $ = (selector) => document.querySelector(selector);
  let selectedCategory = "Todos";
  let searchQuery = "";
  let sortBy = "featured";
  let toastTimeout;
  let lastFocusedElement = null;

  const asValidQuantity = (value) => Number.isInteger(value) && value > 0 && value <= 99;
  function readCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(cartKey) || "{}");
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
      return Object.fromEntries(Object.entries(saved)
        .map(([key, quantity]) => [String(key), Number(quantity)])
        .filter(([key, quantity]) => products.some(product => String(product.id) === key) && asValidQuantity(quantity)));
    } catch { return {}; }
  }
  let cart = readCart();

  function persistCart() {
    try { localStorage.setItem(cartKey, JSON.stringify(cart)); }
    catch { showToast("Tu navegador no permite guardar el carrito."); }
  }
  const money = (value) => new Intl.NumberFormat(config.locale || "es-EC", { style: "currency", currency: config.currency || "USD" }).format(value);
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("visible"), 3500);
  }

  function productCard(product) {
    return `<article class="product-card">
      <div class="product-image-wrap">
        ${product.tag ? `<span class="product-tag">${escapeHTML(product.tag)}</span>` : ""}
        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" width="300" height="300">
        <button class="quick-add" type="button" data-add="${product.id}" aria-label="Agregar ${escapeHTML(product.name)} al carrito">+ <span>Agregar</span></button>
      </div>
      <div class="product-details"><span class="product-category">${escapeHTML(product.category)}</span><h3>${escapeHTML(product.name)}</h3><p class="product-description">${escapeHTML(product.description)}</p><div class="price-line"><span class="current-price">${money(product.price)}</span>${product.oldPrice ? `<s>${money(product.oldPrice)}</s>` : ""}</div></div>
    </article>`;
  }

  function renderProducts() {
    let visible = products.filter(product => (selectedCategory === "Todos" || product.category === selectedCategory)
      && `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase("es").includes(searchQuery));
    if (sortBy === "price-asc") visible = visible.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") visible = visible.sort((a, b) => b.price - a.price);
    else if (sortBy === "name") visible = visible.sort((a, b) => a.name.localeCompare(b.name, "es"));
    $("#product-grid").innerHTML = visible.map(productCard).join("");
    $("#product-total").textContent = `${visible.length} ${visible.length === 1 ? "producto" : "productos"}`;
    $("#empty-results").hidden = visible.length > 0;
  }

  const cartEntries = () => products.filter(product => cart[product.id]).map(product => ({ ...product, quantity: cart[product.id] }));
  const totalQuantity = () => Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  const cartSubtotal = () => cartEntries().reduce((total, product) => total + product.price * product.quantity, 0);

  function renderCart() {
    const entries = cartEntries();
    $("#cart-count").textContent = String(totalQuantity());
    $("#drawer-count").textContent = `(${totalQuantity()})`;
    $("#cart-subtotal").textContent = money(cartSubtotal());
    $("#checkout-btn").disabled = entries.length === 0;
    $("#copy-order-btn").disabled = entries.length === 0;
    $("#cart-items").innerHTML = entries.length ? entries.map(product => `<div class="cart-item">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" width="88" height="88">
      <div class="cart-item-main"><div class="cart-item-name">${escapeHTML(product.name)}</div><span>${money(product.price)}</span>
      <div class="quantity-control"><button type="button" data-minus="${product.id}" aria-label="Disminuir ${escapeHTML(product.name)}">−</button><span aria-label="Cantidad ${product.quantity}">${product.quantity}</span><button type="button" data-plus="${product.id}" aria-label="Aumentar ${escapeHTML(product.name)}">+</button></div></div>
      <button type="button" class="remove-item" data-remove="${product.id}" aria-label="Eliminar ${escapeHTML(product.name)}">✕</button>
    </div>`).join("") : `<div class="cart-empty"><span aria-hidden="true">♡</span><h3>Tu carrito está vacío</h3><p>Descubre nuestros productos y agrega tus favoritos.</p><button type="button" id="continue-shopping" class="btn btn-primary">Explorar productos</button></div>`;
  }

  function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    if ((cart[id] || 0) >= 99) return showToast("El máximo es 99 unidades por producto.");
    cart[id] = (cart[id] || 0) + 1;
    persistCart();
    renderCart();
    showToast(`${product.name} agregado al carrito`);
  }
  function changeQuantity(id, change) {
    if (!products.some(product => product.id === id)) return;
    const next = (cart[id] || 0) + change;
    if (next > 99) return showToast("El máximo es 99 unidades por producto.");
    if (next <= 0) delete cart[id];
    else cart[id] = next;
    persistCart();
    renderCart();
  }
  function orderText() {
    const lines = cartEntries().map(product => `• ${product.name} x${product.quantity} — ${money(product.price * product.quantity)}`);
    return `Hola, quiero consultar este pedido de ${config.name}:\n\n${lines.join("\n")}\n\nSubtotal: ${money(cartSubtotal())}\n\n¿Podrían confirmarme disponibilidad, envío y total final?`;
  }
  function checkout() {
    if (!totalQuantity()) return;
    const whatsapp = String(config.whatsapp || "").replace(/\D/g, "");
    if (whatsapp.length < 10 || whatsapp.length > 15) {
      showToast("Configura tu WhatsApp en js/config.js antes de recibir pedidos.");
      return;
    }
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(orderText())}`, "_blank", "noopener,noreferrer");
  }
  async function copyOrder() {
    if (!totalQuantity()) return;
    try {
      await navigator.clipboard.writeText(orderText());
      showToast("Resumen del pedido copiado.");
    } catch { showToast("No se pudo copiar. Abre la tienda con HTTPS o localhost."); }
  }

  function setCartOpen(open) {
    const drawer = $("#cart-drawer");
    const backdrop = $("#cart-backdrop");
    if (open) {
      lastFocusedElement = document.activeElement;
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("visible"));
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      $("#close-cart").focus();
    } else {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      backdrop.classList.remove("visible");
      backdrop.hidden = true;
      document.body.classList.remove("no-scroll");
      lastFocusedElement?.focus();
    }
  }

  $("#category-filters").addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    selectedCategory = button.dataset.category;
    document.querySelectorAll(".filter").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
  });
  $("#search-input").addEventListener("input", event => { searchQuery = event.target.value.trim().toLocaleLowerCase("es"); renderProducts(); });
  $("#sort-select").addEventListener("change", event => { sortBy = event.target.value; renderProducts(); });
  $("#product-grid").addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(Number(button.dataset.add));
  });
  $("#cart-items").addEventListener("click", event => {
    if (event.target.closest("#continue-shopping")) { setCartOpen(false); $("#catalogo").scrollIntoView({ behavior: "smooth" }); return; }
    const button = event.target.closest("button[data-plus],button[data-minus],button[data-remove]");
    if (!button) return;
    const id = Number(button.dataset.plus || button.dataset.minus || button.dataset.remove);
    if (button.hasAttribute("data-remove")) { delete cart[id]; persistCart(); renderCart(); }
    else changeQuantity(id, button.hasAttribute("data-plus") ? 1 : -1);
  });
  $("#reset-filters").addEventListener("click", () => {
    $("#search-input").value = "";
    searchQuery = "";
    document.querySelector('[data-category="Todos"]').click();
  });
  $("#open-cart").addEventListener("click", () => setCartOpen(true));
  $("#close-cart").addEventListener("click", () => setCartOpen(false));
  $("#cart-backdrop").addEventListener("click", () => setCartOpen(false));
  $("#checkout-btn").addEventListener("click", checkout);
  $("#copy-order-btn").addEventListener("click", copyOrder);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && $("#cart-drawer").classList.contains("open")) setCartOpen(false);
    if (event.key === "Tab" && $("#cart-drawer").classList.contains("open")) {
      const focusable = [...$("#cart-drawer").querySelectorAll("button:not(:disabled)")];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    }
  });

  $("#current-year").textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
})();
