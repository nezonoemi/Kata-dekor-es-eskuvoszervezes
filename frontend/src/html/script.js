document.addEventListener("DOMContentLoaded", function () {
  // Kosár tartalmának kezelése
  // Kosár kezelése
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCountElement = document.getElementById("cart-count");
  const user = JSON.parse(localStorage.getItem("user")); // Felhasználó adatai

  // Kosár számláló frissítése
  function updateCartCount() {
    if (cartCountElement) {
      cartCountElement.textContent = cart.length;
    }
  }

  // Kosárba helyezés gombok figyelése
  document.querySelectorAll(".cart-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productName = event.target.getAttribute("data-product-name");
      const price = event.target.getAttribute("data-price");
      const productId = event.target.getAttribute("data-product-id");
      addToCart(productName, price, productId);
    });
  });

  // Termék hozzáadása a kosárhoz
  function addToCart(productName, price, productId) {
    const product = {
      name: productName,
      price: parseInt(price, 10),
      productId: productId,
      quantity: 1,
    };
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart)); // Kosár mentése
    alert(`${productName} hozzáadva a kosárhoz!`);
    updateCartCount();
    loadOrderCart(); // Kosár oldal frissítése
  }

  // Kosár betöltése és frissítése
  function loadOrderCart() {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsList = document.getElementById("order-cart-items");
    const cartTotal = document.getElementById("order-cart-total");

    if (cartItemsList && cartTotal) {
      cartItemsList.innerHTML = "";
      let total = 0;

      cart.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.className =
          "list-group-item d-flex justify-content-between align-items-center";
        listItem.innerHTML = `${item.name} - ${item.price} Ft 
                    <button class="btn btn-sm btn-danger remove-from-order" data-index="${index}">Törlés</button>`;
        cartItemsList.appendChild(listItem);
        total += item.price;
      });

      cartTotal.textContent = `${total} Ft`;

      // Törlés gombok eseménykezelése
      document.querySelectorAll(".remove-from-order").forEach((button) => {
        button.addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          removeFromCartOrder(index);
        });
      });
    }
  }

  // Termék eltávolítása a kosárból
  function removeFromCartOrder(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadOrderCart();
    updateCartCount();
  }

  // Rendelés leadása
  const orderForm = document.getElementById("checkout-form");
  if (orderForm) {
    orderForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!user) {
        showMessage("⚠ Be kell jelentkezned a rendelés leadásához!");
        return;
      }

      if (cart.length === 0) {
        showMessage("⚠ A kosarad üres!");
        return;
      }

      const orderData = {
        cart: cart.map((item) => ({
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
        })),
        userData: {
          first_name: document.getElementById("firstname").value,
          last_name: document.getElementById("lastname").value,
          email: document.getElementById("email").value,
          phone: parseInt(document.getElementById("phone").value),
          city: document.getElementById("inputAddress").value,
          street : document.getElementById("inputStreet").value,
          zip : parseInt(document.getElementById("inputZip").value)
        },
      };
      const target = document.getElementById("target");
      try {
        const response = await fetch("http://localhost:3443/api/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(orderData),
        });

        const responseData = await response.json();
        if (!response.ok)
          throw new Error(responseData.error || "Ismeretlen hiba történt");

        target.innerHTML = `<div class="alert alert-success">✅ Sikeres rendelés!</div>`;
        localStorage.removeItem("cart"); // Kosár kiürítése
        cart = [];
        updateCartCount();
        loadOrderCart();
      } catch (error) {
        target.innerHTML = `<div class="alert alert-danger">❌ Hiba történt:</div>`;
      }
    });
  }

  // Üzenet megjelenítése
  function showMessage(message, type = "danger") {
    const userDisplay = document.getElementById("user");
    if (userDisplay) {
      userDisplay.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
      setTimeout(() => (userDisplay.innerHTML = ""), 5000);
    }
  }

  // Oldal betöltésekor frissítés
  updateCartCount();
  loadOrderCart();

  // Fiókkezelés: bejelentkezés és regisztráció váltás
  window.toggleForm = function (formType) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm && registerForm) {
      loginForm.classList.toggle("d-none", formType !== "login");
      registerForm.classList.toggle("d-none", formType !== "register");
    }
  };
  // Üzenet megjelenítése
  const userDisplay = document.getElementById("user");

  function showMessage(message, type = "danger") {
    if (userDisplay) {
      userDisplay.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
      setTimeout(() => (userDisplay.innerHTML = ""), 5000);
    }
  }

  // API hívás küldése
  async function sendRequest(data) {
    try {
      const response = await fetch("http://localhost:3443/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Ismeretlen hiba történt.");
      }

      return responseData;
    } catch (error) {
      console.error("❌ API hiba:", error);
      showMessage(`❌ Hiba történt: ${error.message}`);
      return null;
    }
  }

  // Bejelentkezés
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value.trim();

      if (!email || !password) {
        showMessage("⚠ Minden mezőt helyesen kell kitölteni!");
        return;
      }

      const response = await sendRequest({ action: "login", email, password });
      if (response) {
        showMessage("✅ Sikeres bejelentkezés!", "success");
        localStorage.setItem("user", JSON.stringify(response));
        window.location.href = "index.html";
      }
    });
  }

  // Regisztráció
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const userData = {
        action: "register",
        first_name: document.getElementById("firstName")?.value.trim(),
        last_name: document.getElementById("lastName")?.value.trim(),
        phone: document.getElementById("phoneNumber")?.value.trim(),
        email: document.getElementById("registerEmail")?.value.trim(),
        password: document.getElementById("registerPassword")?.value.trim(),
      };

      if (Object.values(userData).some((value) => value === "")) {
        showMessage("⚠ Minden mezőt helyesen kell kitölteni!");
        return;
      }

      const response = await sendRequest(userData);
      if (response) {
        showMessage("✅ Sikeres regisztráció!", "success");
        registerForm.reset();
      }
    });
  }
  // Ajánlatkérés
  const offerForm = document.getElementById("offerForm");
  const target = document.getElementById("target");

  if (offerForm && target) {
    offerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const first_name = document.getElementById("vezeteknev")?.value.trim();
      const last_name = document.getElementById("keresztnev")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const note = document.getElementById("note")?.value.trim();

      if (!first_name || !last_name || !email || !note) {
        target.innerHTML = `<div class="alert alert-danger">⚠ Minden mezőt ki kell tölteni!</div>`;
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3443/api/quote_request",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ first_name, last_name, email, note }),
          },
        );

        if (!response.ok) throw new Error(await response.text());

        target.innerHTML = `<div class="alert alert-success">✅ Sikeres ajánlatkérés!</div>`;
        offerForm.reset();
      } catch (error) {
        target.innerHTML = `<div class="alert alert-danger">❌ Hiba történt: ${error.message}</div>`;
      }
    });
  }

  function updateNavBarProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    const loggedInLink = document.getElementById("loggedIn");
  
    if (loggedInLink) {
      if (user) {
        loggedInLink.innerHTML = "Kijelentkezés";
        loggedInLink.href = "#";
        loggedInLink.addEventListener("click", function (event) {
          event.preventDefault();
          logoutUser();
        });
      } else {
        loggedInLink.innerHTML = "Fiókom";
        loggedInLink.href = "fiokom.html";
      }
    }
  }
  
  function logoutUser() {
    localStorage.removeItem("user");
    const loggedInLink = document.getElementById("loggedIn");
    
    if (loggedInLink) {
      loggedInLink.innerHTML = "Bejelentkezve";
      loggedInLink.href = "fiokom.html";
    }
    
    alert("Sikeresen kijelentkeztél!");
    location.reload(); 
  }
  // Oldal betöltésekor frissítések
  updateCartCount();
  loadOrderCart();
  updateNavBarProfile(); 

});

