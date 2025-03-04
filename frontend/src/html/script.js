// Kosár tartalmának kezelése
const cart = [];
const cartCountElement = document.getElementById('cart-count');

// Kosár számláló frissítése
function updateCartCount() {
  cartCountElement.textContent = cart.length;
}

// Termék hozzáadása a kosárhoz
function addToCart(productName, price) {
  cart.push({ name: productName, price: price });
  alert(`${productName} hozzáadva a kosárhoz!`);
  updateCartCount();
}

// Termék eltávolítása a kosárból
function removeFromCart(productName) {
  const index = cart.findIndex(item => item.name === productName);
  if (index > -1) {
    cart.splice(index, 1);
    alert(`${productName} eltávolítva a kosárból!`);
    updateCartCount();
  } else {
    alert(`${productName} nincs a kosárban!`);
  }
}

// Kosár gombok eseménykezelése
document.querySelectorAll('.cart-btn').forEach(button => {
  button.addEventListener('click', event => {
    const productName = event.target.getAttribute('data-product-name');
    const price = event.target.getAttribute('data-price');
    addToCart(productName, price);
  });
});

// Törlés gombok eseménykezelése
document.querySelectorAll('.remove-btn').forEach(button => {
  button.addEventListener('click', event => {
    const productName = event.target.getAttribute('data-product-name');
    removeFromCart(productName);
  });
});

// Fiókkezelés: bejelentkezés és regisztráció váltás
function toggleForm(form) {
  let loginForm = document.getElementById('login-form');
  let registerForm = document.getElementById('register-form');

  if (form === 'login') {
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
  } else if (form === 'register') {
    registerForm.classList.remove('d-none');
    loginForm.classList.add('d-none');
  }
}

//ajánlatkérés leadás és törlése
document.addEventListener("DOMContentLoaded", () => {
  const offerForm = document.getElementById("offerForm");
  const deleteButton = document.getElementById("deleteButton");
  const target = document.getElementById("target");

  if (!offerForm || !deleteButton || !target) {
    console.error("❌ Hiba: Egy vagy több elem nem található az oldalon!");
    return;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  offerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const last_name = document.getElementById("vezeteknev").value.trim();
    const first_name = document.getElementById("keresztnev").value.trim();
    const email = document.getElementById("email").value.trim();
    const note = document.getElementById("note").value.trim();

    if (!last_name || !first_name || !email || !note) {
      target.innerHTML = `<div class="alert alert-danger">⚠ Minden mezőt ki kell tölteni!</div>`;
      return;
    }

    if (!isValidEmail(email)) {
      target.innerHTML = `<div class="alert alert-danger">⚠ Hibás e-mail cím formátum!</div>`;
      return;
    }

    try {
      const response = await fetch("http://localhost:3443/api/quote_request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last_name, first_name, email, note })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Ismeretlen hiba történt.");
      }

      const data = await response.json();
      target.innerHTML = `<div class="alert alert-success">✅ Sikeres ajánlatkérés! <br> Rendelés ID: ${data.id}</div>`;
      offerForm.reset();
    } catch (error) {
      console.error("❌ Hiba történt:", error);
      target.innerHTML = `<div class="alert alert-danger">❌ Hiba történt: ${error.message}</div>`;
    }
  });

  deleteButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();

    if (!email || !isValidEmail(email)) {
      target.innerHTML = `<div class="alert alert-danger">⚠ Add meg az érvényes e-mail címedet a törléshez!</div>`;
      return;
    }

    try {
      const response = await fetch(`http://localhost:3443/api/quote_request?email=${email}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Ismeretlen hiba történt.");
      }

      target.innerHTML = `<div class="alert alert-warning">🗑 Ajánlat törölve!</div>`;
    } catch (error) {
      console.error("❌ Hiba törlésnél:", error);
      target.innerHTML = `<div class="alert alert-danger">❌ Hiba történt: ${error.message}</div>`;
    }
  });
});

// regisztráció bejelentkezés
document.addEventListener("DOMContentLoaded", () => {
  window.toggleForm = function (formType) {
      document.getElementById("login-form").classList.toggle("d-none", formType !== "login");
      document.getElementById("register-form").classList.toggle("d-none", formType !== "register");
  };

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const userDisplay = document.getElementById("user");

  function showMessage(message, type = "danger") {
      userDisplay.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
      setTimeout(() => (userDisplay.innerHTML = ""), 5000);
  }

  async function sendRequest(data) {
      try {
          console.log("📩 Küldött adatok:", JSON.stringify(data));

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

  loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
          showMessage("⚠ Minden mezőt helyesen kell kitölteni!");
          return;
      }

      const data = { action: "login", email, password };
      const response = await sendRequest(data);
      if (response) {
          showMessage(`✅ Sikeres bejelentkezés!`, "success");
          localStorage.setItem("user", JSON.stringify(response));
      }
  });

  registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const userData = {
          action: "register",
          first_name: document.getElementById("firstName").value.trim(),
          last_name: document.getElementById("lastName").value.trim(),
          phone: document.getElementById("phoneNumber").value.trim(),
          email: document.getElementById("registerEmail").value.trim(),
          password: document.getElementById("registerPassword").value.trim(),
      };

      if (Object.values(userData).some(value => value === "")) {
          showMessage("⚠ Minden mezőt helyesen kell kitölteni!");
          return;
      }

      const response = await sendRequest(userData);
      if (response) {
          showMessage("✅ Sikeres regisztráció!", "success");
          registerForm.reset();
      }
  });
});
