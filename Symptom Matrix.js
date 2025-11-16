// Enhanced Symptom Matrix Interactive System
document.addEventListener('DOMContentLoaded', () => {
    const symptomOptions = document.querySelectorAll('.symptom-option');
    const checkBtn = document.getElementById('checkBtn');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');
    const matrixResult = document.getElementById('matrixResult');
    const resultContainer = document.getElementById('resultContainer');
    const completionModal = document.getElementById('completionModal');
    const scoreValue = document.getElementById('scoreValue');
    const scoreTotal = document.getElementById('scoreTotal');

    // Define correct mapping for each body part
    const correctMapping = {
        head: ["headache", "dizziness", "blurred", "migraine", "light"],
        chest: ["palpitations", "tightness", "breath", "cough"],
        stomach: ["nausea", "bloating", "cramps", "acid"],
        skin: ["rashes", "itching", "bruising", "hives"]
    };

    let totalSymptoms = 0;
    let checked = false;

    // Calculate total symptoms
    Object.values(correctMapping).forEach(symptoms => {
        totalSymptoms += symptoms.length;
    });
    scoreTotal.textContent = totalSymptoms;

    // Toggle selection
    symptomOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            if (checked) return; // Prevent changes after checking
            
            opt.classList.toggle('selected');
            updateScore();
        });
    });

    // Update score display
    function updateScore() {
        const selectedCount = document.querySelectorAll('.symptom-option.selected').length;
        scoreValue.textContent = selectedCount;
    }

    // Check answers
    checkBtn.addEventListener('click', () => {
        if (checked) {
            resetGame();
            return;
        }

        let total = 0;
        let correctCount = 0;
        const bodyPartStats = {};

        document.querySelectorAll('.matrix-row').forEach(row => {
            const body = row.dataset.body;
            const selected = row.querySelectorAll('.symptom-option.selected');
            let bodyCorrect = 0;
            let bodyTotal = selected.length;

            selected.forEach(opt => {
                total++;
                const symptom = opt.dataset.symptom;
                
                if (correctMapping[body].includes(symptom)) {
                    opt.classList.add('correct');
                    opt.classList.remove('selected', 'wrong');
                    correctCount++;
                    bodyCorrect++;
                } else {
                    opt.classList.add('wrong');
                    opt.classList.remove('selected', 'correct');
                }
                
                // Disable further clicking
                opt.style.cursor = 'default';
                opt.style.pointerEvents = 'none';
            });

            bodyPartStats[body] = {
                correct: bodyCorrect,
                total: bodyTotal,
                totalPossible: correctMapping[body].length
            };
        });

        checked = true;
        checkBtn.innerHTML = '<i class="fas fa-redo"></i> Try Again';
        
        // Display results
        displayResults(correctCount, total, bodyPartStats);
        
        // Show completion modal if perfect score
        if (correctCount === total && total > 0) {
            setTimeout(() => {
                showCompletionModal(correctCount, total);
            }, 1000);
        }
    });

    // Display results
    function displayResults(correct, total, bodyStats) {
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        let resultIcon = '🎉';
        let resultTitle = 'Great Job!';
        let resultMessage = '';
        
        if (percentage === 100) {
            resultIcon = '🏆';
            resultTitle = 'Perfect Score!';
            resultMessage = 'You correctly identified all symptoms! Excellent health awareness!';
        } else if (percentage >= 75) {
            resultIcon = '👍';
            resultTitle = 'Well Done!';
            resultMessage = `You got ${correct} out of ${total} correct! You have good health awareness.`;
        } else if (percentage >= 50) {
            resultIcon = '📚';
            resultTitle = 'Good Effort!';
            resultMessage = `You got ${correct} out of ${total} correct. Keep learning about health symptoms!`;
        } else {
            resultIcon = '💡';
            resultTitle = 'Keep Learning!';
            resultMessage = `You got ${correct} out of ${total} correct. This is a learning tool - all symptoms are correct for their body parts!`;
        }

        document.getElementById('resultIcon').textContent = resultIcon;
        document.getElementById('resultTitle').textContent = resultTitle;
        document.getElementById('resultMessage').textContent = resultMessage;

        // Display stats
        const statsHtml = `
            <div class="stat-card">
                <h5>Total Selected</h5>
                <div class="value">${total}</div>
            </div>
            <div class="stat-card">
                <h5>Correct</h5>
                <div class="value" style="color: #4caf50;">${correct}</div>
            </div>
            <div class="stat-card">
                <h5>Accuracy</h5>
                <div class="value">${percentage}%</div>
            </div>
        `;
        document.getElementById('resultStats').innerHTML = statsHtml;

        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Show completion modal
    function showCompletionModal(correct, total) {
        const percentage = Math.round((correct / total) * 100);
        document.getElementById('modalIcon').textContent = '🏆';
        document.getElementById('modalTitle').textContent = 'Perfect Score!';
        document.getElementById('modalMessage').textContent = 
            'Congratulations! You correctly identified all symptoms. You have excellent health awareness!';
        document.getElementById('modalScore').innerHTML = `
            <strong>Final Score: ${correct}/${total} (${percentage}%)</strong>
        `;
        completionModal.classList.add('show');
    }

    // Close modal
    window.closeModal = function() {
        completionModal.classList.remove('show');
    };

    // Reset game
    window.resetGame = function() {
        symptomOptions.forEach(opt => {
            opt.classList.remove('selected', 'correct', 'wrong');
            opt.style.cursor = 'pointer';
            opt.style.pointerEvents = 'auto';
        });
        
        checked = false;
        checkBtn.innerHTML = '<i class="fas fa-check-circle"></i> Check Answers';
        resultContainer.style.display = 'none';
        completionModal.classList.remove('show');
        updateScore();
    };

    // Reset button
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset? All selections will be cleared.')) {
            resetGame();
        }
    });

    // Save button
    saveBtn.addEventListener('click', () => {
        const selectedSymptoms = {};
        
        document.querySelectorAll('.matrix-row').forEach(row => {
            const body = row.dataset.body;
            const selected = Array.from(row.querySelectorAll('.symptom-option.selected'))
                .map(opt => opt.dataset.symptom);
            
            if (selected.length > 0) {
                selectedSymptoms[body] = selected;
            }
        });

        if (Object.keys(selectedSymptoms).length === 0) {
            alert('Please select at least one symptom before saving.');
            return;
        }

        const data = {
            selectedSymptoms: selectedSymptoms,
            timestamp: new Date().toISOString(),
            type: 'symptom-matrix'
        };

        // Save to localStorage
        let savedSelections = JSON.parse(localStorage.getItem('symptomMatrixSelections')) || [];
        savedSelections.push(data);
        localStorage.setItem('symptomMatrixSelections', JSON.stringify(savedSelections));

        alert('✅ Symptom selection saved successfully!');
        console.log('✅ Selection saved:', data);
        console.log('📋 Total saved selections:', savedSelections.length);
    });

    // Close modal on outside click
    completionModal.addEventListener('click', (e) => {
        if (e.target === completionModal) {
            closeModal();
        }
    });

    // Staggered animation for rows
    document.querySelectorAll('.matrix-row').forEach((row, index) => {
        row.style.animationDelay = `${index * 0.1}s`;
    });

    // Initial score update
    updateScore();
});
