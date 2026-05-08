// This function runs as soon as the script loads
(function() {
    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    
    // Logic to format the year string
    const yearDisplay = currentYear > startYear 
        ? `${startYear}-${currentYear}` 
        : startYear;

    // Find the element and update it
    const copyrightElement = document.getElementById("copyright-year");
    if (copyrightElement) {
        copyrightElement.textContent = yearDisplay;
    }
})();