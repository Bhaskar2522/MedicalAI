// DOM Elements
const severitySlider = document.getElementById('severity');
const durationSlider = document.getElementById('duration');
const frequencySelect = document.getElementById('frequency');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const painItems = document.querySelectorAll('.pain-item');
const notesTextarea = document.getElementById('notes');

// Display Elements
const severityValue = document.getElementById('severityValue');
const durationValue = document.getElementById('durationValue');
const frequencyValue = document.getElementById('frequencyValue');
const triggersValue = document.getElementById('triggersValue');
const painValue = document.getElementById('painValue');
const severityDisplay = document.getElementById('severityDisplay');
const durationDisplay = document.getElementById('durationDisplay');
const selectedPain = document.getElementById('selectedPain');
const recommendationsCard = document.getElementById('recommendationsCard');
const recommendationsContent = document.getElementById('recommendationsContent');

// Labels
const severityLabels = ["Mild", "Moderate", "Severe", "Fluctuating", "Progressive"];
const durationLabels = [
    "Acute (0-3 days)",
    "Subacute (4-14 days)",
    "Chronic (15+ days)",
    "Recurrent",
    "Persistent"
];

// State
let selectedPainLevel = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAllDisplays();
    setupPainScale();
});

// ====== SEVERITY SLIDER ======
severitySlider.addEventListener('input', () => {
    updateSeverityDisplay();
    updateAllDisplays();
});

function updateSeverityDisplay() {
    const value = parseInt(severitySlider.value);
    severityDisplay.textContent = severityLabels[value];
    severityValue.textContent = severityLabels[value];
}

// ====== DURATION SLIDER ======
durationSlider.addEventListener('input', () => {
    updateDurationDisplay();
    updateAllDisplays();
});

function updateDurationDisplay() {
    const value = parseInt(durationSlider.value);
    durationDisplay.textContent = durationLabels[value];
    durationValue.textContent = durationLabels[value];
}

// ====== FREQUENCY SELECTOR ======
frequencySelect.addEventListener('change', () => {
    updateAllDisplays();
});

// ====== PAIN SCALE ======
function setupPainScale() {
    painItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove previous selection
            painItems.forEach(i => i.classList.remove('selected'));
            
            // Add selection to clicked item
            item.classList.add('selected');
            selectedPainLevel = parseInt(item.dataset.value);
            
            // Update display
            const painLabels = {
                0: "No Pain",
                2: "Mild Pain",
                4: "Moderate Pain",
                6: "Severe Pain",
                8: "Very Severe Pain",
                10: "Unbearable Pain"
            };
            
            painValue.textContent = `${selectedPainLevel}/10 - ${painLabels[selectedPainLevel]}`;
            selectedPain.textContent = `Selected: ${selectedPainLevel}/10 - ${painLabels[selectedPainLevel]}`;
            selectedPain.style.background = getPainColor(selectedPainLevel);
        });
    });
}

function getPainColor(level) {
    if (level <= 2) return '#c8e6c9';
    if (level <= 4) return '#fff9c4';
    if (level <= 6) return '#ffcc80';
    if (level <= 8) return '#ffab91';
    return '#ef5350';
}

// ====== TOGGLE BUTTONS ======
toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        updateTriggers();
        updateAllDisplays();
    });
});

function updateTriggers() {
    const activeTriggers = Array.from(toggleButtons)
        .filter(btn => btn.classList.contains('active'))
        .map(btn => btn.textContent.trim());
    
    triggersValue.textContent = activeTriggers.length > 0 
        ? activeTriggers.join(', ') 
        : 'None';
}

// ====== UPDATE ALL DISPLAYS ======
function updateAllDisplays() {
    updateSeverityDisplay();
    updateDurationDisplay();
    frequencyValue.textContent = frequencySelect.options[frequencySelect.selectedIndex].text;
    updateTriggers();
}

