document.addEventListener('DOMContentLoaded', function() {
  // Kosár tartalmának kezelése
    // Kosár kezelése
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    const user = JSON.parse(localStorage.getItem("user")); // Felhasználó adatai

    // Kosár számláló frissítése
    function updateCartCount() {
        if (cartCountElement) {
            cartCountElement.textContent = cart.length;
        }
    }

    // Kosárba helyezés gombok figyelése
    document.querySelectorAll('.cart-btn').forEach(button => {
        button.addEventListener('click', event => {
            const productName = event.target.getAttribute('data-product-name');
            const price = event.target.getAttribute('data-price');
            const productId = event.target.getAttribute('data-product-id');
            addToCart(productName, price, productId);
        });
    });

    // Termék hozzáadása a kosárhoz
    function addToCart(productName, price, productId) {
        const product = { name: productName, price: parseInt(price, 10), productId: productId, quantity: 1 };
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart)); // Kosár mentése
        alert(`${productName} hozzáadva a kosárhoz!`);
        updateCartCount();
        loadOrderCart(); // Kosár oldal frissítése
    }

    // Kosár betöltése és frissítése
    function loadOrderCart() {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsList = document.getElementById('order-cart-items');
        const cartTotal = document.getElementById('order-cart-total');

        if (cartItemsList && cartTotal) {
            cartItemsList.innerHTML = '';
            let total = 0;

            cart.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `${item.name} - ${item.price} Ft 
                    <button class="btn btn-sm btn-danger remove-from-order" data-index="${index}">Törlés</button>`;
                cartItemsList.appendChild(listItem);
                total += item.price;
            });

            cartTotal.textContent = `${total} Ft`;

            // Törlés gombok eseménykezelése
            document.querySelectorAll('.remove-from-order').forEach(button => {
                button.addEventListener('click', function() {
                    const index = this.getAttribute('data-index');
                    removeFromCartOrder(index);
                });
            });
        }
    }

    // Termék eltávolítása a kosárból
    function removeFromCartOrder(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
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
                cart: cart.map(item => ({
                    productId: item.productId,
                    price: item.price,
                    quantity: item.quantity
                })),
                userData: {
                    first_name: document.getElementById("firstname").value,
                    last_name: document.getElementById("lastname").value,
                    email: document.getElementById("email").value,
                    phone: document.getElementById("phone").value,
                }
            };
            const target = document.getElementById("target");
            try {
                const response = await fetch("http://localhost:3443/api/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
                    body: JSON.stringify(orderData)
                });

                const responseData = await response.json();
                if (!response.ok) throw new Error(responseData.error || "Ismeretlen hiba történt");

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
                const response = await fetch("http://localhost:3443/api/quote_request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ first_name, last_name, email, note })
                });

                if (!response.ok) throw new Error(await response.text());               

                target.innerHTML = `<div class="alert alert-success">✅ Sikeres ajánlatkérés!</div>`; 
                offerForm.reset();
            } catch (error) {
                target.innerHTML = `<div class="alert alert-danger">❌ Hiba történt: ${error.message}</div>`;
            }
        });
    }

    // Oldal betöltésekor frissítések
    updateCartCount();
    loadOrderCart();


    
    
});


const termekKepek = {
    osszes: [],  // Ez üres lesz, mert itt minden kategória képeit összegyűjtjük
    koszoruk: [
        "../img/bemutatoterem/20241016_110649.jpg",
        "kepek/koszoruk/koszoruk2.jpg",
        "kepek/koszoruk/koszoruk3.jpg",
        "kepek/koszoruk/koszoruk4.jpg"
    ],
    kopogtatok: [
        "../img/bemutatoterem/20241016_110738.jpg",
        "kepek/kopogtatok/kopogtato2.jpg",
        "kepek/kopogtatok/kopogtato3.jpg",
        "kepek/kopogtatok/kopogtato4.jpg"
    ],
    csokrok: [
        "../img/bemutatoterem/20241016_110757.jpg",
        "kepek/csokrok/csokor2.jpg",
        "kepek/csokrok/csokor3.jpg",
        "kepek/csokrok/csokor4.jpg"
    ]
};

// Az összes kategória képeit hozzáadjuk az "Összes Termék" kategóriához
termekKepek.osszes = [
    ...termekKepek.koszoruk,
    ...termekKepek.kopogtatok,
    ...termekKepek.csokrok
];

function kepValt(kategoria) {
    const galeriaElem = document.getElementById("kep-galeria");
    galeriaElem.innerHTML = '';  // Előző képek eltávolítása

    termekKepek[kategoria].forEach(kep => {
        const kepElem = document.createElement("div");
        kepElem.classList.add("col-3", "mb-4");
        kepElem.innerHTML = `<img src="${kep}" class="img-fluid" alt="${kategoria}">`;
        galeriaElem.appendChild(kepElem);
    });
}






