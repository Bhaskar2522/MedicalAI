// Enhanced Lifestyle Factors Assessment System
document.addEventListener('DOMContentLoaded', () => {
    // Get all elements
    const sleepSlider = document.getElementById('sleepQuality');
    const stressSlider = document.getElementById('stressLevel');
    const sleepDuration = document.getElementById('sleepDuration');
    const hydration = document.getElementById('hydration');
    const exerciseType = document.getElementById('exerciseType');
    const exerciseFrequency = document.getElementById('exerciseFrequency');
    const sedentaryHours = document.getElementById('sedentaryHours');
    const foodPattern = document.getElementById('foodPattern');
    const mealFrequency = document.querySelectorAll('input[name="mealFrequency"]');
    const travel = document.querySelectorAll('input[name="travel"]');
    
    const relaxationButtons = document.querySelectorAll('#relaxationButtons .toggle-btn');
    const habitsButtons = document.querySelectorAll('#habitsButtons .toggle-btn');
    const allergenButtons = document.querySelectorAll('#allergenButtons .toggle-btn');
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultDisplay = document.getElementById('resultDisplay');
    const closeResult = document.getElementById('closeResult');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    // Labels
    const sleepLabels = ["Poor", "Moderate", "Good", "Excellent"];
    const stressLabels = ["Low", "Medium", "High"];
    
    // Update progress
    function updateProgress() {
        const totalFields = 15;
        let filledFields = 0;
        
        // Check sliders (default values count as filled)
        filledFields += 2;
        
        // Check selects (default values count as filled)
        filledFields += 6;
        
        // Check radio buttons
        filledFields += 2;
        
        // Check toggle buttons
        const activeToggles = document.querySelectorAll('.toggle-btn.active').length;
        filledFields += Math.min(activeToggles, 3); // Max 3 for progress
        
        const percentage = Math.min((filledFields / totalFields) * 100, 100);
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${Math.round(percentage)}% Complete`;
    }
    
    // Slider updates
    const sleepQualityValue = document.getElementById('sleepQualityValue');
    sleepSlider.addEventListener('input', () => {
        sleepQualityValue.textContent = sleepLabels[sleepSlider.value];
        updateProgress();
    });
    
    const stressLevelValue = document.getElementById('stressLevelValue');
    stressSlider.addEventListener('input', () => {
        stressLevelValue.textContent = stressLabels[stressSlider.value];
        updateProgress();
    });
    
    // Select updates
    [sleepDuration, hydration, exerciseType, exerciseFrequency, sedentaryHours, foodPattern].forEach(select => {
        select.addEventListener('change', updateProgress);
    });
    
    // Radio button updates
    mealFrequency.forEach(radio => {
        radio.addEventListener('change', updateProgress);
    });
    
    travel.forEach(radio => {
        radio.addEventListener('change', updateProgress);
    });
    
    // Toggle button handlers
    function setupToggleButtons(buttons) {
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                updateProgress();
            });
        });
    }
    
    setupToggleButtons(relaxationButtons);
    setupToggleButtons(habitsButtons);
    setupToggleButtons(allergenButtons);
    
    // Collect all data
    function collectData() {
        const relaxation = Array.from(relaxationButtons)
            .filter(btn => btn.classList.contains('active'))
            .map(btn => btn.textContent.trim());
        
        const habits = Array.from(habitsButtons)
            .filter(btn => btn.classList.contains('active'))
            .map(btn => btn.textContent.trim());
        
        const allergens = Array.from(allergenButtons)
            .filter(btn => btn.classList.contains('active'))
            .map(btn => btn.textContent.trim());
        
        const selectedMealFrequency = Array.from(mealFrequency).find(r => r.checked)?.value;
        const selectedTravel = Array.from(travel).find(r => r.checked)?.value;
        
        return {
            sleep: {
                quality: sleepLabels[sleepSlider.value],
                duration: sleepDuration.value
            },
            stress: {
                level: stressLabels[stressSlider.value],
                relaxation: relaxation
            },
            diet: {
                pattern: foodPattern.options[foodPattern.selectedIndex].text,
                hydration: hydration.options[hydration.selectedIndex].text,
                mealFrequency: selectedMealFrequency
            },
            activity: {
                type: exerciseType.options[exerciseType.selectedIndex].text,
                frequency: exerciseFrequency.options[exerciseFrequency.selectedIndex].text,
                sedentary: sedentaryHours.options[sedentaryHours.selectedIndex].text
            },
            habits: habits,
            allergens: allergens,
            travel: selectedTravel === 'yes'
        };
    }
    
    // Generate insights
    function generateInsights(data) {
        const insights = [];
        
        // Sleep insights
        if (data.sleep.quality === 'Poor' || data.sleep.duration === '<4h') {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Sleep Quality Concern',
                message: 'Poor sleep can significantly impact your health. Consider establishing a regular sleep schedule, reducing screen time before bed, and creating a relaxing bedtime routine. Aim for 7-9 hours of quality sleep.'
            });
        } else if (data.sleep.quality === 'Excellent' && data.sleep.duration !== '<4h') {
            insights.push({
                type: 'success',
                icon: '✅',
                title: 'Great Sleep Habits',
                message: 'You have excellent sleep quality! Maintain this routine as quality sleep is crucial for overall health and well-being.'
            });
        }
        
        // Stress insights
        if (data.stress.level === 'High') {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                title: 'High Stress Level',
                message: 'High stress can affect your physical and mental health. Consider incorporating more relaxation practices like meditation, yoga, or deep breathing exercises. Regular exercise and adequate sleep also help manage stress.'
            });
        }
        
        if (data.stress.relaxation.length === 0 && data.stress.level !== 'Low') {
            insights.push({
                type: 'warning',
                icon: '💡',
                title: 'Add Relaxation Practices',
                message: 'Consider adding relaxation practices to your routine. Meditation, yoga, or deep breathing can help reduce stress and improve overall well-being.'
            });
        }
        
        // Diet insights
        if (data.diet.pattern.includes('Spicy') || data.diet.pattern.includes('Oily')) {
            insights.push({
                type: 'warning',
                icon: '🍽️',
                title: 'Dietary Balance',
                message: 'While occasional spicy or oily foods are fine, try to maintain a balanced diet with plenty of fruits, vegetables, and whole grains for optimal health.'
            });
        }
        
        if (data.diet.hydration.includes('Low')) {
            insights.push({
                type: 'warning',
                icon: '💧',
                title: 'Hydration Reminder',
                message: 'Adequate hydration is essential. Aim for at least 2-3 liters of water per day, especially if you\'re active or in hot weather.'
            });
        }
        
        // Activity insights
        if (data.activity.type === 'None' || data.activity.frequency === 'None') {
            insights.push({
                type: 'warning',
                icon: '🏃',
                title: 'Physical Activity',
                message: 'Regular physical activity is important for maintaining good health. Start with light activities like walking, and gradually increase intensity. Even 30 minutes a day can make a significant difference.'
            });
        }
        
        if (data.activity.sedentary.includes('>8h')) {
            insights.push({
                type: 'warning',
                icon: '🪑',
                title: 'Reduce Sedentary Time',
                message: 'Extended periods of sitting can impact your health. Try to take breaks every hour, use a standing desk if possible, and incorporate more movement into your daily routine.'
            });
        }
        
        // Habits insights
        if (data.habits.some(h => h.includes('Smoking'))) {
            insights.push({
                type: 'warning',
                icon: '🚭',
                title: 'Smoking Health Impact',
                message: 'Smoking significantly impacts your health. Consider seeking support to quit smoking. There are many resources available to help you on this journey.'
            });
        }
        
        if (data.habits.some(h => h.includes('Excessive Screen Time'))) {
            insights.push({
                type: 'warning',
                icon: '📱',
                title: 'Screen Time Management',
                message: 'Excessive screen time can affect sleep and eye health. Try to take regular breaks, use blue light filters, and avoid screens at least an hour before bedtime.'
            });
        }
        
        // Positive insights
        if (data.diet.pattern.includes('Balanced') && data.activity.type !== 'None') {
            insights.push({
                type: 'success',
                icon: '🌟',
                title: 'Healthy Lifestyle',
                message: 'You\'re maintaining a balanced diet and staying active! Keep up the great work. These habits contribute significantly to your overall health and well-being.'
            });
        }
        
        return insights;
    }
    
    // Display results
    function displayResults(data, insights) {
        const summaryCards = document.getElementById('summaryCards');
        const insightsList = document.getElementById('insightsList');
        const selectedFactors = document.getElementById('selectedFactors');
        
        // Summary cards
        summaryCards.innerHTML = `
            <div class="summary-card">
                <h5>Sleep Quality</h5>
                <div class="value">${data.sleep.quality}</div>
            </div>
            <div class="summary-card">
                <h5>Stress Level</h5>
                <div class="value">${data.stress.level}</div>
            </div>
            <div class="summary-card">
                <h5>Exercise</h5>
                <div class="value">${data.activity.frequency}</div>
            </div>
            <div class="summary-card">
                <h5>Hydration</h5>
                <div class="value">${data.diet.hydration.split(' ')[0]}</div>
            </div>
        `;
        
        // Insights
        insightsList.innerHTML = '';
        if (insights.length === 0) {
            insightsList.innerHTML = `
                <div class="insight-item success">
                    <div class="insight-icon">✅</div>
                    <div class="insight-content">
                        <h5>Great Lifestyle Balance</h5>
                        <p>Your lifestyle factors look well-balanced! Continue maintaining these healthy habits.</p>
                    </div>
                </div>
            `;
        } else {
            insights.forEach(insight => {
                const item = document.createElement('div');
                item.className = `insight-item ${insight.type}`;
                item.innerHTML = `
                    <div class="insight-icon">${insight.icon}</div>
                    <div class="insight-content">
                        <h5>${insight.title}</h5>
                        <p>${insight.message}</p>
                    </div>
                `;
                insightsList.appendChild(item);
            });
        }
        
        // Selected factors
        let factorsHtml = '<h4>Selected Factors</h4>';
        factorsHtml += `<span class="factor-tag">Sleep: ${data.sleep.quality}</span>`;
        factorsHtml += `<span class="factor-tag">Stress: ${data.stress.level}</span>`;
        factorsHtml += `<span class="factor-tag">Diet: ${data.diet.pattern}</span>`;
        factorsHtml += `<span class="factor-tag">Exercise: ${data.activity.type}</span>`;
        
        if (data.stress.relaxation.length > 0) {
            data.stress.relaxation.forEach(r => {
                factorsHtml += `<span class="factor-tag">${r}</span>`;
            });
        }
        
        if (data.habits.length > 0) {
            data.habits.forEach(h => {
                factorsHtml += `<span class="factor-tag">${h}</span>`;
            });
        }
        
        if (data.allergens.length > 0) {
            data.allergens.forEach(a => {
                factorsHtml += `<span class="factor-tag">${a}</span>`;
            });
        }
        
        selectedFactors.innerHTML = factorsHtml;
        
        // Show results
        resultDisplay.style.display = 'block';
        resultDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Analyze button
    analyzeBtn.addEventListener('click', () => {
        const data = collectData();
        const insights = generateInsights(data);
        displayResults(data, insights);
    });
    
    // Close result
    closeResult.addEventListener('click', () => {
        resultDisplay.style.display = 'none';
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all fields? All entered data will be lost.')) {
            // Reset sliders
            sleepSlider.value = 0;
            stressSlider.value = 0;
            sleepQualityValue.textContent = 'Poor';
            stressLevelValue.textContent = 'Low';
            
            // Reset selects
            sleepDuration.selectedIndex = 2;
            hydration.selectedIndex = 1;
            exerciseType.selectedIndex = 0;
            exerciseFrequency.selectedIndex = 2;
            sedentaryHours.selectedIndex = 1;
            foodPattern.selectedIndex = 3;
            
            // Reset radio buttons
            mealFrequency[0].checked = true;
            travel[1].checked = true;
            
            // Reset toggle buttons
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Hide results
            resultDisplay.style.display = 'none';
            
            // Update progress
            updateProgress();
        }
    });
    
    // Save button
    saveBtn.addEventListener('click', () => {
        const data = collectData();
        const assessment = {
            ...data,
            timestamp: new Date().toISOString(),
            type: 'lifestyle-assessment'
        };
        
        // Save to localStorage
        let assessments = JSON.parse(localStorage.getItem('lifestyleAssessments')) || [];
        assessments.push(assessment);
        localStorage.setItem('lifestyleAssessments', JSON.stringify(assessments));
        
        // Show success message
        alert('✅ Lifestyle assessment saved successfully! You can view it later or share it with your healthcare provider.');
        
        // Log to console
        console.log('✅ Assessment saved:', assessment);
        console.log('📋 Total assessments:', assessments.length);
    });
    
    // Initial progress update
    updateProgress();
});
