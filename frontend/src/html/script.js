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

//oldalak lekérdezése hogy műküdnek rendesen
document.addEventListener('DOMContentLoaded', async () => {
  try {
      // API hívás az oldalak lekéréséhez
      const response = await fetch('/api/pages');
      const pages = await response.json();

      // Navigáció dinamikus generálása
      const nav = document.querySelector('.navbar-nav'); // Bootstrap navigációs menü
      nav.innerHTML = ''; // Korábbi elemek törlése

      pages.forEach(page => {
          const li = document.createElement('li');
          li.className = 'nav-item'; // Bootstrap nav-item osztály

          const a = document.createElement('a');
          a.className = 'nav-link'; // Bootstrap nav-link osztály
          a.href = page.path; // Útvonal beállítása
          a.textContent = page.title; // Cím beállítása

          li.appendChild(a);
          nav.appendChild(li);
      });
  } catch (error) {
      console.error('Hiba az API hívás során:', error);
  }
});


//ajánlat kérés leadása a frontend oldalról adatbázisban megjelenik
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("offerForm");
  const target = document.getElementById("target");

  form.addEventListener("submit", async (event) => {
      event.preventDefault(); // Ne töltse újra az oldalt

      const last_name = document.getElementById("vezeteknev").value.trim();
      const first_name = document.getElementById("keresztnev").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!last_name || !first_name || !email || !message) {
          target.innerHTML = `<div class="alert alert-danger">⚠ Minden mezőt ki kell tölteni!</div>`;
          return;
      }

      try {
          const response = await fetch("http://localhost:3443/api/rentable_products", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ last_name, first_name, email, message })
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Hiba: ${errorText}`);
          }

          const data = await response.json();
          target.innerHTML = `<div class="alert alert-success">✅ Sikeres ajánlatkérés! <br> Rendelés: ${JSON.stringify(data)}</div>`;

      } catch (error) {
          console.error("❌ Hiba az API hívás során:", error);
          target.innerHTML = `<div class="alert alert-danger">❌ Hiba történt: ${error.message}</div>`;
      }
  });
});

