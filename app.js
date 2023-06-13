let bookList = [];
let basketList = [];

const toggleModal = () => {
  const basketModalEl = document.querySelector(".basket-modal");
  basketModalEl.classList.toggle("active");
};

const getBooks = () => {
  fetch("./products.json")
    .then((res) => res.json())
    .then((books) => (bookList = books));
};

getBooks();

const createBookStars = (starRate) => {
  let starRateHtml = "";
  for (i = 1; i <= 5; i++) {
    if (Math.round(starRate >= i))
      starRateHtml += `<i class="bi bi-star-fill active"></i>`;
    else starRateHtml += `<i class="bi bi-star-fill"></i>`;
  }
  return starRateHtml;
};

const createBookItemsHtml = () => {
  const bookListEl = document.querySelector(".book-list");
  let bookListHtml = "";
  bookList.forEach((book, index) => {
    bookListHtml += `  <div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
    <div class="row book-card">
      <div class="col-6">
        <img
          class="img-fluid shadow"
          src="${book.imgSource}"
          width="258"
          height="400"
        />
      </div>
      <div class="col-6 d-flex flex-column justify-content-between">
        <div class="book-detail">
          <span class="fos gray fs-5">${book.author}</span> <br />
          <span class="fs-4 fw-bold">${book.name}</span> <br />
          <span class="book-star-rate">
            ${createBookStars(book.starRate)} 
          <span class="book-reviews">${book.reviewCount} reviews</span>
          </span>
        </div>
        <p class="book-description fos gray">
          ${book.description}
        </p>
        <div>
        <span class="black fw-bold fs-5 me-2">₺${book.price}</span>
        ${
          book.oldPrice
            ? `<span class=" text-decoration-line-through fw-bold old__price">₺${book.oldPrice}</span>`
            : ""
        }
        </div>
        <button class="btn-purple" onclick="addBookToBasket(${
          book.id
        })">ADD BASKET</button>
      </div>
    </div>
  </div>
    `;
  });

  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  SELFIMPROVEMENT: "Kişisel Gelişim",
  HISTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim",
};

const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let FilterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (FilterTypes.findIndex((filter) => filter == book.type) == -1)
      FilterTypes.push(book.type);
  });
  FilterTypes.forEach((type, index) => {
    filterHtml += `<li class=" ${
      index == 0 ? "active" : null
    }" onclick = "filterBooks(this)" data-type="${type}")>${
      BOOK_TYPES[type] || type
    }</li>`;
  });
  filterEl.innerHTML = filterHtml;
};

const filterBooks = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let bookType = filterEl.dataset.type;
  getBooks();
  if (bookType != "ALL")
    bookList = bookList.filter((book) => book.type == bookType);
  createBookItemsHtml();
};

const listBasketItems = () => {
  localStorage.setItem("basketList", JSON.stringify(basketList));
  const basketListEl = document.querySelector(".basket-list");
  const basketCountEl = document.querySelector(".basket-count");
  basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
  const totalPriceEl = document.querySelector(".total-price");
  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price;
    basketListHtml += `
    <li class="basket-item">
    <img
      src="${item.product.imgSource}"
      width="100"
      height="100"
      alt=""
    />
    <div class="basket-item-info">
      <h3 class="book-name">${item.product.name}</h3>
      <span class="book-price">₺${item.product.price}</span><br />
      <span class="book-remove" onclick="removeItemFromBasket(${item.product.id})">remove</span>
    </div>
    <div class="book-count">
      <span class="decrease" onclick ="decreaseItem(${item.product.id})">-</span>
      <span>${item.quantity}</span>
      <span class="increase" onclick ="increaseItem(${item.product.id})">+</span>
    </div>
  </li>`;
  });
  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : `<li class="basket-item">No items to buy again.</li>`;
  totalPriceEl.innerHTML =
    totalPrice > 0 ? "Total : ₺" + totalPrice.toFixed(2) : null;
};

const addBookToBasket = (bookId) => {
  let findedBook = bookList.find((book) => book.id == bookId);
  if (findedBook) {
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id == bookId
    );
    if (basketAlreadyIndex == -1) {
      let addedItem = { quantity: 1, product: findedBook };
      basketList.push(addedItem);
    } else {
      if (
        basketList[basketAlreadyIndex].quantity <
        basketList[basketAlreadyIndex].product.stock
      )
        basketList[basketAlreadyIndex].quantity += 1;
      else {
        alert("Sorry, we don't have enough stock.");
        return;
      }
    }
    listBasketItems();
  }
};

const removeItemFromBasket = (bookId) => {
  findedIndex = basketList.findIndex((basket) => basket.product.id == bookId);
  if (findedIndex != -1) {
    basketList.splice(findedIndex, 1);
  }
  listBasketItems();
};

const decreaseItem = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (basketList[findedIndex].quantity != 1)
      basketList[findedIndex].quantity -= 1;
    else removeItemFromBasket(bookId);
    listBasketItems();
  }
};

const increaseItem = (bookId) => {
  const findedIndex = basketList.findIndex(
    (basket) => basket.product.id == bookId
  );
  if (findedIndex != -1) {
    if (
      basketList[findedIndex].quantity != basketList[findedIndex].product.stock
    )
      basketList[findedIndex].quantity += 1;
    else alert("Sorry, we don't have enough stock.");
  }
  basketList[findedIndex].quantity++;
};

if (localStorage.getItem("basketList")) {
  basketList = JSON.parse(localStorage.getItem("basketList"));
  listBasketItems();
}

setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 100);
