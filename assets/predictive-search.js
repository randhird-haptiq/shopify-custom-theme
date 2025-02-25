class PredictiveSearch extends HTMLElement {
  constructor() {
    super();

    this.input = this.querySelector('input[type="search"]');
    this.predictiveSearchResults = this.querySelector("#predictive-search");

    this.input.addEventListener(
      "input",
      this.debounce((event) => {
        this.onChange(event);
      }, 300).bind(this)
    );
  }

  onChange() {
    const searchTerm = this.input.value.trim();

    if (!searchTerm.length) {
      this.close();
      return;
    }

    this.getSearchResults(searchTerm);
  }

  getSearchResults(searchTerm) {
    fetch(
      `/search/suggest.json?q=${encodeURIComponent(
        searchTerm
      )}&resources[type]=product,page,collection`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Predictive Search API Response:", data); // Debugging

        if (
          !data.resources.results.products.length &&
          !data.resources.results.pages.length &&
          !data.resources.results.collections.length
        ) {
          this.close();
          return;
        }

        // Clear old results
        this.predictiveSearchResults.innerHTML = "";

        // Append Products (Limit to 4)
        if (data.resources.results.products.length) {
          const productHeader = document.createElement("h3");
          productHeader.textContent = "Products";
          this.predictiveSearchResults.appendChild(productHeader);

          const productsToShow = data.resources.results.products.slice(0, 4); // ✅ Limit to 4 products

          productsToShow.forEach((product) => {
            const resultItem = document.createElement("div");
            resultItem.innerHTML = `
              <a href="${product.url}" class="search-result-item">
                <img src="${product.image}" alt="${product.title}" width="50" />
                <span>${product.title}</span>
              </a>
            `;
            this.predictiveSearchResults.appendChild(resultItem);
          });
        }

        // Append Collections (No Limit)
        if (data.resources.results.collections.length) {
          const collectionHeader = document.createElement("h3");
          collectionHeader.textContent = "Collections";
          this.predictiveSearchResults.appendChild(collectionHeader);

          data.resources.results.collections.forEach((collection) => {
            const resultItem = document.createElement("div");
            resultItem.innerHTML = `
              <a href="${collection.url}" class="search-result-item">
                <span>${collection.title}</span>
              </a>
            `;
            this.predictiveSearchResults.appendChild(resultItem);
          });
        }

        if (data.resources.results.pages.length) {
          const pageHeader = document.createElement("h3");
          pageHeader.textContent = "Pages";
          this.predictiveSearchResults.appendChild(pageHeader);

          data.resources.results.pages.forEach((page) => {
            const resultItem = document.createElement("div");
            resultItem.innerHTML = `
              <a href="${page.url}" class="search-result-item">
                <span>${page.title}</span>
              </a>
            `;
            this.predictiveSearchResults.appendChild(resultItem);
          });
        }

        this.open();
      })
      .catch((error) => {
        console.error("Predictive Search Fetch Error:", error);
        this.close();
      });
  }

  open() {
    this.predictiveSearchResults.style.display = "block";
  }

  close() {
    this.predictiveSearchResults.style.display = "none";
  }

  debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
}

customElements.define("predictive-search", PredictiveSearch);