const termekKepek = {
  advent: [
    "../img/Advent/1.jpg",
    "../img/Advent/2.jpg",
    "../img/Advent/3.jpg",
    "../img/Advent/4.jpg",
    "../img/Advent/5.jpg",
    "../img/Advent/6.jpg",
    "../img/Advent/7.jpg",
    "../img/Advent/8.jpg",
    "../img/Advent/9.jpg",
    "../img/Advent/10.jpg",
    "../img/Advent/11.jpg",
    "../img/Advent/15.jpg",
    "../img/Advent/19.jpg",
    "../img/Advent/23.jpg",
    "../img/Advent/25.jpg",
    "../img/Advent/26.jpg",
    "../img/Advent/27.jpg",
    "../img/Advent/28.jpg",
    "../img/Advent/30.jpg",
    "../img/Advent/31.jpg",
    "../img/Advent/32.jpg",
    "../img/Advent/33.jpg",
    "../img/Advent/34.jpg",
    "../img/Advent/35.jpg",
    "../img/Advent/36.jpg",
    "../img/Advent/37.jpg",
    "../img/Advent/38.jpg",
    "../img/Advent/39.jpg",
    "../img/Advent/40.jpg",
    "../img/Advent/43.jpg",
    "../img/Advent/44.jpg",
    "../img/Advent/45.jpg",
    "../img/Advent/47.jpg",
    "../img/Advent/50.jpg",
  ],
  csokrok: [
    "../img/csokrok/1.jpg",
    "../img/csokrok/2.jpg",
    "../img/csokrok/3.jpg",
    "../img/csokrok/4.jpg",
    "../img/csokrok/5.jpg",
    "../img/csokrok/6.jpg",
    "../img/csokrok/7.jpg",
    "../img/csokrok/9.jpg",
    "../img/csokrok/10.jpg",
    "../img/csokrok/11.jpg",
    "../img/csokrok/12.jpg",
    "../img/csokrok/13.jpg",
    "../img/csokrok/14.jpg",
    "../img/csokrok/15.jpg",
    "../img/csokrok/17.jpg",
    "../img/csokrok/19.jpg",
    "../img/csokrok/22.jpg",
    "../img/csokrok/24.jpg",
    "../img/csokrok/25.jpg",
    "../img/csokrok/26.jpg",
    "../img/csokrok/27.jpg",
    "../img/csokrok/29.jpg",
    "../img/csokrok/30.jpg",
    "../img/csokrok/33.jpg",
    "../img/csokrok/35.jpg",
    "../img/csokrok/37.jpg",
    "../img/csokrok/40.jpg",
    "../img/csokrok/42.jpg",
    "../img/csokrok/45.jpg",
    "../img/csokrok/46.jpg",
    "../img/csokrok/47.jpg",
    "../img/csokrok/48.jpg",
    "../img/csokrok/50.jpg",
  ],
  szulokoszontok: [
    "../img/szulokoszontok/1.jpg",
    "../img/szulokoszontok/2.jpg",
    "../img/szulokoszontok/3.jpg",
    "../img/szulokoszontok/4.jpg",
    "../img/szulokoszontok/5.jpg",
    "../img/szulokoszontok/6.jpg",
    "../img/szulokoszontok/7.jpg",
    "../img/szulokoszontok/8.jpg",
    "../img/szulokoszontok/9.jpg",
    "../img/szulokoszontok/10.jpg",
    "../img/szulokoszontok/11.jpg",
    "../img/szulokoszontok/12.jpg",
    "../img/szulokoszontok/16.jpg",
    "../img/szulokoszontok/17.jpg",
    "../img/szulokoszontok/18.jpg",
    "../img/szulokoszontok/19.jpg",
    "../img/szulokoszontok/20.jpg",
    "../img/szulokoszontok/21.jpg",
    "../img/szulokoszontok/22.jpg",
    "../img/szulokoszontok/23.jpg",
    "../img/szulokoszontok/24.jpg",
    "../img/szulokoszontok/25.jpg",
    "../img/szulokoszontok/26.jpg",
    "../img/szulokoszontok/27.jpg",
    "../img/szulokoszontok/28.jpg",
    "../img/szulokoszontok/29.jpg",
    "../img/szulokoszontok/30.jpg",
    "../img/szulokoszontok/31.jpg",
    "../img/szulokoszontok/32.jpg",
    "../img/szulokoszontok/33.jpg",
    "../img/szulokoszontok/34.jpg",
    "../img/szulokoszontok/35.jpg",
    "../img/szulokoszontok/36.jpg",
    "../img/szulokoszontok/37.jpg",
    "../img/szulokoszontok/38.jpg",
    "../img/szulokoszontok/39.jpg",
    "../img/szulokoszontok/40.jpg",
  ],
  kulonleges: [
    "../img/Kulonleges csokrok boxok/1.jpg",
    "../img/Kulonleges csokrok boxok/4.jpg",
    "../img/Kulonleges csokrok boxok/5.jpg",
    "../img/Kulonleges csokrok boxok/8.jpg",
    "../img/Kulonleges csokrok boxok/10.jpg",
    "../img/Kulonleges csokrok boxok/12.jpg",
    "../img/Kulonleges csokrok boxok/14.jpg",
    "../img/Kulonleges csokrok boxok/16.jpg",
    "../img/Kulonleges csokrok boxok/17.jpg",
    "../img/Kulonleges csokrok boxok/18.jpg",
  ],
  papirviragok: [
    "../img/Papirvirag dekoracio/1.jpg",
    "../img/Papirvirag dekoracio/2.jpg",
    "../img/Papirvirag dekoracio/3.jpg",
    "../img/Papirvirag dekoracio/4.jpg",
    "../img/Papirvirag dekoracio/5.jpg",
    "../img/Papirvirag dekoracio/6.jpg",
    "../img/Papirvirag dekoracio/7.jpg",
    "../img/Papirvirag dekoracio/8.jpg",
  ],
};

// Az összes kategória képeit hozzáadjuk az "Összes Termék" kategóriához
termekKepek.osszes = [
  ...termekKepek.advent,
  ...termekKepek.csokrok,
  ...termekKepek.szulokoszontok,
  ...termekKepek.kulonleges,
  ...termekKepek.papirviragok,
];

function kepValt(kategoria) {
  const galeriaElem = document.getElementById("kep-galeria");
  galeriaElem.innerHTML = ""; // Előző képek eltávolítása

  termekKepek[kategoria].forEach((kep) => {
    const kepElem = document.createElement("div");
    kepElem.classList.add("col-3", "mb-4");
    kepElem.innerHTML = `<img src="${kep}" class="img-fluid" alt="${kategoria}">`;
    galeriaElem.appendChild(kepElem);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  let backToTopButton = document.getElementById("backToTop");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTopButton.style.display = "block";
    } else {
      backToTopButton.style.display = "none";
    }
  });

  backToTopButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
