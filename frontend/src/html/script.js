
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
