/**
 * NutriPlan - Main Entry Point
 * 
 * This is the main entry point for the application.
 * Import your modules and initialize the app here.
 */
const baseUrl = 'https://nutriplan-api.vercel.app/api'
const nav = document.querySelector('nav')
const sections = document.querySelectorAll('section')
const navlinks = document.querySelectorAll('.nav-link')



//nav
const sectionsMap = {
    "meals": [
        'search-filters-section',
        'meal-categories-section',
        'all-recipes-section',
    ],

    "products-section": [
        'products-section'
    ],

    "foodlog-section": [
        'foodlog-section'
    ]
};
// select the section and add the active class 
nav.addEventListener('click', function (event) {
    const clickedLink = event.target.closest('[data-section]');
    if (!clickedLink) return;
    const sectionId = clickedLink.dataset.section;
    const sectionsToShow = sectionsMap[sectionId];

    sections.forEach(function (section) {
        if (sectionsToShow.includes(section.id)) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });


    navlinks.forEach(function (navlink) {
        if (navlink === clickedLink) {
            navlink.classList.add('bg-emerald-50', 'text-emerald-700');
            navlink.classList.remove('text-gray-600', 'hover:bg-gray-50');
        } else {
            navlink.classList.remove('bg-emerald-50', 'text-emerald-700');
            navlink.classList.add('text-gray-600', 'hover:bg-gray-50');

        }
    });

    if (sectionId === 'foodlog-section') {
        foodLog.displayFoodLog();
    }
});
class Meals {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.mealsArray = [];
        this.categoriesArray = [];
        this.categoryIcons = {
            Beef: 'fa-drumstick-bite',
            Pork: 'fa-bacon',
            Chicken: 'fa-drumstick-bite',
            Lamb: 'fa-drumstick-bite',
            Pasta: 'fa-bowl-food',
            Dessert: 'fa-cake-candles',
            Miscellaneous: 'fa-bowl-food',
            Seafood: 'fa-fish',
            Side: 'fa-bowl-rice',
            Vegan: 'fa-leaf',
            Starter: 'fa-utensils',
            Vegetarian: 'fa-leaf'
        };
        this.category = document.getElementById('categories-grid');
        this.area = document.getElementById('areas-filter');
        this.newMealsByCategory = []
        this.areasMeals = []
        this.newMealsByArea = []
        this.currentFilterName = '';
        this.searchMealsArray = [];
        this.searchInput = document.getElementById('search-input')
        this.isSearching = false;
        this.recipesGrid = document.getElementById('recipes-grid');
        this.usdaApiKey = '8wEsBnnaP1hq8obLD9KgA1VcbzoOgQShv2LrevIL'
        this.viewMode = 'grid';
        this.currentMeal = null;
        this.currentNutrition = null;
    }

    showLoader() {
        document.getElementById('recipes-grid').innerHTML = `
        <div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>`;
    }


    // call the all meals 
    async getRandomMeals() {
        this.showLoader();
        try {
            const response = await fetch(`${baseUrl}/meals/random?count=25`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            if (!response.ok) {
                throw new Error('Error', response.status)
            }
            const payload = await response.json();
            //console.log(payload.results)
            this.mealsArray = payload.results
            this.displayReandomMeals(this.mealsArray)

        } catch (error) {
            console.log(error)
        }
    }

    displayReandomMeals(data) {
        const container = document.getElementById('recipes-grid');
        const countText = document.getElementById('recipes-count');


        if (this.isSearching) {
            countText.textContent = `Showing ${data.length} recipes for "${this.currentFilterName}"`;
        } else if (this.currentFilterName === '' || this.currentFilterName === 'all') {
            countText.textContent = `Showing ${data.length} recipes`;
        } else {
            countText.textContent = `Showing ${data.length} ${this.currentFilterName} recipes`;
        }


        if (data.length === 0) {
            container.innerHTML = `<div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-magnifying-glass text-2xl text-gray-400"></i>
      </div>
      <p class="text-gray-500 text-lg">No recipes found. Try a different search term.</p>
    </div>`;
            return;
        }
        let card = ''
        for (let i = 0; i < data.length; i++) {
            card += `<div
              class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              data-meal-id=${data[i].id}
            >
              <div class="relative h-48 overflow-hidden">
                <img
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  src=${data[i].thumbnail}
                  alt=${data[i].name}
                  loading="lazy"
                />
                <div class="absolute bottom-3 left-3 flex gap-2">
                  <span
                    class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"
                  >
                    ${data[i].category}
                  </span>
                  <span
                    class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white"
                  >
                    ${data[i].area || 'International'}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <h3
                  class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
                >
                  ${data[i].name}
                </h3>
                <p class="text-xs text-gray-600 mb-3 line-clamp-2">
                  ${data[i].instructions}
                </p>
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-gray-900">
                    <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                    ${data[i].category}
                  </span>
                  <span class="font-semibold text-gray-500">
                    <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                    ${data[i].area || 'International'}
                  </span>
                </div>
              </div>
            </div>`
            document.getElementById('recipes-grid').innerHTML = card
        }
    }

    async getCategoriesMeals() {
        this.showLoader();
        try {
            const response = await fetch(`${baseUrl}/meals/categories`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            if (!response.ok) {
                throw new Error('Error', response.status)
            }
            const payload = await response.json();
            //console.log(payload.results)
            this.categoriesArray = payload.results
            this.displayCategories(this.categoriesArray)

        } catch (error) {
            console.log(error)
        }
    }

    displayCategories(data) {
        let categoryBadge = '';

        for (let i = 0; i < data.length - 2; i++) {
            const categoryName = data[i].name;
            const iconClass = this.categoryIcons[categoryName];

            categoryBadge += ` <div
              class="category-card rounded-xl p-3 border cursor-pointer transition-all group"
              data-category=${data[i].name}
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="cat-icon text-white w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
                >
                  <i class="fa-solid ${iconClass}"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">${data[i].name}</h3>
                </div>
              </div>
            </div>`
            document.getElementById('categories-grid').innerHTML = categoryBadge
        }
    }

    getCategoryName() {
        this.category.addEventListener('click', (event) => {
            const categorycard = event.target.closest('[data-category]')
            if (!categorycard) return;
            const categoryName = categorycard.dataset.category
            this.getMealsByCategory(categoryName);
        })
    }

    async getMealsByCategory(categoryName) {
        showLoader()
        try {
            const response = await fetch(`${baseUrl}/meals/filter?category=${categoryName}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            if (!response.ok) {
                throw new Error('Error', response.status)
            }
            const payload = await response.json();
            //console.log(payload.results)
            this.newMealsByCategory = payload.results
            this.displayReandomMeals(this.newMealsByCategory)

        } catch (error) {
            console.log(error)
        }
    }

    async getAreasMeals() {
        this.showLoader();
        try {
            const response = await fetch(`${baseUrl}/meals/areas`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            if (!response.ok) {
                throw new Error('Error', response.status)
            }
            const payload = await response.json();
            //console.log(payload.results)
            this.areasMeals = payload.results
            this.displayAreas(this.areasMeals)

        } catch (error) {
            console.log(error)
        }
    }

    displayAreas(data) {
        let areaBadge = `<button data-area="all"
              class="px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
            >
              All Cusinines
            </button> `;

        for (let i = 0; i < data.length - 2; i++) {

            areaBadge += `
            <button data-area=${data[i].name}
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
            >
              ${data[i].name}
            </button>`
            document.getElementById('areas-filter').innerHTML = areaBadge
        }
    }

    getAreaName() {
        this.area.addEventListener('click', (event) => {
            const areaCard = event.target.closest('[data-area]')
            if (!areaCard) return;
            const areaName = areaCard.dataset.area
            const allAreaButtons = this.area.querySelectorAll('[data-area]');
            allAreaButtons.forEach(function (btn) {
                if (btn === areaCard) {
                    btn.classList.add('bg-emerald-600', 'text-white');
                    btn.classList.remove('bg-gray-100', 'text-gray-700');
                } else {
                    btn.classList.remove('bg-emerald-600', 'text-white');
                    btn.classList.add('bg-gray-100', 'text-gray-700');
                }
            });

            if (areaName === 'all') {
                this.getRandomMeals();
            } else {
                this.getMealsByArea(areaName);
            }
        })


    }

    async getMealsByArea(areaName) {
        showLoader()
        try {
            const response = await fetch(`${baseUrl}/meals/filter?area=${areaName}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            if (!response.ok) {
                throw new Error('Error', response.status)
            }
            const payload = await response.json();
            //console.log(payload.results)
            this.newMealsByArea = payload.results
            this.isSearching = false;
            this.currentFilterName = areaName;
            this.displayReandomMeals(this.newMealsByArea)

        } catch (error) {
            console.log(error)
        }
    }
    getSearchInput() {
        this.searchInput.addEventListener('input', (event) => {
            const searchValue = event.target.value;
            if (searchValue.trim() === '') {
                this.getRandomMeals();
                this.isSearching = false;
                this.currentFilterName = '';
            } else {
                this.searchMeals(searchValue)
            }
        })
    }
    async searchMeals(searchValue) {
        try {
            const response = await fetch(`${baseUrl}/meals/search?q=${searchValue}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            if (!response.ok) {
                throw new Error('Error', response.status)
            }
            const payload = await response.json();
            //console.log(payload.results)
            this.isSearching = true;
            this.currentFilterName = searchValue;
            this.searchMealsArray = payload.results
            this.displayReandomMeals(this.searchMealsArray)

        } catch (error) {
            console.log(error)
        }
    }

    bindMealClick() {
        this.recipesGrid.addEventListener('click', (event) => {
            const mealCard = event.target.closest('[data-meal-id]');
            if (!mealCard) return;

            const mealId = mealCard.dataset.mealId;
            this.getMealDetails(mealId);
        });
    }

    async getMealDetails(mealId) {
        try {
            document.getElementById('hero-calories').textContent = 'Calculating...';
            const response = await fetch(`${baseUrl}/meals/${mealId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            if (!response.ok) {
                throw new Error('Error', response.status)
            }
            const payload = await response.json();
            //console.log(payload.result)
            this.displayMealDetails(payload.result)
            this.getNutritionData(payload.result.name, payload.result.ingredients);
            document.getElementById('all-recipes-section').classList.add('hidden');
            document.getElementById('search-filters-section').classList.add('hidden');
            document.getElementById('meal-categories-section').classList.add('hidden');
            document.getElementById('meal-details').classList.remove('hidden');

        } catch (error) {
            console.log(error)
        }
    }

    displayMealDetails(mealDetails) {

        const image = document.getElementById('meal-detail-image');
        image.src = mealDetails.thumbnail;
        image.alt = mealDetails.name;

        document.getElementById('meal-detail-name').textContent = mealDetails.name;

        document.getElementById('meal-detail-category').textContent = mealDetails.category;
        document.getElementById('meal-detail-area').textContent = mealDetails.area || 'International';

        const tagsSpan = document.getElementById('meal-detail-tags');
        if (mealDetails.tags && mealDetails.tags.length > 0) {
            tagsSpan.textContent = mealDetails.tags[0];
            tagsSpan.classList.remove('hidden');
        } else {
            tagsSpan.classList.add('hidden');
        }

        document.getElementById('ingredients-count').textContent = `${mealDetails.ingredients.length} items`;

        let ingredientsHTML = '';
        for (let i = 0; i < mealDetails.ingredients.length; i++) {
            ingredientsHTML += `
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
                <span class="text-gray-700">
                    <span class="font-medium text-gray-900">${mealDetails.ingredients[i].measure}</span>
                    ${mealDetails.ingredients[i].ingredient}
                </span>
            </div>`;
        }
        document.getElementById('meal-detail-ingredients').innerHTML = ingredientsHTML;

        let instructionsHTML = '';
        for (let i = 0; i < mealDetails.instructions.length; i++) {
            instructionsHTML += `
            <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    ${i + 1}
                </div>
                <p class="text-gray-700 leading-relaxed pt-2">${mealDetails.instructions[i]}</p>
            </div>`;
        }
        document.getElementById('meal-detail-instructions').innerHTML = instructionsHTML;

        const videoFrame = document.getElementById('meal-detail-video');
        if (mealDetails.youtube) {
            const videoId = mealDetails.youtube.split('v=')[1];
            videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
        }

        document.getElementById('log-meal-btn').dataset.mealId = mealDetails.id;
        this.currentMeal = mealDetails;
    }

    async getNutritionData(mealName, ingredients) {
        document.getElementById('nutrition-facts-container').innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-calculator text-emerald-600 text-2xl"></i>
    </div>
    <p class="text-gray-700 font-semibold">Calculating Nutrition</p>
    <p class="text-gray-400 text-sm mt-1">Analyzing ingredients...</p>
</div>
    `;
        const logBtn = document.getElementById('log-meal-btn');
        logBtn.innerHTML = `
    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
    <span>Calculating...</span>
`;
        logBtn.disabled = true;

        try {
            const ingredientStrings = ingredients.map(function (item) {
                return `${item.measure} ${item.ingredient}`;
            });

            const response = await fetch(`${this.baseUrl}/nutrition/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.usdaApiKey
                },
                body: JSON.stringify({
                    recipeName: mealName,
                    ingredients: ingredientStrings
                })
            });

            if (!response.ok) {
                throw new Error('Error: ' + response.status);
            }

            const payload = await response.json();
            console.log(payload.data);
            this.displayNutrition(payload.data);

        } catch (error) {
            console.log(error);
        }
    }

    displayNutrition(data) {


        const dailyValues = {
            protein: 50,
            carbs: 300,
            fat: 65,
            fiber: 25,
            sugar: 50,
            saturatedFat: 20
        };

        function calcWidth(value, max) {
            const percent = (value / max) * 100;
            return Math.min(percent, 100);
        }


        document.getElementById('hero-calories').textContent = `${data.perServing.calories} cal/serving`;


        document.getElementById('hero-servings').textContent = `${data.servings} servings`;


        document.getElementById('nutrition-facts-container').innerHTML = `
        <p class="text-sm text-gray-500 mb-4">Per serving</p>

        <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
            <p class="text-sm text-gray-600">Calories per serving</p>
            <p class="text-4xl font-bold text-emerald-600">${data.perServing.calories}</p>
            <p class="text-xs text-gray-500 mt-1">Total: ${data.totals.calories} cal</p>
        </div>

        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span class="text-gray-700">Protein</span>
                </div>
                <span class="font-bold text-gray-900">${data.perServing.protein}g</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: ${calcWidth(data.perServing.protein, dailyValues.protein)}%"></div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="text-gray-700">Carbs</span>
                </div>
                <span class="font-bold text-gray-900">${data.perServing.carbs}g</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: ${calcWidth(data.perServing.carbs, dailyValues.carbs)}%"></div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span class="text-gray-700">Fat</span>
                </div>
                <span class="font-bold text-gray-900">${data.perServing.fat}g</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-purple-500 h-2 rounded-full" style="width: ${calcWidth(data.perServing.fat, dailyValues.fat)}%"></div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span class="text-gray-700">Fiber</span>
                </div>
                <span class="font-bold text-gray-900">${data.perServing.fiber}g</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-orange-500 h-2 rounded-full" style="width: ${calcWidth(data.perServing.fiber, dailyValues.fiber)}%"></div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span class="text-gray-700">Sugar</span>
                </div>
                <span class="font-bold text-gray-900">${data.perServing.sugar}g</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-pink-500 h-2 rounded-full" style="width: ${calcWidth(data.perServing.sugar, dailyValues.sugar)}%"></div>
            </div>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <span class="text-gray-700">Saturated Fat</span>
                </div>
                <span class="font-bold text-gray-900">${data.perServing.saturatedFat}g</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-red-500 h-2 rounded-full" style="width: ${calcWidth(data.perServing.saturatedFat, dailyValues.saturatedFat)}%"></div>
            </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Other</h3>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">Cholesterol</span>
                    <span class="font-medium">${data.perServing.cholesterol}mg</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Sodium</span>
                    <span class="font-medium">${data.perServing.sodium}mg</span>
                </div>
            </div>
        </div>
    `;


        const logBtn = document.getElementById('log-meal-btn');
        logBtn.innerHTML = `
        <i class="fa-solid fa-clipboard-list"></i>
        <span>Log This Meal</span>
    `;
        logBtn.disabled = false;
        this.currentNutrition = data.perServing;
    }

    bindBackButton() {
        document.getElementById('back-to-meals-btn').addEventListener('click', () => {
            document.getElementById('meal-details').classList.add('hidden');
            document.getElementById('search-filters-section').classList.remove('hidden');
            document.getElementById('meal-categories-section').classList.remove('hidden');
            document.getElementById('all-recipes-section').classList.remove('hidden');
        });
    }

    initViewToggle() {
        const gridBtn = document.getElementById('grid-view-btn');
        const listBtn = document.getElementById('list-view-btn');

        gridBtn.addEventListener('click', () => this.setView('grid'));
        listBtn.addEventListener('click', () => this.setView('list'));
    }

    setView(mode) {
        this.viewMode = mode;

        const grid = document.getElementById('recipes-grid');
        const gridBtn = document.getElementById('grid-view-btn');
        const listBtn = document.getElementById('list-view-btn');

        if (mode === 'grid') {
            grid.className = 'grid grid-cols-4 gap-5';
            gridBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
            listBtn.className = 'px-3 py-1.5';
            gridBtn.querySelector('i').classList.replace('text-gray-500', 'text-gray-700');
            listBtn.querySelector('i').classList.replace('text-gray-700', 'text-gray-500');
        } else {
            grid.className = 'grid grid-cols-2 gap-4';
            listBtn.className = 'px-3 py-1.5 bg-white rounded-md shadow-sm';
            gridBtn.className = 'px-3 py-1.5';
            listBtn.querySelector('i').classList.replace('text-gray-500', 'text-gray-700');
            gridBtn.querySelector('i').classList.replace('text-gray-700', 'text-gray-500');
        }
    }

    clickLogMeal() {
        document.getElementById('log-meal-btn').addEventListener('click', () => {
            this.displayLogPopup();
        });
    }

    displayLogPopup() {
        const meal = this.currentMeal;
        const nutrition = this.currentNutrition;

        if (!meal || !nutrition) {
            return;
        }

        document.getElementById('log-popup').innerHTML = `
    <div id="log-meal-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center gap-4 mb-6">
          <img src="${meal.thumbnail}" class="w-16 h-16 rounded-xl object-cover">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
            <p class="text-gray-500 text-sm">${meal.name}</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
          <div class="flex items-center gap-3">
            <button id="decrease-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200">
              <i class="fa-solid fa-minus text-gray-600"></i>
            </button>
            <input id="meal-servings" type="number" value="1" min="0.5" step="0.5"
              class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2">
            <button id="increase-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200">
              <i class="fa-solid fa-plus text-gray-600"></i>
            </button>
          </div>
        </div>

        <div class="bg-emerald-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div>
              <p class="text-lg font-bold text-emerald-600">${nutrition.calories}</p>
              <p class="text-xs text-gray-500">Calories</p>
            </div>
            <div>
              <p class="text-lg font-bold text-blue-600">${nutrition.protein}g</p>
              <p class="text-xs text-gray-500">Protein</p>
            </div>
            <div>
              <p class="text-lg font-bold text-amber-600">${nutrition.carbs}g</p>
              <p class="text-xs text-gray-500">Carbs</p>
            </div>
            <div>
              <p class="text-lg font-bold text-purple-600">${nutrition.fat}g</p>
              <p class="text-xs text-gray-500">Fat</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold">Cancel</button>
          <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold">
            <i class="fa-solid fa-clipboard-list mr-2"></i>Log Meal
          </button>
        </div>
      </div>
    </div>`;

        document.getElementById('cancel-log-meal').addEventListener('click', () => {
            document.getElementById('log-popup').innerHTML = '';
        });

        document.getElementById('increase-servings').addEventListener('click', () => {
            const input = document.getElementById('meal-servings');
            input.value = Number(input.value) + 0.5;
        });

        document.getElementById('decrease-servings').addEventListener('click', () => {
            const input = document.getElementById('meal-servings');
            if (Number(input.value) > 0.5) {
                input.value = Number(input.value) - 0.5;
            }
        });

        document.getElementById('confirm-log-meal').addEventListener('click', () => {
            this.saveMeal();
        });
    }

    saveMeal() {
        const n = this.currentNutrition;
        const servings = Number(document.getElementById('meal-servings').value);

        const mealToSave = {
            type: 'meal',
            name: this.currentMeal.name,
            image: this.currentMeal.thumbnail,
            servings: servings,
            calories: n.calories,
            protein: n.protein,
            carbs: n.carbs,
            fat: n.fat,
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            date: new Date().toDateString()
        };

        const savedMeals = JSON.parse(localStorage.getItem('loggedMeals')) || [];
        savedMeals.push(mealToSave);
        localStorage.setItem('loggedMeals', JSON.stringify(savedMeals));

        document.getElementById('log-popup').innerHTML = '';

        Swal.fire({
            icon: 'success',
            title: 'Meal Logged!',
            html: this.currentMeal.name + ' (' + servings + ' serving) has been added to your daily log.<br><br><b>+' + n.calories + ' calories</b>',
            confirmButtonColor: '#2563eb'
        });
    }



}

