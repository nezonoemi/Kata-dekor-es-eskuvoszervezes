//bérelhető termékek rész
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

// Eseménykezelők a kosár gombokhoz
document.querySelectorAll('.cart-btn').forEach(button => {
  button.addEventListener('click', event => {
    const productName = event.target.getAttribute('data-product-name');
    const price = event.target.getAttribute('data-price');
    addToCart(productName, price);
  });
});

// Eseménykezelők a Törlés gombokhoz
document.querySelectorAll('.remove-btn').forEach(button => {
  button.addEventListener('click', event => {
    const productName = event.target.getAttribute('data-product-name');
    removeFromCart(productName);
  });
});


//fiókom regiszráció/belépés
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


//ajánlat kérés és leadás 
const target = document.getElementById("target");

document.addEventListener("DOMContentLoaded", () => {
  const offerForm = document.getElementById("offerForm");
  const deleteButton = document.getElementById("deleteButton");
  const target = document.getElementById("target");

  if (!offerForm || !deleteButton || !target) {
      console.error("❌ Hiba: Egy vagy több elem nem található az oldalon!");
      return;
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

      try {
          const response = await fetch("http://localhost:3443/api/quote_request", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ last_name, first_name, email, note })
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Hiba: ${errorText}`);
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

      if (!email) {
          target.innerHTML = `<div class="alert alert-danger">⚠ Add meg az e-mail címedet a törléshez!</div>`;
          return;
      }

      try {
          const response = await fetch(`http://localhost:3443/api/quote_request?email=${email}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" }
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Hiba: ${errorText}`);
          }

          target.innerHTML = `<div class="alert alert-warning">🗑 Ajánlat törölve!</div>`;

      } catch (error) {
          console.error("❌ Hiba törlésnél:", error);
          target.innerHTML = `<div class="alert alert-danger">❌ Hiba történt: ${error.message}</div>`;
      }
  });
});
