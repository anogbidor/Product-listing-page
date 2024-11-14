document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://fakestoreapi.com/products'
  const productList = document.getElementById('product-list')
  const searchBar = document.getElementById('search-bar')
  const sortOptions = document.getElementById('sort-options')
  const loadingIndicator = document.getElementById('loading')
  const errorIndicator = document.getElementById('error')
  const cartCount = document.getElementById('cart-count')
  let products = []
  let cart = 0

  async function fetchProducts() {
    try {
      console.log('Fetching products...')
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Something went wrong')
      products = await response.json()
      displayProducts(products)
    } catch (error) {
      console.error('Fetching error:', error)
      errorIndicator.style.display = 'block'
    } finally {
      loadingIndicator.style.display = 'none'
    }
  }

  function displayProducts(products) {
    productList.innerHTML = products
      .map(
        (product) => `
                    <div class="product-item">
                        <img src="${product.image}" alt="${product.title}">
                        <h2>${product.title}</h2>
                        <div class="price-info">
                          <p>$${product.price.toFixed(2)}</p>
                        <button onclick="addToCart(${
                          product.id
                        })">Add to Cart</button>
                        </div>
                        
                    </div>
                `
      )
      .join('')
  }

  function sortProducts(criteria) {
    let sortedProducts = [...products]
    if (criteria === 'low-to-high') {
      sortedProducts.sort((a, b) => a.price - b.price)
    } else if (criteria === 'high-to-low') {
      sortedProducts.sort((a, b) => b.price - a.price)
    }
    displayProducts(sortedProducts)
  }

  window.addToCart = function (productId) {
    cart++
    cartCount.textContent = cart
  }

  searchBar.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase()
    const filteredProducts = products.filter((product) =>
      product.title.toLowerCase().includes(query)
    )
    displayProducts(filteredProducts)
  })

  sortOptions.addEventListener('change', (event) => {
    sortProducts(event.target.value)
  })

  fetchProducts()
})
