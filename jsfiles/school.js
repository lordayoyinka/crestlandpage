document.addEventListener("DOMContentLoaded", function() {
    // Set the default category to "activities"
    showCategoryContent("activities");

    // Add event listener to category links
    const categoryLinks = document.querySelectorAll(".category-navigation a");
    categoryLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const selectedCategory = this.getAttribute("data-category");
            showCategoryContent(selectedCategory);
        });
    });

    // Function to show content for a specific category
    function showCategoryContent(category) {
        const categoryContents = document.querySelectorAll(".category-content");
        categoryContents.forEach(content => {
            if (content.getAttribute("data-category") === category) {
                content.style.display = "block";
            } else {
                content.style.display = "none";
            }
        });
    }
});
