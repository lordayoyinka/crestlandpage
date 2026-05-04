const filterButtons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.card');

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        // Remove the active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove('active'));

        // Add the active class to the clicked button
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        // Loop through the cards and hide/show them based on the filter
        cards.forEach((card) => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Get the input field and cards
const searchInput = document.getElementById("searchInput");
const allCards = document.querySelectorAll(".card");

searchInput.addEventListener("input", () => {
    const searchQuery = searchInput.value.toLowerCase();

    allCards.forEach((card) => {
        const title = card.querySelector(".title").textContent.toLowerCase();
        const date = card.querySelector(".date").textContent.toLowerCase();

        if (title.includes(searchQuery) || date.includes(searchQuery)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

// Get the "View More" button and cards container for the "All" category
const viewMoreButtonAll = document.querySelector("#all-cards .view-more");
const cardsContainerAll = document.querySelector("#all-cards");
const cardsAll = cardsContainerAll.querySelectorAll(".card");

// Set a variable to track the current number of visible cards for the "All" category
let visibleCardCountAll = 9;

// Function to toggle card visibility
function toggleCardVisibility() {
    cardsAll.forEach((card, index) => {
        if (index < visibleCardCountAll) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });

    // Toggle the "View More" button visibility
    if (visibleCardCountAll < cardsAll.length) {
        viewMoreButtonAll.style.display = "block";
    } else {
        viewMoreButtonAll.style.display = "none";
    }
}

// Initial card visibility
toggleCardVisibility();

viewMoreButtonAll.addEventListener("click", () => {
    visibleCardCountAll += 9;
    toggleCardVisibility();
});

// Initial filter selection
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        // Your filter code here

        // Reset the visible card count and toggle card visibility
        visibleCardCountAll = 9;
        toggleCardVisibility();
    });
});



// Your existing JavaScript code here

// JavaScript for shuffling and arranging cards
const allCardsContainer = document.querySelector("#all-cards");
const allCardsArray = Array.from(allCardsContainer.querySelectorAll(".card"));

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateAllCards() {
    // Shuffle all the cards
    shuffleArray(allCardsArray);

    // Clear the container and append the shuffled cards
    allCardsContainer.innerHTML = "";
    allCardsArray.forEach(card => {
        allCardsContainer.appendChild(card);
    });
}

// Function to initialize card arrangement
function initializeCardArrangement() {
    updateAllCards();
    toggleCardVisibility();
}

// Call the function to initialize card arrangement when the page loads
window.addEventListener('load', initializeCardArrangement);
