
export const menuData = [
    { id: 1, name: "Butter Chicken", category: "North Indian", price: 350, rating: 4.8, image: "image/butter-chicken-recipe.jpg", desc: "Creamy, spiced tomato sauce with tender chicken." },
    { id: 2, name: "Masala Dosa", category: "South Indian", price: 150, rating: 4.9, image: "image/Masala-dosa-scaled.webp", desc: "Crispy crepe wrapped around a savory potato filling." },
    { id: 3, name: "Hyderabadi Biryani", category: "North Indian", price: 450, rating: 4.9, image: "image/Hyderabadi Biryani.webp", desc: "Aromatic basmati rice cooked with tender lamb and spices." },
    { id: 4, name: "Paneer Tikka", category: "North Indian", price: 280, rating: 4.7, image: "image/Paneer-Tikka.jpg", desc: "Grilled cottage cheese cubes marinated in yogurt and spices." },
    { id: 5, name: "Chole Bhature", category: "North Indian", price: 180, rating: 4.8, image: "image/Chole Bhature.jpeg", desc: "Spiced tangy chickpea curry served with soft fluffy bread." },
    { id: 6, name: "Idli Sambar", category: "South Indian", price: 120, rating: 4.6, image: "image/Idli Sambar.jpg", desc: "Steamed rice cakes served with lentil soup and chutney." },
    { id: 7, name: "Pani Puri", category: "Street Food", price: 80, rating: 4.9, image: "image/pani-puri.jpg", desc: "Crispy hollow puris filled with tangy, spicy water and potato." },
    { id: 8, name: "Samosa", category: "Street Food", price: 60, rating: 4.7, image: "image/samosa.jpg", desc: "Fried pastry with a savory filling of spiced potatoes and peas." },
    { id: 9, name: "Gulab Jamun", category: "Desserts", price: 100, rating: 4.8, image: "image/Gulab Jamun.webp", desc: "Deep-fried dough balls soaked in sweet, sticky sugar syrup." },
    { id: 10, name: "Rasmalai", category: "Desserts", price: 140, rating: 4.9, image: "image/Rasmalai.webp", desc: "Soft paneer balls immersed in chilled creamy milk." },
    { id: 11, name: "Pav Bhaji", category: "Street Food", price: 150, rating: 4.7, image: "image/Pav Bhaji.jpg", desc: "Spicy mashed vegetable curry served with buttered soft bread." },
    { id: 12, name: "Medu Vada", category: "South Indian", price: 100, rating: 4.5, image: "image/Medu-vada.jpg", desc: "Crispy doughnut-shaped fritters made from urad dal." }
];


let cart = [];
let currentCategory = 'all';
let searchQuery = '';


const menuContainer = document.getElementById('menu-container');
const categoryButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');
const cartCount = document.querySelector('.cart-count');
const cartIcon = document.getElementById('cart-icon');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutOverlay = document.getElementById('checkout-overlay');
const closeCheckoutBtn = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const checkoutFinalTotal = document.getElementById('checkout-final-total');

function init() {

    if (menuContainer) {
        renderMenu(menuData);
        setupEventListeners();
    }
    loadCart();

    const htoBtn = document.getElementById('how-to-order-btn');
    const htoOverlay = document.getElementById('hto-overlay');
    const htoClose = document.getElementById('hto-close');

    function openHTO() { document.body.classList.add('show-hto'); }
    function closeHTO() { document.body.classList.remove('show-hto'); }

    if (htoBtn) htoBtn.addEventListener('click', openHTO);
    if (htoClose) htoClose.addEventListener('click', closeHTO);
    if (htoOverlay) htoOverlay.addEventListener('click', closeHTO);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeHTO();
    });
}

