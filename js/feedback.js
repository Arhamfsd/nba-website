document.addEventListener("DOMContentLoaded", function() {
    const feedbackForm = document.getElementById('feedbackForm');
    const alertMessage = document.getElementById('alertMessage');

    feedbackForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const feedbackData = {
            name: document.getElementById('feedbackName').value,
            email: document.getElementById('feedbackEmail').value,
            message: document.getElementById('feedbackText').value
        };

        // Log the data being sent
        console.log('Sending feedback data:', feedbackData);

        try {
            const response = await fetch('http://localhost:3000/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedbackData)
            });

            const data = await response.json();

            if (response.ok) {
                alertMessage.className = 'alert alert-success';
                alertMessage.textContent = 'Feedback submitted successfully!';
                alertMessage.style.display = 'block';
                feedbackForm.reset();
            } else {
                alertMessage.className = 'alert alert-danger';
                alertMessage.textContent = data.message || 'An error occurred. Please try again.';
                alertMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alertMessage.className = 'alert alert-danger';
            alertMessage.textContent = 'An error occurred. Please try again.';
            alertMessage.style.display = 'block';
        }

        // Hide message after 5 seconds
        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 5000);
    });
});