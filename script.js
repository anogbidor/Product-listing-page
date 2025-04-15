document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const productList = document.getElementById('product-list')
  const searchBar = document.getElementById('search-bar')
  const searchButton = document.getElementById('search-button')
  const sortOptions = document.getElementById('sort-options')
  const loadingIndicator = document.getElementById('loading')
  const errorIndicator = document.getElementById('error')
  const retryButton = document.getElementById('retry-button')
  const cartCount = document.getElementById('cart-count')
  const wishlistCount = document.getElementById('wishlist-count')
  const themeToggle = document.getElementById('theme-toggle')
  const filterToggle = document.getElementById('filter-toggle')
  const filterSidebar = document.getElementById('filter-sidebar')
  const closeFilters = document.getElementById('close-filters')
  const priceSlider = document.getElementById('price-slider')
  const maxPriceDisplay = document.getElementById('max-price')
  const categoryList = document.getElementById('category-list')
  const applyFilters = document.getElementById('apply-filters')
  const resetFilters = document.getElementById('reset-filters')
  const quickViewModal = document.getElementById('quick-view-modal')
  const quickViewContent = document.getElementById('quick-view-content')
  const closeModal = document.querySelector('.close-modal')
  const cartSidebar = document.getElementById('cart-sidebar')
  const cartToggle = document.getElementById('cart-toggle')
  const cartItems = document.getElementById('cart-items')
  const cartTotalPrice = document.getElementById('cart-total-price')
  const closeCartSidebar = document.querySelector(
    '#cart-sidebar .close-sidebar'
  )
  const wishlistSidebar = document.getElementById('wishlist-sidebar')
  const wishlistToggle = document.getElementById('wishlist-toggle')
  const wishlistItems = document.getElementById('wishlist-items')
  const closeWishlistSidebar = document.querySelector(
    '#wishlist-sidebar .close-sidebar'
  )
  const prevPageButton = document.getElementById('prev-page')
  const nextPageButton = document.getElementById('next-page')
  const pageNumbers = document.getElementById('page-numbers')
  const toast = document.getElementById('toast')
  const toastMessage = document.getElementById('toast-message')
  const toastUndo = document.getElementById('toast-undo')
  const couponCode = document.getElementById('coupon-code')
  const applyCoupon = document.getElementById('apply-coupon')
  const checkoutButton = document.getElementById('checkout-button')

  // App State
  let products = []
  let filteredProducts = []
  let cart = []
  let wishlist = []
  let currentPage = 1
  const productsPerPage = 12
  let lastRemovedItem = null
  let lastAction = null
  let categories = []
  let activeFilters = {
    price: 1000,
    categories: [],
    ratings: [],
  }
  let totalPages = 1

  // API Configuration
  const API_URL = 'https://fakestoreapi.com/products'
  const COUPONS = {
    SAVE10: 0.1,
    SAVE20: 0.2,
    WELCOME: 0.15,
  }
  let discount = 0

  // Initialize the app
  init()

  async function init() {
    loadTheme()
    loadCart()
    loadWishlist()
    await fetchProducts()
    setupEventListeners()
  }

  async function fetchProducts() {
    try {
      showLoading()
      hideError()
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch products')
      products = await response.json()
      categories = [...new Set(products.map((product) => product.category))]
      renderCategories()
      filteredProducts = [...products]
      renderProducts()
      renderPagination()
    } catch (error) {
      console.error('Error fetching products:', error)
      showError()
    } finally {
      hideLoading()
    }
  }

  function renderCategories() {
    categoryList.innerHTML = categories
      .map(
        (category) => `
            <label class="category-item">
                <input type="checkbox" name="category" value="${category}">
                <span class="checkmark"></span>
                ${formatCategoryName(category)}
            </label>
        `
      )
      .join('')
  }

  function formatCategoryName(category) {
    return category
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  function renderProducts() {
    if (filteredProducts.length === 0) {
      productList.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1;">
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search term</p>
                </div>
            `
      return
    }

    const startIndex = (currentPage - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    productList.innerHTML = paginatedProducts
      .map(
        (product) => `
            <div class="product-card" data-id="${product.id}">
                ${
                  product.rating.rate > 4.5
                    ? `<span class="product-badge">Bestseller</span>`
                    : ''
                }
                <div class="product-image">
                    <img src="${product.image}" alt="${
          product.title
        }" loading="lazy">
                    <div class="product-overlay">
                        <button class="quick-view" data-id="${
                          product.id
                        }">Quick View</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-rating">
                        ${renderStars(product.rating.rate)}
                        <span>(${product.rating.count})</span>
                    </div>
                    <p class="product-price">
                        $${(product.price * (1 - discount)).toFixed(2)}
                        ${
                          discount > 0
                            ? `<span class="original-price">$${product.price.toFixed(
                                2
                              )}</span>`
                            : ''
                        }
                    </p>
                    <div class="product-actions">
                        <button class="add-to-cart" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="add-to-wishlist" data-id="${product.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join('')
  }

  function renderStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    let stars = ''

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>'
    }

    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>'
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>'
    }

    return stars
  }

  function showLoading() {
    loadingIndicator.style.display = 'block'
    productList.style.opacity = '0.5'
  }

  function hideLoading() {
    loadingIndicator.style.display = 'none'
    productList.style.opacity = '1'
  }

  function showError() {
    errorIndicator.style.display = 'flex'
  }

  function hideError() {
    errorIndicator.style.display = 'none'
  }

  function setupEventListeners() {
    searchButton.addEventListener('click', handleSearch)
    searchBar.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch()
    })
    sortOptions.addEventListener('change', handleSort)
    retryButton.addEventListener('click', fetchProducts)
    themeToggle.addEventListener('click', toggleTheme)
    filterToggle.addEventListener('click', () =>
      filterSidebar.classList.add('active')
    )
    closeFilters.addEventListener('click', () =>
      filterSidebar.classList.remove('active')
    )
    applyFilters.addEventListener('click', applyFilterSettings)
    resetFilters.addEventListener('click', resetFilterSettings)
    cartToggle.addEventListener('click', toggleCartSidebar)
    closeCartSidebar.addEventListener('click', () =>
      cartSidebar.classList.remove('active')
    )
    wishlistToggle.addEventListener('click', toggleWishlistSidebar)
    closeWishlistSidebar.addEventListener('click', () =>
      wishlistSidebar.classList.remove('active')
    )
    prevPageButton.addEventListener('click', goToPreviousPage)
    nextPageButton.addEventListener('click', goToNextPage)
    applyCoupon.addEventListener('click', applyCouponCode)
    checkoutButton.addEventListener('click', handleCheckout)
    toastUndo.addEventListener('click', undoLastAction)
    priceSlider.addEventListener('input', () => {
      maxPriceDisplay.textContent = `$${priceSlider.value}`
    })
    categoryList.addEventListener('change', updateCategoryFilters)
    productList.addEventListener('click', handleProductActions)
    closeModal.addEventListener('click', () => {
      quickViewModal.classList.remove('active')
    })
    document.addEventListener('click', (e) => {
      if (e.target === quickViewModal) {
        quickViewModal.classList.remove('active')
      }
    })
  }

  function toggleCartSidebar() {
    cartSidebar.classList.toggle('active')
    if (cartSidebar.classList.contains('active')) {
      wishlistSidebar.classList.remove('active')
      renderCart()
    }
  }

  function toggleWishlistSidebar() {
    wishlistSidebar.classList.toggle('active')
    if (wishlistSidebar.classList.contains('active')) {
      cartSidebar.classList.remove('active')
      renderWishlist()
    }
  }

  function handleSearch() {
    const searchTerm = searchBar.value.trim().toLowerCase()
    if (searchTerm === '') {
      filteredProducts = [...products]
    } else {
      filteredProducts = products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm)
      )
    }
    currentPage = 1
    renderProducts()
    renderPagination()
  }

  function handleSort() {
    const sortValue = sortOptions.value
    switch (sortValue) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case 'rating-desc':
        filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate)
        break
      case 'name-asc':
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        filteredProducts = [...products]
    }
    currentPage = 1
    renderProducts()
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-theme')
    const isDark = document.body.classList.contains('dark-theme')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    themeToggle.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>'
  }

  function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light'
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme')
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
    }
  }

  function applyFilterSettings() {
    activeFilters.price = priceSlider.value
    activeFilters.categories = Array.from(
      document.querySelectorAll('input[name="category"]:checked')
    ).map((checkbox) => checkbox.value)

    filteredProducts = products.filter((product) => {
      const matchesPrice = product.price <= activeFilters.price
      const matchesCategory =
        activeFilters.categories.length === 0 ||
        activeFilters.categories.includes(product.category)
      return matchesPrice && matchesCategory
    })

    filterSidebar.classList.remove('active')
    currentPage = 1
    renderProducts()
    renderPagination()
  }

  function resetFilterSettings() {
    priceSlider.value = 1000
    maxPriceDisplay.textContent = '$1000'
    document.querySelectorAll('input[name="category"]').forEach((checkbox) => {
      checkbox.checked = false
    })
    activeFilters = {
      price: 1000,
      categories: [],
      ratings: [],
    }
    filteredProducts = [...products]
    currentPage = 1
    renderProducts()
    renderPagination()
  }

  function updateCategoryFilters() {
    const checkedCategories = Array.from(
      document.querySelectorAll('input[name="category"]:checked')
    ).map((checkbox) => checkbox.value)
    activeFilters.categories = checkedCategories
  }

  function loadCart() {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      cart = JSON.parse(savedCart)
      updateCartCount()
    }
  }

  function loadWishlist() {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      wishlist = JSON.parse(savedWishlist)
      updateWishlistCount()
    }
  }

  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartCount()
  }

  function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
    updateWishlistCount()
  }

  function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0)
    cartCount.textContent = count
    cartCount.style.display = count > 0 ? 'flex' : 'none'
  }

  function updateWishlistCount() {
    wishlistCount.textContent = wishlist.length
    wishlistCount.style.display = wishlist.length > 0 ? 'flex' : 'none'
  }

  function renderCart() {
    if (cart.length === 0) {
      cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `
      cartTotalPrice.textContent = '$0.00'
      return
    }

    cartItems.innerHTML = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.id)
        if (!product) return ''

        return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${product.image}" alt="${product.title}">
                    <div class="cart-item-details">
                        <h4>${product.title}</h4>
                        <div class="cart-item-price">$${(
                          product.price *
                          (1 - discount)
                        ).toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-decrease" data-id="${
                              item.id
                            }">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-increase" data-id="${
                              item.id
                            }">+</button>
                        </div>
                    </div>
                    <button class="remove-from-cart" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `
      })
      .join('')

    const total =
      cart.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.id)
        return sum + (product ? product.price * item.quantity : 0)
      }, 0) *
      (1 - discount)

    cartTotalPrice.textContent = `$${total.toFixed(2)}`
  }

  function renderWishlist() {
    if (wishlist.length === 0) {
      wishlistItems.innerHTML = `
                <div class="empty-wishlist">
                    <i class="fas fa-heart"></i>
                    <p>Your wishlist is empty</p>
                </div>
            `
      return
    }

    wishlistItems.innerHTML = wishlist
      .map((id) => {
        const product = products.find((p) => p.id === id)
        if (!product) return ''

        return `
                <div class="wishlist-item" data-id="${id}">
                    <img src="${product.image}" alt="${product.title}">
                    <div class="wishlist-item-details">
                        <h4>${product.title}</h4>
                        <div class="wishlist-item-price">$${(
                          product.price *
                          (1 - discount)
                        ).toFixed(2)}</div>
                        <button class="move-to-cart" data-id="${id}">Add to Cart</button>
                    </div>
                    <button class="remove-from-wishlist" data-id="${id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `
      })
      .join('')
  }

  function renderQuickView(productId) {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    quickViewContent.innerHTML = `
            <div class="quick-view-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="quick-view-details">
                <h2>${product.title}</h2>
                <div class="quick-view-rating">
                    ${renderStars(product.rating.rate)}
                    <span>${product.rating.rate} (${
      product.rating.count
    } reviews)</span>
                </div>
                <div class="quick-view-price">
                    $${(product.price * (1 - discount)).toFixed(2)}
                    ${
                      discount > 0
                        ? `<span class="original-price">$${product.price.toFixed(
                            2
                          )}</span>`
                        : ''
                    }
                </div>
                <p class="quick-view-description">${product.description}</p>
                <div class="quick-view-actions">
                    <button class="add-to-cart" data-id="${
                      product.id
                    }">Add to Cart</button>
                    <button class="add-to-wishlist" data-id="${product.id}">
                        ${
                          wishlist.includes(product.id)
                            ? 'Remove from Wishlist'
                            : 'Add to Wishlist'
                        }
                    </button>
                </div>
            </div>
        `
    quickViewModal.classList.add('active')
  }

  function goToPreviousPage() {
    if (currentPage > 1) {
      currentPage--
      renderProducts()
      renderPagination()
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages) {
      currentPage++
      renderProducts()
      renderPagination()
    }
  }

  function renderPagination() {
    totalPages = Math.ceil(filteredProducts.length / productsPerPage)

    if (totalPages <= 1) {
      pageNumbers.style.display = 'none'
      prevPageButton.style.display = 'none'
      nextPageButton.style.display = 'none'
      return
    }

    pageNumbers.style.display = 'flex'
    prevPageButton.style.display = 'flex'
    nextPageButton.style.display = 'flex'

    prevPageButton.disabled = currentPage === 1
    nextPageButton.disabled = currentPage === totalPages

    let paginationHTML = ''
    const maxVisiblePages = 5
    let startPage, endPage

    if (totalPages <= maxVisiblePages) {
      startPage = 1
      endPage = totalPages
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2)
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1

      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1
        endPage = maxVisiblePages
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1
        endPage = totalPages
      } else {
        startPage = currentPage - maxPagesBeforeCurrent
        endPage = currentPage + maxPagesAfterCurrent
      }
    }

    if (startPage > 1) {
      paginationHTML += `<button class="page-number" data-page="1">1</button>`
      if (startPage > 2) {
        paginationHTML += `<span class="page-dots">...</span>`
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
                <button class="page-number ${
                  i === currentPage ? 'active' : ''
                }" data-page="${i}">${i}</button>
            `
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="page-dots">...</span>`
      }
      paginationHTML += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`
    }

    pageNumbers.innerHTML = paginationHTML

    // Add event listeners to page number buttons
    document.querySelectorAll('.page-number').forEach((button) => {
      button.addEventListener('click', () => {
        currentPage = parseInt(button.dataset.page)
        renderProducts()
        renderPagination()
      })
    })
  }

  function applyCouponCode() {
    const code = couponCode.value.trim().toUpperCase()
    if (COUPONS[code]) {
      discount = COUPONS[code]
      showToast(`Coupon applied! ${discount * 100}% off`)
      renderProducts()
      renderCart()
      renderWishlist()
      couponCode.value = ''
    } else {
      showToast('Invalid coupon code')
    }
  }

  function handleCheckout() {
    if (cart.length === 0) {
      showToast('Your cart is empty')
      return
    }

    showToast('Order placed successfully!')
    cart = []
    saveCart()
    renderCart()
  }

  function handleProductActions(e) {
    const target = e.target.closest('button')
    if (!target) return

    const productId = parseInt(target.dataset.id)

    if (target.classList.contains('add-to-cart')) {
      addToCart(productId)
    } else if (target.classList.contains('add-to-wishlist')) {
      toggleWishlist(productId)
    } else if (target.classList.contains('quick-view')) {
      renderQuickView(productId)
    }
  }

  function addToCart(productId) {
    const existingItem = cart.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.push({ id: productId, quantity: 1 })
    }

    saveCart()
    showToast('Item added to cart')
  }

  function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId)

    if (index === -1) {
      wishlist.push(productId)
      showToast('Added to wishlist')
    } else {
      wishlist.splice(index, 1)
      showToast('Removed from wishlist')
    }

    saveWishlist()
    renderProducts()

    if (wishlistSidebar.classList.contains('active')) {
      renderWishlist()
    }
  }

  function showToast(message, isUndo = false) {
    toastMessage.textContent = message
    toastUndo.style.display = isUndo ? 'block' : 'none'
    toast.classList.add('show')

    setTimeout(() => {
      toast.classList.remove('show')
    }, 3000)
  }

  function undoLastAction() {
    if (lastAction === 'remove-from-cart' && lastRemovedItem) {
      cart.push(lastRemovedItem)
      saveCart()
      renderCart()
      showToast('Item restored to cart')
    }
    toast.classList.remove('show')
  }

  // Event delegation for cart sidebar
  cartSidebar.addEventListener('click', (e) => {
    const target = e.target.closest('button')
    if (!target) return

    const productId = parseInt(target.dataset.id)

    if (target.classList.contains('remove-from-cart')) {
      const index = cart.findIndex((item) => item.id === productId)
      if (index !== -1) {
        lastRemovedItem = cart[index]
        lastAction = 'remove-from-cart'
        cart.splice(index, 1)
        saveCart()
        renderCart()
        showToast('Item removed from cart', true)
      }
    } else if (target.classList.contains('quantity-increase')) {
      const item = cart.find((item) => item.id === productId)
      if (item) {
        item.quantity++
        saveCart()
        renderCart()
      }
    } else if (target.classList.contains('quantity-decrease')) {
      const item = cart.find((item) => item.id === productId)
      if (item && item.quantity > 1) {
        item.quantity--
        saveCart()
        renderCart()
      }
    }
  })

  // Event delegation for wishlist sidebar
  wishlistSidebar.addEventListener('click', (e) => {
    const target = e.target.closest('button')
    if (!target) return

    const productId = parseInt(target.dataset.id)

    if (target.classList.contains('remove-from-wishlist')) {
      const index = wishlist.indexOf(productId)
      if (index !== -1) {
        wishlist.splice(index, 1)
        saveWishlist()
        renderWishlist()
        renderProducts()
        showToast('Removed from wishlist')
      }
    } else if (target.classList.contains('move-to-cart')) {
      addToCart(productId)
      const index = wishlist.indexOf(productId)
      if (index !== -1) {
        wishlist.splice(index, 1)
        saveWishlist()
        renderWishlist()
        renderProducts()
      }
    }
  })
})