// ====== GET RECOMMENDATIONS ======
function getRecommendations() {
    const severity = parseInt(severitySlider.value);
    const duration = parseInt(durationSlider.value);
    const frequency = frequencySelect.value;
    const triggers = Array.from(toggleButtons)
        .filter(btn => btn.classList.contains('active'))
        .map(btn => btn.dataset.trigger);
    const pain = selectedPainLevel;
    const notes = notesTextarea.value.trim();

    let recommendations = [];

    // Severity-based recommendations
    if (severity >= 3 || pain >= 8) {
        recommendations.push({
            type: 'urgent',
            title: '⚠️ Seek Immediate Medical Attention',
            content: 'Your symptoms are severe. Please consult a healthcare professional immediately or visit an emergency room if needed.'
        });
    }

    // Duration-based recommendations
    if (duration >= 2) {
        recommendations.push({
            type: 'info',
            title: '📅 Chronic Symptoms',
            content: 'Since your symptoms have been present for an extended period, it\'s important to consult with a healthcare provider for proper diagnosis and treatment plan.'
        });
    }

    // Pain level recommendations
    if (pain !== null) {
        if (pain >= 6) {
            recommendations.push({
                type: 'medicine',
                title: '💊 Pain Management',
                content: 'For severe pain, consider: Ibuprofen 400mg or Paracetamol 500mg. However, consult a doctor if pain persists or worsens.'
            });
        } else if (pain >= 4) {
            recommendations.push({
                type: 'medicine',
                title: '💊 Pain Relief',
                content: 'For moderate pain, you may try: Paracetamol 500mg or apply a topical pain relief gel. Rest and apply cold/heat as appropriate.'
            });
        }
    }

    // Frequency recommendations
    if (frequency === 'constant' || frequency === 'multiple-daily') {
        recommendations.push({
            type: 'info',
            title: '🔄 Frequent Symptoms',
            content: 'Frequent symptoms may indicate an underlying condition. Keep a symptom diary and consult a healthcare professional.'
        });
    }

    // Trigger-based recommendations
    if (triggers.includes('stress')) {
        recommendations.push({
            type: 'lifestyle',
            title: '🧘 Stress Management',
            content: 'Consider stress-reduction techniques: meditation, deep breathing, regular exercise, and adequate sleep. Ashwagandha supplements may also help.'
        });
    }

    if (triggers.includes('diet')) {
        recommendations.push({
            type: 'lifestyle',
            title: '🍽️ Dietary Considerations',
            content: 'Keep a food diary to identify triggers. Consider antacids for digestive issues. Avoid spicy, oily, or trigger foods.'
        });
    }

    // General recommendations
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'info',
            title: '💡 General Advice',
            content: 'Monitor your symptoms. If they persist or worsen, consult a healthcare professional. Maintain a healthy lifestyle with proper diet, exercise, and sleep.'
        });
    }

    // Display recommendations
    displayRecommendations(recommendations);
    
    // Scroll to recommendations
    recommendationsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayRecommendations(recommendations) {
    recommendationsCard.style.display = 'block';
    recommendationsContent.innerHTML = '';

    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        
        const iconMap = {
            'urgent': '⚠️',
            'medicine': '💊',
            'lifestyle': '🧘',
            'info': '💡'
        };

        item.innerHTML = `
            <h4>${iconMap[rec.type] || '💡'} ${rec.title}</h4>
            <p>${rec.content}</p>
        `;
        
        recommendationsContent.appendChild(item);
    });
}

// ====== SAVE ASSESSMENT ======
function saveAssessment() {
    const assessment = {
        severity: severityLabels[parseInt(severitySlider.value)],
        duration: durationLabels[parseInt(durationSlider.value)],
        painLevel: selectedPainLevel !== null ? `${selectedPainLevel}/10` : 'Not specified',
        frequency: frequencySelect.options[frequencySelect.selectedIndex].text,
        triggers: Array.from(toggleButtons)
            .filter(btn => btn.classList.contains('active'))
            .map(btn => btn.textContent.trim()),
        notes: notesTextarea.value.trim(),
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    let savedAssessments = JSON.parse(localStorage.getItem('symptomAssessments')) || [];
    savedAssessments.push(assessment);
    localStorage.setItem('symptomAssessments', JSON.stringify(savedAssessments));

    // Show success message
    alert('✅ Assessment saved successfully! You can view it later or share it with your healthcare provider.');
}

// ====== RESET FORM ======
function resetForm() {
    severitySlider.value = 0;
    durationSlider.value = 0;
    frequencySelect.value = 'once';
    notesTextarea.value = '';
    selectedPainLevel = null;
    
    // Reset pain scale
    painItems.forEach(item => item.classList.remove('selected'));
    
    // Reset toggle buttons
    toggleButtons.forEach(btn => btn.classList.remove('active'));
    
    // Hide recommendations
    recommendationsCard.style.display = 'none';
    
    // Update all displays
    updateAllDisplays();
    painValue.textContent = 'Not specified';
    selectedPain.textContent = 'Selected: None';
    selectedPain.style.background = '#e0f2f1';
    
    alert('🔄 Form reset successfully!');
}

// Auto-update on any change
severitySlider.addEventListener('input', updateAllDisplays);
durationSlider.addEventListener('input', updateAllDisplays);
frequencySelect.addEventListener('change', updateAllDisplays);
