
const searchBtn = document.querySelector("[data-search-btn]");
const searchContainer = document.querySelector("[data-search-container]");
const searchSubmitBtn = document.querySelector("[data-search-submit-btn]");
const searchCloseBtn = document.querySelector("[data-search-close-btn]");

const searchBoxElems = [searchBtn, searchSubmitBtn, searchCloseBtn];

for (let i = 0; i < 3; i++) {
  searchBoxElems[i].addEventListener("click", function () {
    searchContainer.classList.toggle("active");
    document.body.classList.toggle("active");
  });
}

async function search() {
  const searchItem = document.getElementById('searchItem').value.toLowerCase();
  console.log(searchItem);
  
  const filteredRestaurants = restaurants.filter(restaurant => {

      const matchesName = restaurant.restaurantName.toLowerCase().includes(searchItem);
      const matchesAddress = restaurant.address.toLowerCase().includes(searchItem);
      
      const matchesFood = restaurant.foods.some(food =>
          food.foodName.toLowerCase().includes(searchItem)
      );
      
      return matchesName || matchesAddress || matchesFood;
});

  console.log(filteredRestaurants);
  displayRestaurants(filteredRestaurants);
  document.querySelector("[data-search-close-btn]").click();
}

function displayRestaurants(restaurants){
            container.innerHTML = ''; 
            var restaurantCard = '<ul class="food-menu-list">';
            restaurants.forEach(restaurant => {
                restaurantCard +=   `
                    <li onclick="handle('${restaurant._id}')" data-type="${restaurant.restaurantType}">
                        <div class="food-menu-card">
                            <div class="card-banner">
                                <img src="${restaurant.imageUrl}" alt="${restaurant.restaurantName}" class="w-100">
                            </div>
                            <div class="wrapper">
                                <p class="category">${restaurant.restaurantType}</p>
                                <div class="rating-wrapper">
                                    ${generateStars(restaurant.rating)}
                                </div>
                            </div>
                            <h3 class="h3 card-title">${restaurant.restaurantName}</h3>
                            <div class="price-wrapper">
                                <p class="price-text">Address:</p>
                                <data class="price">${restaurant.address}</data>
                            </div>
                        </div>
                    </li>
                `;   
            });
            restaurantCard += '</ul>';
            container.innerHTML = restaurantCard;
            // Add event listeners to favorite buttons
            document.querySelectorAll('.favorite-btn').forEach(button => {
              button.addEventListener('click', (event) => handleFavoriteClick(event, button));
          });
}

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", function() {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    this.classList.add("active");

    const filterType = this.textContent.trim();

    const restaurants = document.querySelectorAll(".food-menu-list li");

    restaurants.forEach(restaurant => {
      const restaurantType = restaurant.getAttribute("data-type");

      if (
        filterType === "Both" ||
        filterType === restaurantType ||
        restaurantType === "Both" && (filterType === "Veg" || filterType === "Non-Veg")
      ) {
        restaurant.style.display = "";
      } else {
        restaurant.style.display = "none";
      }
    });
  });
});

