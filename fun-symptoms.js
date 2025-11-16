// Enhanced Interactive Fun Symptoms Drag & Drop Game
document.addEventListener('DOMContentLoaded', () => {
    const symptomCards = document.querySelectorAll('.symptom-card');
    const triggerCards = document.querySelectorAll('.trigger-card');
    const result = document.getElementById('result');
    const resultContainer = document.getElementById('resultContainer');
    const completionModal = document.getElementById('completionModal');
    const scoreValue = document.getElementById('scoreValue');
    const scoreTotal = document.getElementById('scoreTotal');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    let draggedCard = null;
    let score = 0;
    const totalCards = symptomCards.length;
    let matchedCards = new Set();

    // Initialize score display
    scoreTotal.textContent = totalCards;

    // Add drag and drop event listeners
    symptomCards.forEach(card => {
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });

    triggerCards.forEach(card => {
        card.addEventListener('dragover', dragOver);
        card.addEventListener('drop', dropCard);
        card.addEventListener('dragleave', dragLeave);
        card.addEventListener('dragenter', dragEnter);
    });

    function dragStart(e) {
        if (e.target.classList.contains('matched')) return;
        
        draggedCard = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        
        // Hide the card after a short delay
        setTimeout(() => {
            e.target.style.opacity = '0.5';
        }, 0);
    }

    function dragEnd(e) {
        e.target.classList.remove('dragging');
        if (!e.target.classList.contains('matched')) {
            e.target.style.opacity = '1';
        }
    }

    function dragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('trigger-card')) {
            e.target.classList.add('hovered');
        }
    }

    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (e.target.classList.contains('trigger-card')) {
            e.target.classList.add('hovered');
        }
    }

    function dragLeave(e) {
        if (e.target.classList.contains('trigger-card')) {
            e.target.classList.remove('hovered');
        }
    }

    function dropCard(e) {
        e.preventDefault();
        const triggerCard = e.target.closest('.trigger-card');
        if (!triggerCard || !draggedCard) return;

        triggerCard.classList.remove('hovered');

        const isCorrect = draggedCard.dataset.target === triggerCard.dataset.trigger;
        const cardId = draggedCard.dataset.id;

        if (isCorrect && !matchedCards.has(cardId)) {
            // Correct match
            handleCorrectMatch(draggedCard, triggerCard, cardId);
        } else if (matchedCards.has(cardId)) {
            // Already matched
            showResult('This symptom is already matched!', 'error');
            draggedCard.style.opacity = '1';
        } else {
            // Wrong match
            handleWrongMatch(draggedCard, triggerCard);
        }

        draggedCard = null;
    }

    function handleCorrectMatch(symptomCard, triggerCard, cardId) {
        // Mark as matched
        matchedCards.add(cardId);
        score++;
        
        // Update UI
        symptomCard.classList.add('matched');
        symptomCard.style.opacity = '0.3';
        symptomCard.draggable = false;
        
        triggerCard.classList.add('matched');
        triggerCard.classList.remove('hovered');
        
        // Hide hint and indicator
        const hint = triggerCard.querySelector('.trigger-hint');
        const indicator = triggerCard.querySelector('.drop-indicator');
        if (hint) hint.style.display = 'none';
        if (indicator) indicator.style.display = 'none';
        
        // Add matched symptom display
        const matchedSymptom = document.createElement('div');
        matchedSymptom.className = 'matched-symptom';
        matchedSymptom.innerHTML = `<i class="fas fa-check-circle"></i> ${symptomCard.querySelector('h4').textContent}`;
        triggerCard.appendChild(matchedSymptom);
        
        // Update score and progress
        updateScore();
        updateProgress();
        
        // Show success message
        showResult(`✅ Correct! "${symptomCard.querySelector('h4').textContent}" matches "${triggerCard.querySelector('h4').textContent}"`, 'success');
        
        // Check if game is complete
        if (score === totalCards) {
            setTimeout(() => {
                showCompletionModal();
            }, 1000);
        }
    }

    function handleWrongMatch(symptomCard, triggerCard) {
        // Shake animation
        triggerCard.classList.add('shake');
        setTimeout(() => {
            triggerCard.classList.remove('shake');
        }, 500);
        
        // Show error message
        showResult(`❌ Try again! "${symptomCard.querySelector('h4').textContent}" doesn't match "${triggerCard.querySelector('h4').textContent}"`, 'error');
        
        // Reset card visibility
        symptomCard.style.opacity = '1';
    }

    function showResult(message, type) {
        result.textContent = message;
        result.className = `result show ${type}`;
        resultContainer.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            result.classList.remove('show');
            setTimeout(() => {
                resultContainer.style.display = 'none';
            }, 500);
        }, 3000);
    }

    function updateScore() {
        scoreValue.textContent = score;
        scoreValue.style.animation = 'pulse 0.5s ease';
    }

    function updateProgress() {
        const percentage = (score / totalCards) * 100;
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${score} of ${totalCards} matched`;
    }

    function showCompletionModal() {
        document.getElementById('finalScore').textContent = `${score}/${totalCards}`;
        completionModal.classList.add('show');
    }

    // Reset game function (called from modal)
    window.resetGame = function() {
        // Reset variables
        score = 0;
        matchedCards.clear();
        draggedCard = null;
        
        // Reset UI
        scoreValue.textContent = '0';
        progressFill.style.width = '0%';
        progressText.textContent = '0 of 5 matched';
        
        // Reset symptom cards
        symptomCards.forEach(card => {
            card.classList.remove('matched');
            card.style.opacity = '1';
            card.draggable = true;
            card.style.display = 'block';
        });
        
        // Reset trigger cards
        triggerCards.forEach(card => {
            card.classList.remove('matched', 'hovered');
            const hint = card.querySelector('.trigger-hint');
            const indicator = card.querySelector('.drop-indicator');
            const matchedSymptom = card.querySelector('.matched-symptom');
            
            if (hint) hint.style.display = 'block';
            if (indicator) indicator.style.display = 'block';
            if (matchedSymptom) matchedSymptom.remove();
        });
        
        // Hide modal and result
        completionModal.classList.remove('show');
        result.classList.remove('show');
        resultContainer.style.display = 'none';
        
        // Re-attach event listeners
        symptomCards.forEach(card => {
            card.addEventListener('dragstart', dragStart);
            card.addEventListener('dragend', dragEnd);
        });
    };

    // Close modal on outside click
    completionModal.addEventListener('click', (e) => {
        if (e.target === completionModal) {
            completionModal.classList.remove('show');
        }
    });

    // Add pulse animation for score
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
    `;
    document.head.appendChild(style);

    // Staggered animation for cards on load
    symptomCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    triggerCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        }, (index + symptomCards.length) * 100);
    });
});
