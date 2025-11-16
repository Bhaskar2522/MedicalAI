document.addEventListener('DOMContentLoaded', () => {
    // Get the modal, the button that opens it, and the <span> element that closes it
    const modal = document.getElementById('allReviewsModal');
    
    // Assuming the "Read All Reviews" button has a specific class or ID on your main page
    const openModalBtn = document.querySelector('.view-all-reviews-btn'); 
    
    const closeBtn = document.querySelector('.close-btn');

    // 1. When the user clicks the button, open the modal 
    openModalBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop link from navigating
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling the main page
    });

    // 2. When the user clicks on <span> (x), close the modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    });

    // 3. When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // --- Placeholder Filtering Logic (Requires actual data to work fully) ---
    const ratingFilter = document.getElementById('ratingFilter');
    ratingFilter.addEventListener('change', () => {
        const selectedRating = ratingFilter.value;
        console.log(`Filtering reviews for rating: ${selectedRating}`);
        // Here you would implement logic to hide/show reviews based on selectedRating
    });

    const sortBy = document.getElementById('sortBy');
    sortBy.addEventListener('change', () => {
        const selectedSort = sortBy.value;
        console.log(`Sorting reviews by: ${selectedSort}`);
        // Here you would implement logic to reorder the reviews
    });
});