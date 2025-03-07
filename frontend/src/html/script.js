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
document.addEventListener("DOMContentLoaded", () => {
  // Function to toggle between login and registration forms
  window.toggleForm = function (formType) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm && registerForm) {
      loginForm.classList.toggle("d-none", formType !== "login");
      registerForm.classList.toggle("d-none", formType !== "register");
    }
  };

  // Function to show messages
  const userDisplay = document.getElementById("user");

  function showMessage(message, type = "danger") {
    if (userDisplay) {
      userDisplay.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
      setTimeout(() => (userDisplay.innerHTML = ""), 5000);
    }
  }

  // Helper function to send data to the backend
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

  // Handle login form submission
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

      const data = { action: "login", email, password };
      const response = await sendRequest(data);
      if (response) {
        showMessage("✅ Sikeres bejelentkezés!", "success");
        localStorage.setItem("user", JSON.stringify(response));
      }
    });
  }

  // Handle registration form submission
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
  }

  // Ajánlatkérés leadása és törlése
  const offerForm = document.getElementById("offerForm");
  const target = document.getElementById("target");

  if (offerForm && target) {
    offerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const first_name_input = document.getElementById("vezeteknev");
      const last_name_input = document.getElementById("keresztnev");
      const email_input = document.getElementById("email");
      const note_input = document.getElementById("note");

      

      const first_name = first_name_input.value.trim();
      const last_name = last_name_input.value.trim();
      const email = email_input.value.trim();
      const note = note_input.value.trim();

      // Check if elements exist before accessing their value
      if (!first_name || !last_name || !email || !note) {
        target.innerHTML = `<div class="alert alert-danger">⚠ Egy vagy több mező nem található!</div>`;
        return;
      }

      // Validate fields
      if (!first_name || !last_name || !email || !note) {
        target.innerHTML = `<div class="alert alert-danger">⚠ Minden mezőt ki kell tölteni!</div>`;
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        target.innerHTML = `<div class="alert alert-danger">⚠ Hibás e-mail cím formátum!</div>`;
        return;
      }

      try {
        const response = await fetch("http://localhost:3443/api/quote_request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_name, last_name, email, note })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Ismeretlen hiba történt.");
        }

        const data = await response.json();
        target.innerHTML = `<div class="alert alert-success">✅ Sikeres ajánlatkérés! Az Katadekor és esküvőszervező cég értesítést kapott.</div>`;
        offerForm.reset();
      } catch (error) {
        console.error("❌ Hiba történt:", error);
        target.innerHTML = `<div class="alert alert-danger">❌ Hiba történt: ${error.message}</div>`;
      }
    });
  }
});
