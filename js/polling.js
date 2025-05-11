// Function to format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to calculate percentage
function calculatePercentage(votes, totalVotes) {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
}

// Function to create a completed poll card
function createCompletedPollCard(poll) {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    
    return `
        <div class="card mb-4 poll-card results p-3">
            <span class="star">★</span>
            <div class="d-flex mb-3">
                <img src="${poll.image}" class="img-fluid me-3" style="width:200px; height:auto;" alt="Poll Image"/>
                <div class="flex-fill">
                    <h5>${poll.question}</h5>
                    ${poll.options.map(option => {
                        const percentage = calculatePercentage(option.votes, totalVotes);
                        return `
                            <div class="mb-2">
                                <div class="option-bar">
                                    <div class="fill" style="width:${percentage}%"></div>
                                </div>
                                <small class="text-end d-block">${option.text} — ${percentage}%</small>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// Function to create an active poll card
function createActivePollCard(poll) {
    return `
        <div class="card mb-4 poll-card p-3">
            <div class="d-flex mb-3">
                <img src="${poll.image}" class="img-fluid me-3" style="width:200px; height:auto;" alt="Poll Image"/>
                <div class="flex-fill">
                    <h5>${poll.question}</h5>
                    ${poll.options.map((option, index) => `
                        <div class="d-flex align-items-center mb-2">
                            <span class="flex-fill">${option.text}</span>
                            <button class="btn btn-primary btn-sm vote-btn" 
                                    data-poll-id="${poll._id}" 
                                    data-option-index="${index}">
                                Vote
                            </button>
                        </div>
                    `).join('')}
                    <small class="text-muted">Ends: ${formatDate(poll.endTime)}</small>
                </div>
            </div>
        </div>
    `;
}

// Function to load polls
async function loadPolls() {
    try {
        const response = await fetch('http://localhost:3000/polls');
        if (!response.ok) {
            throw new Error('Failed to load polls');
        }

        const data = await response.json();
        const pollsContainer = document.getElementById('polls-container');
        
        // Clear existing polls
        pollsContainer.innerHTML = '';

        // Add completed polls
        if (data.completedPolls.length > 0) {
            pollsContainer.innerHTML += '<h3 class="mb-4">Recent Results</h3>';
            data.completedPolls.forEach(poll => {
                pollsContainer.innerHTML += createCompletedPollCard(poll);
            });
        }

        // Add active polls
        if (data.activePolls.length > 0) {
            pollsContainer.innerHTML += '<h3 class="mb-4 mt-5">Active Polls</h3>';
            data.activePolls.forEach(poll => {
                pollsContainer.innerHTML += createActivePollCard(poll);
            });
        }

        // Add event listeners to vote buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', handleVote);
        });
    } catch (error) {
        console.error('Error loading polls:', error);
        alert('Failed to load polls. Please try again later.');
    }
}

// Function to handle voting
async function handleVote(event) {
    const button = event.target;
    const pollId = button.dataset.pollId;
    const optionIndex = parseInt(button.dataset.optionIndex);

    try {
        const response = await fetch(`http://localhost:3000/polls/${pollId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ optionIndex })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }

        // Disable all vote buttons for this poll
        const pollCard = button.closest('.poll-card');
        pollCard.querySelectorAll('.vote-btn').forEach(btn => {
            btn.disabled = true;
            btn.textContent = 'Voted';
        });

        // Reload polls to show updated results
        loadPolls();
    } catch (error) {
        console.error('Error voting:', error);
        alert(error.message || 'Failed to submit vote. Please try again.');
    }
}

// Load polls when page loads
document.addEventListener('DOMContentLoaded', loadPolls);

// Refresh polls every minute
setInterval(loadPolls, 60000);