function renderMenu(data) {
    if (!menuContainer) return;

    menuContainer.innerHTML = '';

    if (data.length === 0) {
        menuContainer.innerHTML = '<p style="text-align:center; grid-column: 1/-1; font-size: 1.2rem; color: #777;">No dishes found matching your criteria.</p>';
        return;
    }

    data.forEach(dish => {
        const div = document.createElement('div');
        div.className = 'food-card';
        div.innerHTML = `
            <div class="food-img-container">
                <span class="food-badge">${dish.category}</span>
                <img src="${dish.image}" alt="${dish.name}" class="food-img" loading="lazy">
            </div>
            <div class="food-info">
                <div class="food-header">
                    <h3 class="food-title">${dish.name}</h3>
                    <span class="food-rating"><i class="fa-solid fa-star"></i> ${dish.rating}</span>
                </div>
                <p class="food-desc">${dish.desc}</p>
                <div class="food-footer">
                    <span class="food-price">₹${dish.price}</span>
                    <button class="add-btn" onclick="addToCart(${dish.id})">Add to Cart</button>
                </div>
            </div>
        `;
        menuContainer.appendChild(div);
    });
}

function setupEventListeners() {

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {

            categoryButtons.forEach(b => b.classList.remove('active'));

            e.target.classList.add('active');

            currentCategory = e.target.getAttribute('data-filter');
            filterMenu();
        });
    });


    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            filterMenu();
        });
    }


    if (cartIcon && cartOverlay && closeCartBtn) {
        cartIcon.addEventListener('click', () => {
            document.body.classList.add('show-cart');
            if (typeof renderCartItems === 'function') renderCartItems();
        });

        closeCartBtn.addEventListener('click', () => {
            document.body.classList.remove('show-cart');
        });

        cartOverlay.addEventListener('click', () => {
            document.body.classList.remove('show-cart');
        });
    }


    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;


            let total = cart.reduce((sum, item) => sum + item.price, 0);
            if (checkoutFinalTotal) checkoutFinalTotal.innerText = `₹${total}`;


            document.body.classList.remove('show-cart');
            if (checkoutOverlay) checkoutOverlay.classList.remove('hidden');
            const cModal = document.getElementById('checkout-modal');
            if (cModal) cModal.classList.remove('hidden');
        });
    }


    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', () => {
            if (checkoutOverlay) checkoutOverlay.classList.add('hidden');
            const cModal = document.getElementById('checkout-modal');
            if (cModal) cModal.classList.add('hidden');
        });
    }
    if (checkoutOverlay) {
        checkoutOverlay.addEventListener('click', () => {
            checkoutOverlay.classList.add('hidden');
            const cModal = document.getElementById('checkout-modal');
            if (cModal) cModal.classList.add('hidden');
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('order-name').value;

            cart = [];
            saveCart();
            updateCartUI();
            if (typeof renderCartItems === 'function') renderCartItems();

            if (checkoutOverlay) checkoutOverlay.classList.add('hidden');
            const cModal = document.getElementById('checkout-modal');
            if (cModal) cModal.classList.add('hidden');
            checkoutForm.reset();

            showToast(`Order placed successfully by ${name}! Thank you.`);
        });
    }
}

function filterMenu() {
    let filtered = menuData;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(dish => dish.category === currentCategory);
    }

    if (searchQuery.trim() !== '') {
        filtered = filtered.filter(dish =>
            dish.name.toLowerCase().includes(searchQuery) ||
            dish.desc.toLowerCase().includes(searchQuery)
        );
    }

    renderMenu(filtered);
}

window.addToCart = function (id) {
    const dish = menuData.find(d => d.id === id);
    if (!dish) return;

    cart.push(dish);
    saveCart();
    updateCartUI();
    showToast(`Added ${dish.name} to cart!`);
};

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    if (typeof renderCartItems === 'function') renderCartItems();
    showToast('Item removed from cart');
};

function renderCartItems() {
    if (!cartItemsContainer || !cartTotalPrice) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty <i class="fa-solid fa-ghost"></i></div>';
        cartTotalPrice.innerText = '₹0';
        if (checkoutBtn) checkoutBtn.style.opacity = '0.5';
        if (checkoutBtn) checkoutBtn.style.pointerEvents = 'none';
        return;
    }

    if (checkoutBtn) checkoutBtn.style.opacity = '1';
    if (checkoutBtn) checkoutBtn.style.pointerEvents = 'auto';

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotalPrice.innerText = `₹${total}`;
}

function updateCartUI() {
    if (cartCount) {
        cartCount.innerText = cart.length;

        cartCount.style.transform = 'scale(1.5)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 200);
    }
}

function saveCart() {
    localStorage.setItem('spiceRoutesCart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('spiceRoutesCart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

function showToast(message) {

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}


document.addEventListener('DOMContentLoaded', init);