// Create an instance of the Meals class
const mealsController = new Meals(baseUrl)
mealsController.getRandomMeals()
mealsController.getCategoriesMeals()
mealsController.getCategoryName()
mealsController.getAreasMeals()
mealsController.getAreaName()
mealsController.getSearchInput()
mealsController.bindMealClick()
mealsController.bindBackButton()
mealsController.initViewToggle()
mealsController.clickLogMeal()


class FoodLog {
    constructor() {
        this.calorieGoal = 2000;
    this.proteinGoal = 50;
    this.carbsGoal = 250;
    this.fatGoal = 65;
    }

    getSavedMeals() {
        return JSON.parse(localStorage.getItem('loggedMeals')) || [];
    }

    getTodayMeals() {
        const allMeals = this.getSavedMeals();
        const today = new Date().toDateString();
        const todayMeals = [];

        for (let i = 0; i < allMeals.length; i++) {
            if (allMeals[i].date === today) {
                todayMeals.push(allMeals[i]);
            }
        }
        return todayMeals;
    }

    displayFoodLog() {
        const todayMeals = this.getTodayMeals();
        this.displayDate();
        this.displayTodayNutrition(todayMeals);
        this.displayLoggedItems(todayMeals);
    }

    displayDate() {
        document.getElementById('foodlog-date').textContent =
            new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });
    }

    displayTodayNutrition(todayMeals) {
        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;

        for (let i = 0; i < todayMeals.length; i++) {
            const meal = todayMeals[i];
            calories += meal.calories * meal.servings;
            protein += meal.protein * meal.servings;
            carbs += meal.carbs * meal.servings;
            fat += meal.fat * meal.servings;
        }

        document.getElementById('today-calories-text').textContent =
            Math.round(calories) + ' / ' + this.calorieGoal + ' kcal';
        document.getElementById('today-protein-text').textContent =
            Math.round(protein) + ' / ' + this.proteinGoal + ' g';
        document.getElementById('today-carbs-text').textContent =
            Math.round(carbs) + ' / ' + this.carbsGoal + ' g';
        document.getElementById('today-fat-text').textContent =
            Math.round(fat) + ' / ' + this.fatGoal + ' g';

        document.getElementById('today-calories-bar').style.width =
            Math.min((calories / this.calorieGoal) * 100, 100) + '%';
        document.getElementById('today-protein-bar').style.width =
            Math.min((protein / this.proteinGoal) * 100, 100) + '%';
        document.getElementById('today-carbs-bar').style.width =
            Math.min((carbs / this.carbsGoal) * 100, 100) + '%';
        document.getElementById('today-fat-bar').style.width =
            Math.min((fat / this.fatGoal) * 100, 100) + '%';
    }

    displayLoggedItems(todayMeals) {
        document.getElementById('logged-items-count').textContent =
            'Logged Items (' + todayMeals.length + ')';

        const clearBtn = document.getElementById('clear-foodlog');
        const list = document.getElementById('logged-items-list');

        if (todayMeals.length === 0) {
            clearBtn.style.display = 'none';
            list.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
                    <p class="font-medium">No meals logged today</p>
                </div>`;
            return;
        }

        clearBtn.style.display = 'block';

        let cards = '';
        for (let i = 0; i < todayMeals.length; i++) {
            const meal = todayMeals[i];
            const totalCalories = Math.round(meal.calories * meal.servings);
            const totalProtein = Math.round(meal.protein * meal.servings);
            const totalCarbs = Math.round(meal.carbs * meal.servings);
            const totalFat = Math.round(meal.fat * meal.servings);

            cards += `
<div class="bg-white rounded-xl p-3 border border-gray-200 flex items-center gap-3">
    <img src="${meal.image}" class="w-14 h-14 rounded-lg object-cover">
    <div class="flex-1">
        <p class="font-bold text-gray-900">${meal.name}</p>
        <p class="text-sm text-gray-500">${meal.servings} servings • Recipe</p>
        <p class="text-xs text-gray-400">${meal.time}</p>
    </div>
    <div class="text-right">
        <p class="font-bold text-emerald-600">${totalCalories} kcal</p>
        <p class="text-xs text-gray-500">${totalProtein}g P • ${totalCarbs}g C • ${totalFat}g F</p>
    </div>
    <button type="button" class="delete-meal-btn text-gray-400 hover:text-red-500" data-index="${i}">
        <i class="fa-solid fa-trash pointer-events-none"></i>
    </button>
</div>`;
        }
        list.innerHTML = cards;
    }

    clickClearFoodLog() {
        document.getElementById('clear-foodlog').addEventListener('click', () => {
            localStorage.removeItem('loggedMeals');
            this.displayFoodLog();
        });
    }


 clickDeleteMeal() {
    document.getElementById('logged-items-list').addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.delete-meal-btn');
        if (!deleteBtn) return;

        const index = Number(deleteBtn.dataset.index);
        this.deleteMeal(index);
    });
}

deleteMeal(index) {
    const allMeals = this.getSavedMeals();
    allMeals.splice(index, 1);
    localStorage.setItem('loggedMeals', JSON.stringify(allMeals));
    this.displayFoodLog();
}


}



const foodLog = new FoodLog();
foodLog.clickClearFoodLog();
foodLog.clickDeleteMeal();

class Products {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.categoriesArray = [];
        this.productsArray = [];
        this.currentProduct = null;

        this.searchInput = document.getElementById('product-search-input');
        this.searchBtn = document.getElementById('search-product-btn');
        this.barcodeInput = document.getElementById('barcode-input');
        this.barcodeBtn = document.getElementById('lookup-barcode-btn');
        this.categoriesContainer = document.getElementById('product-categories');
        this.productsGrid = document.getElementById('products-grid');
    }

    showLoader() {
        this.productsGrid.innerHTML = `
            <div class="flex items-center justify-center py-12 col-span-full">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>`;
    }

    
    async getProductCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/products/categories?page=1&limit=50`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Error: ' + response.status);
            }
            const payload = await response.json();
            this.categoriesArray = payload.results;
            this.displayCategories(this.categoriesArray);
        } catch (error) {
            console.log(error);
        }
    }

    displayCategories(data) {
    let badges = '';
    for (let i = 0; i < data.length; i++) {
        badges += `
            <button
                class="product-category-btn px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-200 transition-all"
                data-category="${data[i].id}"
            >
                ${data[i].name}
            </button>`;
    }
    this.categoriesContainer.innerHTML = badges;
}

    bindCategoryClick() {
        this.categoriesContainer.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-category]');
            if (!btn) return;
            const categoryName = btn.dataset.category;
            this.getProductsByCategory(categoryName);
        });
    }

    async getProductsByCategory(categoryName) {
        this.showLoader();
        try {
            const response = await fetch(`${this.baseUrl}/products/category/${categoryName}?page=1&limit=24`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Error: ' + response.status);
            }
            const payload = await response.json();
            this.productsArray = payload.results;
            this.displayProducts(this.productsArray);
        } catch (error) {
            console.log(error);
        }
    }


    bindSearch() {
        this.searchBtn.addEventListener('click', () => {
            const query = this.searchInput.value.trim();
            if (query === '') return;
            this.searchProducts(query);
        });
    }

    async searchProducts(query) {
        this.showLoader();
        try {
            const response = await fetch(`${this.baseUrl}/products/search?q=${query}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Error: ' + response.status);
            }
            const payload = await response.json();
            this.productsArray = payload.results;
            document.getElementById('products-count').textContent = `Found ${payload.count} products for "${query}"`;
            this.displayProducts(this.productsArray);
        } catch (error) {
            console.log(error);
        }
    }


    bindBarcodeSearch() {
        this.barcodeBtn.addEventListener('click', () => {
            const code = this.barcodeInput.value.trim();
            if (code === '') return;
            this.getProductByBarcode(code);
        });
    }

    async getProductByBarcode(code) {
        this.showLoader();
        try {
            const response = await fetch(`${this.baseUrl}/products/barcode/${code}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Error: ' + response.status);
            }
            const payload = await response.json();
            this.productsArray = [payload.result];   
            this.displayProducts(this.productsArray);
        } catch (error) {
            console.log(error);
        }
    }

   
    displayProducts(data) {
    if (data.length === 0) {
        this.productsGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
                </div>
                <p class="text-gray-500 text-lg">No products found</p>
                <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
            </div>`;
        return;
    }

    let cards = '';
    for (let i = 0; i < data.length; i++) {
        const p = data[i];
        const grade = (p.nutritionGrade || 'unknown').toUpperCase();
        const image = p.image || '';
        const brand = p.brand || 'Unknown Brand';

        cards += `
            <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${p.barcode}">
                <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    ${image
                ? `<img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center\\'><i class=\\'fa-solid fa-box text-gray-400 text-2xl\\'></i></div>'">`
                : `<div class="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center"><i class="fa-solid fa-box text-gray-400 text-2xl"></i></div>`
            }
                    <div class="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                        Nutri-Score ${grade}
                    </div>
                </div>
                <div class="p-4">
                    <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${brand}</p>
                    <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${p.name}</h3>
                    <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span><i class="fa-solid fa-fire mr-1"></i>${p.nutrients.calories} kcal/100g</span>
                    </div>
                    <div class="grid grid-cols-4 gap-1 text-center">
                        <div class="bg-emerald-50 rounded p-1.5">
                            <p class="text-xs font-bold text-emerald-700">${p.nutrients.protein}g</p>
                            <p class="text-[10px] text-gray-500">Protein</p>
                        </div>
                        <div class="bg-blue-50 rounded p-1.5">
                            <p class="text-xs font-bold text-blue-700">${p.nutrients.carbs}g</p>
                            <p class="text-[10px] text-gray-500">Carbs</p>
                        </div>
                        <div class="bg-purple-50 rounded p-1.5">
                            <p class="text-xs font-bold text-purple-700">${p.nutrients.fat}g</p>
                            <p class="text-[10px] text-gray-500">Fat</p>
                        </div>
                        <div class="bg-orange-50 rounded p-1.5">
                            <p class="text-xs font-bold text-orange-700">${p.nutrients.sugar}g</p>
                            <p class="text-[10px] text-gray-500">Sugar</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    this.productsGrid.innerHTML = cards;
}

    
    bindProductClick() {
        this.productsGrid.addEventListener('click', (event) => {
            const card = event.target.closest('[data-barcode]');
            if (!card) return;
            const barcode = card.dataset.barcode;

           
            const product = this.productsArray.find(function(item) {
                return item.barcode === barcode;
            });
            if (!product) return;

            this.currentProduct = product;
            this.displayProductModal(product);
        });
    }

    displayProductModal(p) {
    const grade = (p.nutritionGrade || 'unknown').toUpperCase();
    const gradeColors = {
        A: '#1e8f4e', B: '#85bb2f', C: '#fecb02', D: '#ee8100', E: '#e63e11'
    };
    const gradeColor = gradeColors[grade] || '#9ca3af';
    const image = p.image || '';

    document.getElementById('product-modal-popup').innerHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="product-detail-modal">
            <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex items-start gap-6 mb-6">
                        <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                            ${image
            ? `<img src="${image}" alt="${p.name}" class="w-full h-full object-contain">`
            : `<i class="fa-solid fa-box text-5xl text-gray-300"></i>`
        }
                        </div>
                        <div class="flex-1">
                            <p class="text-sm text-emerald-600 font-semibold mb-1">${p.brand || 'Unknown Brand'}</p>
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">${p.name}</h2>

                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${gradeColor}20">
                                    <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: ${gradeColor}">
                                        ${grade}
                                    </span>
                                    <div>
                                        <p class="text-xs font-bold" style="color: ${gradeColor}">Nutri-Score</p>
                                    </div>
                                </div>
                                ${p.novaGroup ? `
                                <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                                    <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-gray-500">
                                        ${p.novaGroup}
                                    </span>
                                    <div>
                                        <p class="text-xs font-bold text-gray-700">NOVA</p>
                                    </div>
                                </div>` : ''}
                            </div>
                        </div>
                        <button id="close-product-modal" class="text-gray-400 hover:text-gray-600">
                            <i class="fa-solid fa-xmark text-2xl"></i>
                        </button>
                    </div>

                    <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
                        <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                            Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
                        </h3>

                        <div class="text-center mb-4 pb-4 border-b border-emerald-200">
                            <p class="text-4xl font-bold text-gray-900">${p.nutrients.calories}</p>
                            <p class="text-sm text-gray-500">Calories</p>
                        </div>

                        <div class="grid grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min(p.nutrients.protein * 2, 100)}%"></div>
                                </div>
                                <p class="text-lg font-bold text-emerald-600">${p.nutrients.protein}g</p>
                                <p class="text-xs text-gray-500">Protein</p>
                            </div>
                            <div class="text-center">
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(p.nutrients.carbs, 100)}%"></div>
                                </div>
                                <p class="text-lg font-bold text-blue-600">${p.nutrients.carbs}g</p>
                                <p class="text-xs text-gray-500">Carbs</p>
                            </div>
                            <div class="text-center">
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min(p.nutrients.fat * 1.5, 100)}%"></div>
                                </div>
                                <p class="text-lg font-bold text-purple-600">${p.nutrients.fat}g</p>
                                <p class="text-xs text-gray-500">Fat</p>
                            </div>
                            <div class="text-center">
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div class="bg-orange-500 h-2 rounded-full" style="width: ${Math.min(p.nutrients.sugar * 2, 100)}%"></div>
                                </div>
                                <p class="text-lg font-bold text-orange-600">${p.nutrients.sugar}g</p>
                                <p class="text-xs text-gray-500">Sugar</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-200">
                            <div class="text-center">
                                <p class="text-sm font-semibold text-gray-900">${p.nutrients.fiber}g</p>
                                <p class="text-xs text-gray-500">Fiber</p>
                            </div>
                            <div class="text-center">
                                <p class="text-sm font-semibold text-gray-900">${p.nutrients.sodium}g</p>
                                <p class="text-xs text-gray-500">Sodium</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <button id="add-product-to-log" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
                            <i class="fa-solid fa-plus mr-2"></i>Log This Food
                        </button>
                        <button id="close-product-modal-2" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    document.getElementById('close-product-modal').addEventListener('click', () => {
        document.getElementById('product-modal-popup').innerHTML = '';
    });
    document.getElementById('close-product-modal-2').addEventListener('click', () => {
        document.getElementById('product-modal-popup').innerHTML = '';
    });
    document.getElementById('add-product-to-log').addEventListener('click', () => {
        this.saveProduct();
    });
}

    
    saveProduct() {
    const p = this.currentProduct;

    const productToSave = {
        type: 'product',
        name: p.name,
        image: p.image || '', 
        servings: 1,
        calories: p.nutrients.calories,
        protein: p.nutrients.protein,
        carbs: p.nutrients.carbs,
        fat: p.nutrients.fat,
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        date: new Date().toDateString()
    };

    const savedMeals = JSON.parse(localStorage.getItem('loggedMeals')) || [];
    savedMeals.push(productToSave);
    localStorage.setItem('loggedMeals', JSON.stringify(savedMeals));

    document.getElementById('product-modal-popup').innerHTML = '';

    Swal.fire({
        icon: 'success',
        title: 'Product Logged!',
        html: p.name + ' has been added to your daily log.<br><br><b>+' + p.nutrients.calories + ' calories</b>',
        confirmButtonColor: '#2563eb'
    });
}
}


const productsController = new Products(baseUrl);
productsController.getProductCategories();
productsController.bindCategoryClick();
productsController.bindSearch();
productsController.bindBarcodeSearch();
productsController.bindProductClick();