// Get chat elements - support both naming conventions
let chatBox = document.getElementById('chatBox') || document.getElementById('chatMessages');
let chatInput = document.getElementById('chatInput') || document.getElementById('messageInput');
let conversationHistory = [];
let apiKey = localStorage.getItem('openai_api_key') || '';

// Initialize elements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chatBox = document.getElementById('chatBox') || document.getElementById('chatMessages');
        chatInput = document.getElementById('chatInput') || document.getElementById('messageInput');
    });
} else {
    chatBox = document.getElementById('chatBox') || document.getElementById('chatMessages');
    chatInput = document.getElementById('chatInput') || document.getElementById('messageInput');
}

// --- DIAGNOSTIC STATE VARIABLES ---
let isDiagnosing = false;
let currentSymptom = null;
let currentQuestionIndex = 0;
let userAnswers = [];

// --- SYMPTOM DATABASE & QUESTIONS ---
const symptomProtocols = {
    "headache": {
        questions: [
            "How long have you had this headache? (Hours, days, or recurring?)",
            "Where is the pain located? (Forehead, temples, one side, back of head, or all over?)",
            "On a scale of 1-10, how severe is the pain?",
            "How would you describe the pain? (Throbbing, dull, sharp, pressure, or stabbing?)",
            "Do you have sensitivity to light, sound, or smells?",
            "Have you experienced nausea, vomiting, or dizziness with this headache?",
            "Does the pain worsen with physical activity or movement?",
            "Have you taken any medication for it yet? If yes, what and did it help?",
            "Did you drink enough water today or skip any meals?",
            "Have you been under stress or had poor sleep recently?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Headache Analysis:</strong><br><br>";
            const location = answers[1].toLowerCase();
            const sensitivity = answers[4].toLowerCase();
            const severity = parseInt(answers[2]) || 5;
            const activity = answers[6].toLowerCase();
            
            if (location.includes("one side") || location.includes("temple") || sensitivity.includes("yes")) {
                advice += "Your symptoms suggest a possible <strong>Migraine</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += formatMedicineWithCart("• Excedrin Migraine (Acetaminophen + Aspirin + Caffeine) - ₹150");
                advice += formatMedicineWithCart("• Ibuprofen 400-600mg (Advil, Motrin) - ₹80");
                advice += formatMedicineWithCart("• Naproxen 220mg (Aleve) - ₹100");
                advice += "• Sumatriptan (if prescribed by doctor)<br><br>";
                advice += "<strong>🏠 Home Remedies:</strong><br>";
                advice += "• Rest in a dark, quiet room<br>";
                advice += "• Apply cold compress to forehead or temples<br>";
                advice += "• Stay hydrated with water<br>";
                advice += "• Avoid triggers (bright lights, strong smells)<br>";
            } else if (location.includes("forehead") || location.includes("eyes") || location.includes("sinus")) {
                advice += "This sounds like a <strong>Sinus or Tension Headache</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += formatMedicineWithCart("• Acetaminophen 500-1000mg (Tylenol, Paracetamol) - ₹50");
                advice += formatMedicineWithCart("• Ibuprofen 400-600mg (Advil) - ₹80");
                advice += "• Decongestant (if sinus-related)<br><br>";
                advice += "<strong>🏠 Home Remedies:</strong><br>";
                advice += "• Steam inhalation for sinus relief<br>";
                advice += "• Gentle neck and shoulder massage<br>";
                advice += "• Warm compress on forehead<br>";
            } else if (activity.includes("yes") || activity.includes("worse")) {
                advice += "This may be an <strong>Exertion or Exercise-Induced Headache</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += "• Ibuprofen or Acetaminophen<br>";
                advice += "• Rest and avoid strenuous activity<br><br>";
            } else {
                advice += "It appears to be a <strong>Tension or General Headache</strong>, likely due to stress, dehydration, or fatigue.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += formatMedicineWithCart("• Paracetamol 500mg (Dolo, Crocin, Tylenol) - ₹50");
                advice += formatMedicineWithCart("• Aspirin 325mg (Disprin) - if no stomach issues - ₹45");
                advice += formatMedicineWithCart("• Ibuprofen 400mg (Advil) - ₹80");
                advice += "<br>";
                advice += "<strong>🏠 Home Remedies:</strong><br>";
                advice += "• Rest in a quiet environment<br>";
                advice += "• Drink plenty of water<br>";
                advice += "• Apply cold or warm compress<br>";
                advice += "• Practice relaxation techniques<br>";
            }
            
            if (severity >= 8) {
                advice += "<br>⚠️ <strong>Severe headache detected.</strong> If this persists or worsens, consult a healthcare provider immediately.";
            }
            
            return advice;
        }
    },
    "fever": {
        questions: [
            "How long have you had the fever? (Hours, days?)",
            "What is your current body temperature? (In Fahrenheit or Celsius)",
            "Do you have body aches, chills, or sweating?",
            "Do you have a cough, sore throat, or runny nose?",
            "Are you experiencing any rashes, redness, or skin changes?",
            "Do you have nausea, vomiting, or loss of appetite?",
            "Have you traveled recently or been exposed to someone who is sick?",
            "Do you have a headache, stiff neck, or sensitivity to light?",
            "Are you taking any medication currently?",
            "Do you have any chronic medical conditions?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Fever Analysis:</strong><br><br>";
            const tempStr = answers[1].replace(/[^0-9.]/g, '');
            let temp = parseFloat(tempStr) || 0;
            
            // Convert Celsius to Fahrenheit if needed (if temp < 50, assume Celsius)
            if (temp < 50 && temp > 35) {
                temp = (temp * 9/5) + 32;
            }

            if (temp >= 103 || temp >= 39.4) {
                advice += "⚠️ <strong>HIGH FEVER ALERT:</strong> Your temperature is quite high (≥103°F/39.4°C). Please consult a doctor immediately, especially if it persists or you have other severe symptoms.<br><br>";
            } else if (temp >= 101 || temp >= 38.3) {
                advice += "You have a <strong>moderate fever</strong> (101-102.9°F / 38.3-39.3°C). Monitor closely and seek medical attention if it persists beyond 3 days.<br><br>";
            } else {
                advice += "You have a <strong>mild fever</strong> (100-100.9°F / 37.8-38.2°C), likely due to a viral infection.<br><br>";
            }

            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            advice += formatMedicineWithCart("• Paracetamol 500-1000mg (Dolo 650, Tylenol, Crocin) - every 4-6 hours, max 4g/day - ₹50");
            advice += formatMedicineWithCart("• Ibuprofen 400-600mg (Advil, Motrin) - every 6-8 hours, if no stomach issues - ₹80");
            advice += formatMedicineWithCart("• Aspirin 325-650mg (Disprin) - adults only, every 4-6 hours - ₹45");
            advice += "<br>";
            
            advice += "<strong>🏠 Home Remedies & Care:</strong><br>";
            advice += "• Sponge bath with lukewarm water (not cold!)<br>";
            advice += "• Stay well hydrated - drink water, electrolyte solutions, or herbal teas<br>";
            advice += "• Get plenty of rest<br>";
            advice += "• Wear light, breathable clothing<br>";
            advice += "• Use a cool, damp cloth on forehead<br>";
            advice += "• Avoid alcohol and caffeine<br><br>";
            
            if (answers[7] && answers[7].toLowerCase().includes("stiff neck")) {
                advice += "⚠️ <strong>URGENT:</strong> Stiff neck with fever can indicate serious conditions. Seek immediate medical attention!<br>";
            }
            
            return advice;
        }
    },
    "stomach pain": {
        questions: [
            "Where exactly is the pain located? (Upper abdomen, lower abdomen, left side, right side, center?)",
            "How would you describe the pain? (Sharp/stabbing, dull/aching, cramping, burning, or pressure?)",
            "On a scale of 1-10, how severe is the pain?",
            "Do you have nausea, vomiting, or diarrhea?",
            "When did you last eat, and what did you eat?",
            "Do you have heartburn, acid reflux, or an acidic/burning sensation?",
            "Do you feel bloated, gassy, or have excessive belching?",
            "Have you had a fever along with the pain?",
            "Is the pain constant or does it come and go?",
            "Does the pain worsen when you move, press on it, or after eating?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Stomach Pain Analysis:</strong><br><br>";
            const loc = answers[0].toLowerCase();
            const type = answers[1].toLowerCase();
            const severity = parseInt(answers[2]) || 5;
            const burn = answers[5].toLowerCase();
            const lowerRight = loc.includes("right") && loc.includes("lower");

            if (burn.includes("yes") || type.includes("burn") || loc.includes("upper")) {
                advice += "This suggests <strong>Acid Reflux, GERD, or Gastritis</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += formatMedicineWithCart("• Antacids (Digene, Eno, Tums) - for immediate relief - ₹30");
                advice += formatMedicineWithCart("• Omeprazole 20mg (Omez, Prilosec) - take on empty stomach, 30 min before breakfast - ₹50");
                advice += formatMedicineWithCart("• Pantoprazole 40mg (Pantocid) - similar to Omeprazole - ₹60");
                advice += formatMedicineWithCart("• Ranitidine 150mg (Zantac) - H2 blocker - ₹40");
                advice += formatMedicineWithCart("• Famotidine 20mg (Pepcid) - ₹45");
                advice += "<br>";
                advice += "<strong>🏠 Home Remedies:</strong><br>";
                advice += "• Avoid spicy, acidic, or fatty foods<br>";
                advice += "• Eat smaller, more frequent meals<br>";
                advice += "• Don't lie down immediately after eating<br>";
                advice += "• Elevate head while sleeping<br>";
                advice += "• Avoid alcohol, caffeine, and smoking<br>";
            } else if (loc.includes("lower") && type.includes("cramp")) {
                advice += "This could be <strong>Intestinal Cramps, Gas, or IBS</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += formatMedicineWithCart("• Dicyclomine (for intestinal cramps) - ₹35");
                advice += formatMedicineWithCart("• Simethicone (for gas and bloating) - ₹30");
                advice += formatMedicineWithCart("• Probiotics (to restore gut flora) - ₹200");
                advice += formatMedicineWithCart("• Peppermint oil capsules (for IBS symptoms) - ₹150");
                advice += "<br>";
                advice += "<strong>🏠 Home Remedies:</strong><br>";
                advice += "• Apply warm compress to abdomen<br>";
                advice += "• Gentle abdominal massage<br>";
                advice += "• Drink peppermint or chamomile tea<br>";
                advice += "• Avoid gas-producing foods (beans, cabbage, carbonated drinks)<br>";
            } else if (lowerRight && severity >= 7) {
                advice += "⚠️ <strong>URGENT: Possible Appendicitis</strong><br>";
                advice += "Severe pain in the lower right abdomen requires immediate medical attention. Go to the emergency room or call emergency services.<br>";
                advice += "Do NOT take pain medication before seeing a doctor, as it can mask symptoms.<br>";
                return advice;
            } else {
                advice += "This appears to be <strong>General Indigestion or Stomach Upset</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += formatMedicineWithCart("• Antacid liquid or tablets (Digene, Eno) - ₹30");
                advice += formatMedicineWithCart("• Activated Charcoal (for gas and bloating) - ₹40");
                advice += formatMedicineWithCart("• Digestive enzymes (if available) - ₹100");
                advice += "<br>";
                advice += "<strong>🏠 Home Remedies:</strong><br>";
                advice += "• Rest and avoid heavy meals<br>";
                advice += "• Drink plenty of water<br>";
                advice += "• Eat bland foods (rice, bananas, toast)<br>";
                advice += "• Avoid spicy, fried, or processed foods<br>";
            }
            
            if (severity >= 8) {
                advice += "<br>⚠️ <strong>Severe pain detected.</strong> If pain is severe, persistent, or worsening, seek medical attention immediately.";
            }
            
            return advice;
        }
    },
    "cold": {
        questions: [
            "How many days have you had these symptoms?",
            "Is your nose runny or blocked?",
            "Do you have a sore throat or difficulty swallowing?",
            "Are you sneezing frequently?",
            "What color is your mucus? (Clear, yellow, green, or thick?)",
            "Do you have a cough? Is it dry or productive (with phlegm)?",
            "Do you have facial pressure, sinus pain, or headache?",
            "Do you have a fever, body aches, or chills?",
            "Are you experiencing fatigue or feeling tired?",
            "Have you been around anyone who is sick recently?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Cold & Flu Analysis:</strong><br><br>";
            const days = parseInt(answers[0]) || 1;
            const mucus = answers[4].toLowerCase();
            const cough = answers[5].toLowerCase();
            const fever = answers[7].toLowerCase();
            
            if (fever.includes("yes") || days > 3) {
                advice += "This appears to be <strong>Influenza (Flu) or a more severe cold</strong>.<br><br>";
            } else {
                advice += "This appears to be a <strong>Common Cold</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            
            if (answers[1] && answers[1].toLowerCase().includes("runny") || answers[3] && answers[3].toLowerCase().includes("yes")) {
                advice += "• Cetirizine 10mg (Okacet, Zyrtec) - for runny nose and sneezing<br>";
                advice += "• Loratadine 10mg (Claritin) - non-drowsy option<br>";
                advice += "• Diphenhydramine (Benadryl) - may cause drowsiness<br>";
            }
            
            if (answers[1] && answers[1].toLowerCase().includes("blocked")) {
                advice += "• Pseudoephedrine (Sudafed) - for nasal congestion<br>";
                advice += "• Phenylephrine - decongestant<br>";
                advice += "• Oxymetazoline nasal spray (Afrin) - use max 3 days<br>";
            }
            
            if (answers[2] && answers[2].toLowerCase().includes("yes")) {
                advice += "• Throat lozenges (Strepsils, Cepacol)<br>";
                advice += "• Chloraseptic spray - for sore throat<br>";
            }
            
            if (cough.includes("dry")) {
                advice += "• Dextromethorphan (Robitussin DM) - for dry cough<br>";
            } else if (cough.includes("wet") || cough.includes("phlegm")) {
                advice += "• Guaifenesin (Mucinex) - expectorant for productive cough<br>";
                advice += "• Bromhexine - to loosen phlegm<br>";
            }
            
            if (fever.includes("yes") || answers[7].includes("ache")) {
                advice += "• Paracetamol 500-1000mg (Tylenol, Dolo) - for fever and body aches<br>";
                advice += "• Ibuprofen 400-600mg (Advil) - for fever and pain<br>";
            }
            
            advice += "<br><strong>🏠 Home Remedies:</strong><br>";
            advice += "• Steam inhalation - boil water, lean over with towel, breathe deeply<br>";
            advice += "• Salt water gargle (1/2 tsp salt in warm water) - 3-4 times daily<br>";
            advice += "• Stay hydrated - drink warm fluids (tea, soup, water)<br>";
            advice += "• Get plenty of rest<br>";
            advice += "• Use a humidifier or vaporizer<br>";
            advice += "• Vitamin C supplements (1000mg daily)<br>";
            advice += "• Zinc lozenges (may shorten cold duration)<br>";
            advice += "• Honey and lemon in warm water<br><br>";
            
            if (mucus.includes("green") || mucus.includes("yellow") && days > 7) {
                advice += "⚠️ <strong>Note:</strong> Green/yellow mucus lasting more than 7 days may indicate a bacterial infection. Consider consulting a doctor.<br>";
            }
            
            return advice;
        }
    },
    "muscle pain": {
        questions: [
            "Where is the muscle pain located? (Neck, back, shoulders, arms, legs, or all over?)",
            "How long have you had this pain? (Hours, days, or weeks?)",
            "On a scale of 1-10, how severe is the pain?",
            "What triggered the pain? (Exercise, injury, overuse, or no specific cause?)",
            "Is the pain constant or does it worsen with movement?",
            "Do you have any swelling, redness, or warmth in the affected area?",
            "Have you been doing any new physical activities or exercises?",
            "Do you have fever, fatigue, or other symptoms along with the pain?",
            "Have you tried any treatments yet? (Ice, heat, rest, medication?)",
            "Does the pain improve with rest or worsen with activity?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Muscle Pain Analysis:</strong><br><br>";
            const location = answers[0].toLowerCase();
            const trigger = answers[3].toLowerCase();
            const severity = parseInt(answers[2]) || 5;
            const swelling = answers[5].toLowerCase();
            const fever = answers[7].toLowerCase();
            
            if (trigger.includes("exercise") || trigger.includes("overuse") || trigger.includes("new")) {
                advice += "This appears to be <strong>Exercise-Induced Muscle Soreness or Strain</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += formatMedicineWithCart("• Ibuprofen 400-600mg (Advil, Motrin) - anti-inflammatory, every 6-8 hours - ₹80");
                advice += formatMedicineWithCart("• Naproxen 220-440mg (Aleve) - longer-lasting relief - ₹100");
                advice += formatMedicineWithCart("• Acetaminophen 500-1000mg (Tylenol) - for pain relief - ₹50");
                advice += formatMedicineWithCart("• Topical pain relief: Diclofenac gel (Voltaren) - ₹95");
                advice += "• Muscle relaxants (if prescribed by doctor)<br><br>";
                advice += "<strong>🏠 Home Remedies (RICE Method):</strong><br>";
                advice += "• <strong>Rest</strong> - avoid activities that worsen pain<br>";
                advice += "• <strong>Ice</strong> - apply cold pack for 15-20 min, 3-4 times daily (first 48 hours)<br>";
                advice += "• <strong>Compression</strong> - use elastic bandage if needed<br>";
                advice += "• <strong>Elevation</strong> - elevate affected area if possible<br>";
                advice += "• After 48 hours, switch to <strong>heat therapy</strong> (warm compress, heating pad)<br>";
                advice += "• Gentle stretching (once acute pain subsides)<br>";
                advice += "• Epsom salt bath<br>";
            } else if (swelling.includes("yes") || fever.includes("yes")) {
                advice += "⚠️ <strong>Possible Infection or Serious Condition</strong><br>";
                advice += "Muscle pain with swelling, redness, warmth, or fever may indicate infection or other serious conditions. Please consult a healthcare provider.<br><br>";
                advice += "<strong>💊 Temporary Relief (while seeking medical care):</strong><br>";
                advice += "• Ibuprofen or Acetaminophen for pain and fever<br>";
                advice += "• Apply cold compress to reduce swelling<br>";
            } else if (location.includes("back")) {
                advice += "This appears to be <strong>Back Muscle Pain or Strain</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += "• Ibuprofen 400-600mg (Advil) - for inflammation and pain<br>";
                advice += "• Naproxen 220-440mg (Aleve)<br>";
                advice += "• Topical: Diclofenac gel, Capsaicin cream, or Menthol rubs<br>";
                advice += "• Muscle relaxants (if prescribed)<br><br>";
                advice += "<strong>🏠 Home Remedies:</strong><br>";
                advice += "• Apply ice for first 48 hours, then heat<br>";
                advice += "• Gentle back stretches and exercises<br>";
                advice += "• Maintain good posture<br>";
                advice += "• Sleep on a firm mattress with proper support<br>";
                advice += "• Avoid heavy lifting<br>";
            } else {
                advice += "This appears to be <strong>General Muscle Pain or Aches</strong>.<br><br>";
                advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
                advice += "• Ibuprofen 400-600mg (Advil, Motrin)<br>";
                advice += "• Acetaminophen 500-1000mg (Tylenol)<br>";
                advice += "• Topical pain relief gels or creams<br>";
                advice += "• Epsom salt for baths<br><br>";
                advice += "<strong>🏠 Home Remedies:</strong><br>";
                advice += "• Rest the affected muscles<br>";
                advice += "• Alternate ice and heat therapy<br>";
                advice += "• Gentle massage<br>";
                advice += "• Stay hydrated<br>";
                advice += "• Gentle stretching when pain improves<br>";
            }
            
            if (severity >= 8) {
                advice += "<br>⚠️ <strong>Severe pain detected.</strong> If pain is severe, persistent, or accompanied by other symptoms, consult a healthcare provider.";
            }
            
            return advice;
        }
    },
    "back pain": {
        questions: [
            "Where exactly is the back pain? (Upper back, lower back, middle back, or all over?)",
            "How long have you had this pain?",
            "On a scale of 1-10, how severe is the pain?",
            "What triggered it? (Lifting, sudden movement, sitting for long, or gradual onset?)",
            "Is the pain constant or does it come and go?",
            "Does the pain radiate to your legs, arms, or other areas?",
            "Do you have numbness, tingling, or weakness in your legs?",
            "Does the pain worsen with movement, sitting, or standing?",
            "Have you tried any treatments? (Rest, heat, ice, medication?)",
            "Do you have any other symptoms? (Fever, weight loss, difficulty controlling bladder/bowel?)"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Back Pain Analysis:</strong><br><br>";
            const location = answers[0].toLowerCase();
            const trigger = answers[3].toLowerCase();
            const severity = parseInt(answers[2]) || 5;
            const radiate = answers[5].toLowerCase();
            const numbness = answers[6].toLowerCase();
            
            if (numbness.includes("yes") || radiate.includes("leg")) {
                advice += "⚠️ <strong>Possible Nerve Involvement</strong><br>";
                advice += "Back pain with leg pain, numbness, or tingling may indicate nerve compression. Consult a healthcare provider, especially if severe.<br><br>";
            }
            
            if (trigger.includes("lifting") || trigger.includes("sudden")) {
                advice += "This appears to be <strong>Acute Back Strain or Sprain</strong>.<br><br>";
            } else if (trigger.includes("sitting") || trigger.includes("gradual")) {
                advice += "This may be <strong>Postural Back Pain or Chronic Strain</strong>.<br><br>";
            } else {
                advice += "This appears to be <strong>Back Muscle Pain</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            advice += "• Ibuprofen 400-600mg (Advil, Motrin) - anti-inflammatory, every 6-8 hours<br>";
            advice += "• Naproxen 220-440mg (Aleve) - longer-lasting<br>";
            advice += "• Acetaminophen 500-1000mg (Tylenol) - for pain<br>";
            advice += "• Topical: Diclofenac gel (Voltaren), Capsaicin cream, or Menthol rubs<br>";
            advice += "• Muscle relaxants (if prescribed by doctor)<br><br>";
            
            advice += "<strong>🏠 Home Remedies & Care:</strong><br>";
            advice += "• <strong>First 48 hours:</strong> Apply ice pack for 15-20 min, 3-4 times daily<br>";
            advice += "• <strong>After 48 hours:</strong> Switch to heat therapy (heating pad, warm bath)<br>";
            advice += "• Gentle stretching exercises (when acute pain subsides)<br>";
            advice += "• Maintain good posture - sit and stand straight<br>";
            advice += "• Sleep on a firm mattress with proper support<br>";
            advice += "• Avoid heavy lifting - use proper lifting technique (bend knees, not back)<br>";
            advice += "• Take breaks from prolonged sitting<br>";
            advice += "• Consider ergonomic chair or lumbar support cushion<br>";
            
            if (severity >= 8) {
                advice += "<br>⚠️ <strong>Severe back pain.</strong> If pain is severe, persistent, or accompanied by other symptoms, seek medical attention.";
            }
            
            return advice;
        }
    },
    "joint pain": {
        questions: [
            "Which joints are affected? (Knees, hips, shoulders, wrists, fingers, or multiple?)",
            "How long have you had this joint pain?",
            "On a scale of 1-10, how severe is the pain?",
            "Is the joint swollen, red, warm, or stiff?",
            "Does the pain worsen with movement or improve with rest?",
            "Do you have morning stiffness that lasts more than 30 minutes?",
            "Have you had any injury to the joint recently?",
            "Do you have fever, rash, or other symptoms?",
            "Does the pain affect your ability to move the joint normally?",
            "Have you tried any treatments? (Ice, heat, rest, medication?)"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Joint Pain Analysis:</strong><br><br>";
            const swelling = answers[3].toLowerCase();
            const stiffness = answers[5].toLowerCase();
            const injury = answers[6].toLowerCase();
            const fever = answers[7].toLowerCase();
            const severity = parseInt(answers[2]) || 5;
            
            if (swelling.includes("yes") && fever.includes("yes")) {
                advice += "⚠️ <strong>Possible Joint Infection</strong><br>";
                advice += "Swollen, warm joint with fever may indicate infection. Seek immediate medical attention.<br><br>";
            } else if (stiffness.includes("yes") && stiffness.includes("morning")) {
                advice += "This may indicate <strong>Rheumatoid Arthritis or Inflammatory Condition</strong>. Consult a healthcare provider for proper diagnosis.<br><br>";
            } else if (injury.includes("yes")) {
                advice += "This appears to be <strong>Joint Injury or Sprain</strong>.<br><br>";
            } else {
                advice += "This appears to be <strong>Joint Pain or Arthritis</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            advice += "• Ibuprofen 400-600mg (Advil, Motrin) - anti-inflammatory, every 6-8 hours<br>";
            advice += "• Naproxen 220-440mg (Aleve) - longer-lasting relief<br>";
            advice += "• Acetaminophen 500-1000mg (Tylenol) - for pain<br>";
            advice += "• Topical: Diclofenac gel (Voltaren), Capsaicin cream<br>";
            advice += "• Glucosamine and Chondroitin supplements (may help with joint health)<br><br>";
            
            advice += "<strong>🏠 Home Remedies:</strong><br>";
            advice += "• Apply ice for acute pain/swelling (15-20 min, 3-4 times daily)<br>";
            advice += "• Apply heat for chronic stiffness (warm compress, heating pad)<br>";
            advice += "• Rest the affected joint<br>";
            advice += "• Gentle range-of-motion exercises (when pain allows)<br>";
            advice += "• Maintain healthy weight to reduce joint stress<br>";
            advice += "• Use assistive devices if needed (cane, brace)<br>";
            advice += "• Epsom salt baths<br>";
            
            if (severity >= 8) {
                advice += "<br>⚠️ <strong>Severe joint pain.</strong> If pain is severe, persistent, or limiting function, consult a healthcare provider.";
            }
            
            return advice;
        }
    },
    "fatigue": {
        questions: [
            "How long have you been feeling fatigued or tired?",
            "Is the fatigue constant or does it come and go?",
            "How would you rate your energy level? (1-10, where 1 is completely exhausted)",
            "Do you have difficulty sleeping or are you sleeping too much?",
            "Have you been under increased stress recently?",
            "Have you made any changes to your diet or eating habits?",
            "Do you have other symptoms? (Fever, body aches, headache, or mood changes?)",
            "Are you taking any medications that might cause fatigue?",
            "Have you been more physically active than usual?",
            "Do you feel better after rest or does rest not help?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Fatigue Analysis:</strong><br><br>";
            const sleep = answers[3].toLowerCase();
            const stress = answers[4].toLowerCase();
            const other = answers[6].toLowerCase();
            
            if (other.includes("fever") || other.includes("ache")) {
                advice += "Fatigue with fever or body aches may indicate an <strong>infection or illness</strong>.<br><br>";
            } else if (sleep.includes("difficulty") || sleep.includes("insomnia")) {
                advice += "This may be related to <strong>sleep problems or insomnia</strong>.<br><br>";
            } else if (stress.includes("yes")) {
                advice += "This may be <strong>stress-related fatigue</strong>.<br><br>";
            } else {
                advice += "This appears to be <strong>General Fatigue or Tiredness</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Supplements (if needed):</strong><br>";
            advice += "• Iron supplements (if anemic - check with doctor first)<br>";
            advice += "• Vitamin B12 (if deficient)<br>";
            advice += "• Vitamin D3 (if deficient)<br>";
            advice += "• Multivitamin with B-complex<br>";
            advice += "• Coenzyme Q10 (may help with energy)<br>";
            advice += "• Avoid excessive caffeine (can cause energy crashes)<br><br>";
            
            advice += "<strong>🏠 Lifestyle & Home Remedies:</strong><br>";
            advice += "• Get 7-9 hours of quality sleep per night<br>";
            advice += "• Maintain a regular sleep schedule<br>";
            advice += "• Eat a balanced diet with regular meals<br>";
            advice += "• Stay hydrated - drink plenty of water<br>";
            advice += "• Exercise regularly (even light activity can boost energy)<br>";
            advice += "• Manage stress through relaxation techniques (meditation, yoga)<br>";
            advice += "• Take short breaks throughout the day<br>";
            advice += "• Limit alcohol and avoid smoking<br>";
            advice += "• Get sunlight exposure (for Vitamin D and circadian rhythm)<br><br>";
            
            advice += "⚠️ <strong>Note:</strong> If fatigue persists for more than 2 weeks or is severe, consult a healthcare provider to rule out underlying conditions.";
            
            return advice;
        }
    },
    "dizziness": {
        questions: [
            "How long have you been experiencing dizziness?",
            "How would you describe it? (Spinning sensation, lightheadedness, feeling faint, or unsteady?)",
            "Does the dizziness occur when you stand up, move your head, or is it constant?",
            "Do you have nausea, vomiting, or sweating with the dizziness?",
            "Have you had any recent head injury or trauma?",
            "Are you taking any medications that might cause dizziness?",
            "Do you have ear pain, ringing in ears, or hearing changes?",
            "Do you have vision changes, headache, or confusion?",
            "Have you been dehydrated or not eating properly?",
            "Do you have any heart conditions or blood pressure issues?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Dizziness Analysis:</strong><br><br>";
            const type = answers[1].toLowerCase();
            const trigger = answers[2].toLowerCase();
            const ear = answers[6].toLowerCase();
            const head = answers[4].toLowerCase();
            
            if (head.includes("yes") || head.includes("injury")) {
                advice += "⚠️ <strong>URGENT: Head Injury</strong><br>";
                advice += "Dizziness after head injury requires immediate medical evaluation. Seek emergency care.<br><br>";
            } else if (type.includes("spinning") && ear.includes("ringing")) {
                advice += "This may be <strong>Vertigo or Inner Ear Problem</strong> (e.g., Benign Paroxysmal Positional Vertigo - BPPV).<br><br>";
            } else if (trigger.includes("stand")) {
                advice += "This may be <strong>Orthostatic Hypotension</strong> (low blood pressure when standing).<br><br>";
            } else {
                advice += "This appears to be <strong>General Dizziness or Lightheadedness</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC - use with caution):</strong><br>";
            advice += "• Meclizine (Antivert, Dramamine) - for vertigo and motion sickness<br>";
            advice += "• Dimenhydrinate (Dramamine) - for nausea and dizziness<br>";
            advice += "• Ginger supplements or tea - natural anti-nausea<br><br>";
            
            advice += "<strong>🏠 Home Remedies & Safety:</strong><br>";
            advice += "• Sit or lie down immediately when feeling dizzy<br>";
            advice += "• Move slowly when changing positions<br>";
            advice += "• Stay hydrated - drink plenty of water<br>";
            advice += "• Eat regular, balanced meals (avoid low blood sugar)<br>";
            advice += "• Avoid sudden head movements<br>";
            advice += "• Get up slowly from sitting or lying position<br>";
            advice += "• Avoid alcohol and caffeine<br>";
            advice += "• Use assistive devices if needed (cane, handrails)<br>";
            advice += "• Epley maneuver (for BPPV - consult doctor first)<br><br>";
            
            advice += "⚠️ <strong>Important:</strong> If dizziness is severe, persistent, or accompanied by chest pain, difficulty speaking, or weakness, seek immediate medical attention.";
            
            return advice;
        }
    },
    "nausea": {
        questions: [
            "How long have you been feeling nauseous?",
            "Have you vomited? If yes, how many times?",
            "What triggered the nausea? (Food, motion, medication, or unknown?)",
            "Do you have any other symptoms? (Fever, diarrhea, abdominal pain, headache?)",
            "Are you pregnant or could you be pregnant?",
            "Have you eaten anything unusual or potentially spoiled?",
            "Are you taking any medications that might cause nausea?",
            "Do you have acid reflux or heartburn along with nausea?",
            "Does the nausea worsen with certain foods or smells?",
            "Have you been under stress or anxiety recently?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Nausea Analysis:</strong><br><br>";
            const trigger = answers[2].toLowerCase();
            const other = answers[3].toLowerCase();
            const pregnant = answers[4].toLowerCase();
            const food = answers[5].toLowerCase();
            
            if (pregnant.includes("yes") || pregnant.includes("could")) {
                advice += "This may be <strong>Morning Sickness or Pregnancy-Related Nausea</strong>.<br><br>";
            } else if (food.includes("yes") || food.includes("spoiled")) {
                advice += "⚠️ <strong>Possible Food Poisoning</strong><br>";
                advice += "Nausea after eating potentially spoiled food may indicate food poisoning. Stay hydrated and seek medical care if severe or persistent.<br><br>";
            } else if (trigger.includes("motion")) {
                advice += "This appears to be <strong>Motion Sickness</strong>.<br><br>";
            } else if (trigger.includes("medication")) {
                advice += "This may be <strong>Medication-Induced Nausea</strong>. Consult your doctor about adjusting medication.<br><br>";
            } else {
                advice += "This appears to be <strong>General Nausea</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            advice += "• Dimenhydrinate (Dramamine) - for motion sickness and general nausea<br>";
            advice += "• Meclizine (Antivert, Bonine) - for motion sickness<br>";
            advice += "• Bismuth subsalicylate (Pepto-Bismol) - for stomach upset<br>";
            advice += "• Antacids (if related to acid reflux)<br>";
            advice += "• Ginger supplements, capsules, or tea - natural anti-nausea<br><br>";
            
            advice += "<strong>🏠 Home Remedies:</strong><br>";
            advice += "• Eat small, frequent meals (avoid large meals)<br>";
            advice += "• Stick to bland foods (crackers, toast, rice, bananas)<br>";
            advice += "• Avoid spicy, greasy, or strong-smelling foods<br>";
            advice += "• Stay hydrated - sip water, clear broths, or electrolyte solutions<br>";
            advice += "• Ginger tea or ginger ale (real ginger, not just flavored)<br>";
            advice += "• Peppermint tea or peppermint candies<br>";
            advice += "• Get fresh air and avoid strong odors<br>";
            advice += "• Rest in a comfortable position<br>";
            advice += "• Acupressure (wrist bands for motion sickness)<br><br>";
            
            if (other.includes("fever") && other.includes("severe")) {
                advice += "⚠️ <strong>Note:</strong> Nausea with fever and severe symptoms may indicate infection. Consult a healthcare provider if symptoms persist or worsen.";
            }
            
            return advice;
        }
    },
    "diarrhea": {
        questions: [
            "How long have you had diarrhea?",
            "How many times have you had loose stools today?",
            "What is the consistency? (Watery, loose, or semi-formed?)",
            "Do you have abdominal pain, cramping, or bloating?",
            "Do you have fever, nausea, or vomiting?",
            "Have you eaten anything unusual or traveled recently?",
            "Do you see blood or mucus in your stool?",
            "Are you able to keep fluids down?",
            "Do you feel dehydrated? (Dry mouth, decreased urination, dizziness?)",
            "Are you taking any medications, especially antibiotics?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Diarrhea Analysis:</strong><br><br>";
            const days = parseInt(answers[0]) || 1;
            const frequency = parseInt(answers[1]) || 3;
            const blood = answers[6].toLowerCase();
            const fever = answers[4].toLowerCase();
            const dehydrated = answers[8].toLowerCase();
            
            if (blood.includes("yes")) {
                advice += "⚠️ <strong>URGENT: Blood in Stool</strong><br>";
                advice += "Diarrhea with blood requires immediate medical attention. Seek emergency care.<br><br>";
            } else if (dehydrated.includes("yes") || frequency > 10) {
                advice += "⚠️ <strong>Severe Diarrhea - Risk of Dehydration</strong><br>";
                advice += "Frequent diarrhea with signs of dehydration requires medical attention. Seek care if unable to keep fluids down.<br><br>";
            } else if (fever.includes("yes") && days > 2) {
                advice += "This may be <strong>Bacterial or Viral Gastroenteritis</strong>.<br><br>";
            } else if (days < 2) {
                advice += "This appears to be <strong>Acute Diarrhea</strong>, likely from food or viral infection.<br><br>";
            } else {
                advice += "This appears to be <strong>Diarrhea</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            advice += "• Loperamide (Imodium) - to slow down bowel movements (use cautiously, not for bacterial infections)<br>";
            advice += "• Bismuth subsalicylate (Pepto-Bismol) - for diarrhea and stomach upset<br>";
            advice += "• Probiotics (Lactobacillus, Bifidobacterium) - to restore gut flora<br>";
            advice += "• Oral Rehydration Solution (ORS) - essential for preventing dehydration<br>";
            advice += "• Activated Charcoal (may help with some toxins)<br><br>";
            
            advice += "<strong>🏠 Home Remedies & Hydration:</strong><br>";
            advice += "• <strong>CRITICAL:</strong> Stay hydrated - drink water, ORS, clear broths, or electrolyte solutions<br>";
            advice += "• Eat BRAT diet: Bananas, Rice, Applesauce, Toast (bland foods)<br>";
            advice += "• Avoid dairy, spicy foods, caffeine, and alcohol<br>";
            advice += "• Avoid high-fiber foods temporarily<br>";
            advice += "• Get plenty of rest<br>";
            advice += "• Wash hands frequently to prevent spread<br><br>";
            
            if (days > 3) {
                advice += "⚠️ <strong>Note:</strong> Diarrhea lasting more than 3 days should be evaluated by a healthcare provider.";
            }
            
            return advice;
        }
    },
    "constipation": {
        questions: [
            "How long have you been constipated?",
            "When was your last bowel movement?",
            "How often do you normally have bowel movements?",
            "Is passing stool painful or difficult?",
            "Do you feel bloated or have abdominal discomfort?",
            "Have you made any recent changes to your diet or lifestyle?",
            "Are you taking any medications that might cause constipation?",
            "Do you drink enough water daily?",
            "Do you get regular physical activity?",
            "Do you have any other symptoms? (Nausea, vomiting, severe pain?)"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Constipation Analysis:</strong><br><br>";
            const days = parseInt(answers[0]) || 1;
            const lastBM = answers[1].toLowerCase();
            const pain = answers[3].toLowerCase();
            const severe = answers[9].toLowerCase();
            
            if (days > 7 && severe.includes("severe")) {
                advice += "⚠️ <strong>Severe Constipation</strong><br>";
                advice += "Constipation lasting more than a week with severe symptoms should be evaluated by a healthcare provider.<br><br>";
            } else {
                advice += "This appears to be <strong>Constipation</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            advice += "• Fiber supplements (Psyllium husk, Metamucil) - take with plenty of water<br>";
            advice += "• Stool softeners (Docusate sodium - Colace)<br>";
            advice += "• Osmotic laxatives (Polyethylene glycol - Miralax, Lactulose)<br>";
            advice += "• Stimulant laxatives (Senna, Bisacodyl - use short-term only)<br>";
            advice += "• Magnesium supplements (may help with regularity)<br>";
            advice += "• Probiotics (to support gut health)<br><br>";
            
            advice += "<strong>🏠 Home Remedies & Lifestyle:</strong><br>";
            advice += "• Increase fiber intake gradually (fruits, vegetables, whole grains)<br>";
            advice += "• Drink plenty of water (8-10 glasses daily)<br>";
            advice += "• Get regular physical activity (walking, exercise)<br>";
            advice += "• Establish regular bathroom routine<br>";
            advice += "• Don't ignore the urge to have a bowel movement<br>";
            advice += "• Prune juice or dried prunes (natural laxative)<br>";
            advice += "• Warm liquids in the morning (tea, warm water with lemon)<br>";
            advice += "• Avoid processed foods and excessive dairy<br>";
            advice += "• Consider abdominal massage<br><br>";
            
            if (days > 3) {
                advice += "⚠️ <strong>Note:</strong> If constipation persists for more than 3 days or is accompanied by severe pain, consult a healthcare provider.";
            }
            
            return advice;
        }
    },
    "sore throat": {
        questions: [
            "How long have you had the sore throat?",
            "On a scale of 1-10, how severe is the pain?",
            "Is it painful to swallow?",
            "Do you have a fever or body aches?",
            "Do you have a cough or runny nose?",
            "Are your tonsils swollen or do you see white spots?",
            "Do you have swollen lymph nodes in your neck?",
            "Have you been exposed to anyone with strep throat?",
            "Do you have hoarseness or voice changes?",
            "Is the pain worse in the morning or throughout the day?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Sore Throat Analysis:</strong><br><br>";
            const fever = answers[3].toLowerCase();
            const spots = answers[5].toLowerCase();
            const nodes = answers[6].toLowerCase();
            const strep = answers[7].toLowerCase();
            const severity = parseInt(answers[1]) || 5;
            
            if (spots.includes("yes") && fever.includes("yes") && strep.includes("yes")) {
                advice += "⚠️ <strong>Possible Strep Throat</strong><br>";
                advice += "White spots on tonsils with fever may indicate strep throat, which requires antibiotics. Consult a healthcare provider for testing.<br><br>";
            } else if (fever.includes("yes") || nodes.includes("yes")) {
                advice += "This may be a <strong>Bacterial or Viral Throat Infection</strong>.<br><br>";
            } else {
                advice += "This appears to be a <strong>Sore Throat</strong>, likely viral.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            advice += formatMedicineWithCart("• Throat lozenges (Strepsils, Cepacol, Halls) - for temporary pain relief - ₹75");
            advice += formatMedicineWithCart("• Chloraseptic or Cepacol throat spray - ₹80");
            advice += formatMedicineWithCart("• Ibuprofen 400-600mg (Advil) - for pain and inflammation - ₹80");
            advice += formatMedicineWithCart("• Acetaminophen 500-1000mg (Tylenol) - for pain - ₹50");
            advice += "• Warm salt water gargle solution (if available)<br><br>";
            
            advice += "<strong>🏠 Home Remedies:</strong><br>";
            advice += "• Salt water gargle (1/2 tsp salt in 8 oz warm water) - 3-4 times daily<br>";
            advice += "• Stay hydrated - drink warm fluids (tea with honey, warm water, soup)<br>";
            advice += "• Honey and lemon in warm water (soothing and antimicrobial)<br>";
            advice += "• Throat lozenges or hard candies (keep throat moist)<br>";
            advice += "• Rest your voice (avoid talking loudly or whispering)<br>";
            advice += "• Use a humidifier to add moisture to air<br>";
            advice += "• Avoid irritants (smoke, dry air, alcohol)<br>";
            advice += "• Warm compress on neck<br>";
            advice += "• Get plenty of rest<br><br>";
            
            if (severity >= 8 || spots.includes("yes")) {
                advice += "⚠️ <strong>Note:</strong> Severe sore throat or symptoms suggesting strep throat should be evaluated by a healthcare provider for proper treatment.";
            }
            
            return advice;
        }
    },
    "cough": {
        questions: [
            "How long have you had the cough?",
            "Is your cough dry (no phlegm) or productive (with phlegm/mucus)?",
            "What color is the phlegm? (Clear, white, yellow, green, or bloody?)",
            "Do you have a fever, body aches, or other cold symptoms?",
            "Does the cough worsen at night or when lying down?",
            "Do you have shortness of breath or wheezing?",
            "Have you been exposed to smoke, dust, or other irritants?",
            "Do you have chest pain or tightness?",
            "Are you taking any medications that might cause cough?",
            "Do you have heartburn or acid reflux?"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Cough Analysis:</strong><br><br>";
            const type = answers[1].toLowerCase();
            const phlegm = answers[2].toLowerCase();
            const breath = answers[5].toLowerCase();
            const chest = answers[7].toLowerCase();
            const heartburn = answers[9].toLowerCase();
            
            if (breath.includes("yes") || breath.includes("shortness")) {
                advice += "⚠️ <strong>Difficulty Breathing</strong><br>";
                advice += "Cough with shortness of breath or wheezing requires medical evaluation. Seek care if severe.<br><br>";
            } else if (heartburn.includes("yes") && answers[4].includes("night")) {
                advice += "This may be <strong>Acid Reflux-Related Cough</strong>.<br><br>";
            } else if (type.includes("productive") && phlegm.includes("green")) {
                advice += "This may be a <strong>Bacterial Infection</strong>. Consult a healthcare provider if it persists.<br><br>";
            } else if (type.includes("dry")) {
                advice += "This appears to be a <strong>Dry Cough</strong>.<br><br>";
            } else {
                advice += "This appears to be a <strong>Productive Cough</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Medicines (OTC):</strong><br>";
            
            if (type.includes("dry")) {
                advice += formatMedicineWithCart("• Dextromethorphan (Robitussin DM, Delsym) - cough suppressant - ₹55");
                advice += "• Honey (natural cough suppressant - 1-2 tsp as needed)<br>";
            } else {
                advice += formatMedicineWithCart("• Guaifenesin (Mucinex, Robitussin) - expectorant to loosen phlegm - ₹65");
                advice += formatMedicineWithCart("• Bromhexine - to help clear mucus - ₹60");
                advice += "• Avoid cough suppressants for productive coughs (need to clear mucus)<br>";
            }
            
            advice += formatMedicineWithCart("• Throat lozenges (Strepsils, Cepacol) - for throat irritation - ₹75");
            advice += formatMedicineWithCart("• Ibuprofen or Acetaminophen (if you have fever or body aches) - ₹80");
            advice += "<br>";
            
            advice += "<strong>🏠 Home Remedies:</strong><br>";
            advice += "• Stay hydrated - drink plenty of warm fluids (water, tea, soup)<br>";
            advice += "• Honey and lemon in warm water (soothing and helps with cough)<br>";
            advice += "• Steam inhalation - breathe steam from hot shower or bowl of hot water<br>";
            advice += "• Use a humidifier to add moisture to air<br>";
            advice += "• Elevate head while sleeping (for nighttime cough)<br>";
            advice += "• Avoid irritants (smoke, dust, strong perfumes)<br>";
            advice += "• Salt water gargle (if throat is irritated)<br>";
            advice += "• Get plenty of rest<br><br>";
            
            if (phlegm.includes("blood")) {
                advice += "⚠️ <strong>URGENT: Blood in Phlegm</strong><br>";
                advice += "Coughing up blood requires immediate medical attention. Seek emergency care.<br>";
            }
            
            return advice;
        }
    },
    "insomnia": {
        questions: [
            "How long have you been having trouble sleeping?",
            "What is your main sleep problem? (Difficulty falling asleep, staying asleep, waking too early, or poor quality sleep?)",
            "How many hours of sleep do you typically get per night?",
            "What time do you usually go to bed and wake up?",
            "Do you feel tired or sleepy during the day?",
            "Are you under increased stress or anxiety?",
            "Do you drink caffeine, alcohol, or use electronic devices before bed?",
            "Do you have pain, discomfort, or other symptoms that keep you awake?",
            "Do you take naps during the day?",
            "Is your sleep environment comfortable? (Temperature, noise, light, mattress?)"
        ],
        analyze: (answers) => {
            let advice = "<strong>📋 Insomnia & Sleep Problems Analysis:</strong><br><br>";
            const problem = answers[1].toLowerCase();
            const hours = parseInt(answers[2]) || 7;
            const stress = answers[5].toLowerCase();
            const habits = answers[6].toLowerCase();
            
            if (stress.includes("yes")) {
                advice += "This may be <strong>Stress or Anxiety-Related Insomnia</strong>.<br><br>";
            } else if (habits.includes("caffeine") || habits.includes("electronic")) {
                advice += "This may be related to <strong>Sleep Habits or Lifestyle Factors</strong>.<br><br>";
            } else {
                advice += "This appears to be <strong>Insomnia or Sleep Problems</strong>.<br><br>";
            }
            
            advice += "<strong>💊 Recommended Supplements/Medicines (OTC - use cautiously):</strong><br>";
            advice += formatMedicineWithCart("• Melatonin 0.5-3mg - take 30-60 min before bedtime - ₹200");
            advice += formatMedicineWithCart("• Magnesium supplements (may promote relaxation) - ₹150");
            advice += formatMedicineWithCart("• Valerian root (herbal sleep aid) - ₹180");
            advice += "• Chamomile tea (natural relaxant)<br>";
            advice += formatMedicineWithCart("• Diphenhydramine (Benadryl) - short-term use only, may cause next-day drowsiness - ₹35");
            advice += formatMedicineWithCart("• Doxylamine (Unisom) - similar to diphenhydramine - ₹40");
            advice += "⚠️ Avoid long-term use of sleep aids without medical supervision<br><br>";
            
            advice += "<strong>🏠 Sleep Hygiene & Lifestyle Changes:</strong><br>";
            advice += "• Maintain a regular sleep schedule (same bedtime and wake time, even on weekends)<br>";
            advice += "• Create a relaxing bedtime routine (warm bath, reading, meditation)<br>";
            advice += "• Make your bedroom comfortable (cool, dark, quiet)<br>";
            advice += "• Avoid caffeine after 2 PM<br>";
            advice += "• Avoid alcohol close to bedtime (disrupts sleep quality)<br>";
            advice += "• Avoid large meals, heavy exercise, or stimulating activities before bed<br>";
            advice += "• Turn off electronic devices 1 hour before bed (blue light disrupts sleep)<br>";
            advice += "• Use bed only for sleep and intimacy (not work, TV, or phone)<br>";
            advice += "• If you can't sleep after 20 minutes, get up and do something relaxing, then return to bed<br>";
            advice += "• Limit daytime naps to 20-30 minutes (if needed)<br>";
            advice += "• Get regular exercise (but not too close to bedtime)<br>";
            advice += "• Practice relaxation techniques (deep breathing, meditation, progressive muscle relaxation)<br>";
            advice += "• Consider cognitive behavioral therapy for insomnia (CBT-I)<br><br>";
            
            if (hours < 5) {
                advice += "⚠️ <strong>Severe sleep deprivation.</strong> If sleep problems persist and significantly affect your daily life, consult a healthcare provider or sleep specialist.";
            }
            
            return advice;
        }
    }
};


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log(apiKey ? 'OpenAI API key found' : 'OpenAI API key not configured');
    if (chatInput) chatInput.focus();
    
    // Check if cart functionality is available
    if (typeof addToCart === 'function') {
        console.log('✅ Cart functionality loaded');
    } else {
        console.log('⚠️ Cart functionality not found, using fallback');
    }
    
    // Update API key status indicator
    updateApiKeyStatus();
    
    // Close modal when clicking outside
    const modal = document.getElementById('apiKeyModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                toggleApiKeyConfig();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('apiKeyModal');
            if (modal && modal.classList.contains('active')) {
                toggleApiKeyConfig();
            }
        }
    });
    
    // Show helpful message if no API key is set
    if (!apiKey) {
        setTimeout(() => {
            appendMessage('💡 <strong>Tip:</strong> Click the "🔑 API Key" button in the header to configure your OpenAI API key for enhanced AI responses. You can still use the symptom checker without it!', 'bot');
        }, 2000);
    }
});


// --- CORE CHAT FUNCTIONS ---
// Modified appendMessage to handle 'error' type
function appendMessage(message, sender = 'bot') {
    if (!chatBox) {
        chatBox = document.getElementById('chatBox') || document.getElementById('chatMessages');
    }
    if (!chatBox) {
        console.error('Chat box element not found');
        return;
    }
    
    // Clear empty state if it exists
    const emptyState = chatBox.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    const msgDiv = document.createElement('div');
    
    // Apply classes based on sender type - match HTML structure
    if (sender === 'error') {
        msgDiv.className = 'message bot-message error';
    } else {
        msgDiv.className = `message ${sender === 'bot' ? 'bot-message' : 'user-message'}`;
    }

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = message;

    msgDiv.appendChild(content);
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Attach add to cart event listeners after message is inserted
    // Use setTimeout to ensure DOM is fully updated
    setTimeout(() => {
        attachCartListeners(content);
    }, 100);
}

// Function to attach cart event listeners to add-to-cart buttons
function attachCartListeners(container) {
    if (!container) {
        console.error('Container is null or undefined');
        return;
    }
    
    const cartButtons = container.querySelectorAll('.add-to-cart-btn');
    console.log(`Found ${cartButtons.length} cart buttons to attach listeners to`);
    
    cartButtons.forEach((button, index) => {
        // Skip if button already has listener attached
        if (button.dataset.listenerAttached === 'true') {
            console.log(`Button ${index} already has listener, skipping`);
            return;
        }
        
        // Mark as having listener attached
        button.dataset.listenerAttached = 'true';
        
        // Remove any existing click listeners by cloning
        const newButton = button.cloneNode(true);
        newButton.dataset.listenerAttached = 'true';
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            let productName = this.getAttribute('data-product-name');
            const price = this.getAttribute('data-price');
            
            console.log('Button clicked!', { productName, price, raw: this.getAttribute('data-product-name') });
            
            // Decode JSON-encoded product name
            if (productName) {
                try {
                    productName = JSON.parse(productName);
                    console.log('Parsed product name:', productName);
                } catch (parseError) {
                    console.warn('Failed to parse product name as JSON, using as-is:', parseError);
                    // If parsing fails, use as-is (remove quotes if present)
                    productName = productName.replace(/^["']|["']$/g, '');
                }
            }
            
            if (productName && price) {
                const numPrice = parseFloat(price);
                console.log('Adding to cart:', { productName, price: numPrice });
                
                // Use addToCart from cart.js if available, otherwise use fallback
                if (typeof addToCart === 'function') {
                    console.log('Using cart.js addToCart function');
                    addToCart(productName, numPrice);
                } else {
                    console.log('Using fallback cart functionality');
                    // Fallback cart functionality
                    let cart = JSON.parse(localStorage.getItem('cart')) || [];
                    const existingItem = cart.find(item => item.name === productName);
                    
                    if (existingItem) {
                        existingItem.quantity += 1;
                        console.log('Incremented quantity for existing item');
                    } else {
                        cart.push({
                            name: productName,
                            price: numPrice,
                            quantity: 1
                        });
                        console.log('Added new item to cart');
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(cart));
                    
                    // Update cart badge if function exists
                    if (typeof updateCartBadge === 'function') {
                        updateCartBadge();
                    }
                    
                    alert(`✅ Added ${productName} to your cart!`);
                }
            } else {
                console.error('Missing product name or price:', { productName, price });
                alert('⚠️ Error: Could not add item to cart. Missing product information.');
            }
        });
        
        console.log(`Attached listener to button ${index}`);
    });
}

// Helper function to extract price from medicine string
function extractPriceFromMedicine(medicineText) {
    // Look for price patterns like "₹50", "$10", "50", etc.
    const priceMatch = medicineText.match(/[₹$]?(\d+(?:[.,]\d+)?)/);
    if (priceMatch) {
        return parseFloat(priceMatch[1].replace(',', ''));
    }
    // Default prices for common medicines if no price found
    const defaultPrices = {
        'paracetamol': 50,
        'tylenol': 50,
        'dolo': 60,
        'crocin': 50,
        'ibuprofen': 80,
        'advil': 80,
        'motrin': 80,
        'aspirin': 45,
        'disprin': 45,
        'excedrin': 150,
        'naproxen': 100,
        'aleve': 100,
        'antacid': 30,
        'digene': 30,
        'eno': 25,
        'omeprazole': 50,
        'omez': 50,
        'prilosec': 50,
        'pantoprazole': 60,
        'pantocid': 60,
        'ranitidine': 40,
        'zantac': 40,
        'famotidine': 45,
        'pepcid': 45,
        'dicyclomine': 35,
        'simethicone': 30,
        'probiotics': 200,
        'diclofenac': 95,
        'voltaren': 95,
        'dramamine': 60,
        'meclizine': 70,
        'antivert': 70,
        'bismuth': 50,
        'pepto-bismol': 50,
        'loperamide': 40,
        'imodium': 40,
        'guaifenesin': 65,
        'mucinex': 65,
        'dextromethorphan': 55,
        'robitussin': 55,
        'cetirizine': 40,
        'zyrtec': 40,
        'okacet': 40,
        'loratadine': 45,
        'claritin': 45,
        'diphenhydramine': 35,
        'benadryl': 35,
        'strepsils': 75,
        'cepacol': 80,
        'halls': 70,
        'melatonin': 200,
        'magnesium': 150
    };
    
    const lowerText = medicineText.toLowerCase();
    for (const [key, price] of Object.entries(defaultPrices)) {
        if (lowerText.includes(key)) {
            return price;
        }
    }
    
    return 50; // Default price if nothing matches
}

// Helper function to create add to cart button HTML
function createCartButton(medicineName, price) {
    // Store as JSON for proper parsing (will be decoded in event handler)
    const jsonName = JSON.stringify(medicineName);
    const buttonId = `cart-btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Use single quotes for data-product-name to avoid issues with JSON double quotes
    return `<button class="add-to-cart-btn" id="${buttonId}" data-product-name='${jsonName}' data-price="${price}" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #00796b, #26a69a); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-top: 8px; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 6px rgba(0, 121, 107, 0.2);">
        🛒 Add to Cart
    </button>`;
}

// Helper function to format medicine recommendations with cart buttons
function formatMedicineWithCart(medicineText) {
    // Extract medicine name (text before dash, parentheses, or price)
    let medicineName = medicineText.split('(')[0].split('-')[0].trim();
    medicineName = medicineName.replace(/^\d+\.\s*/, ''); // Remove numbering
    medicineName = medicineName.replace(/\s*-\s*.*$/, ''); // Remove everything after dash
    medicineName = medicineName.replace(/\s*\(.*$/, ''); // Remove parentheses content
    medicineName = medicineName.replace(/^•\s*/, ''); // Remove bullet point if present
    medicineName = medicineName.trim();
    
    // Extract price
    const price = extractPriceFromMedicine(medicineText);
    
    // Create formatted medicine with cart button
    return `<div style="margin-bottom: 12px; padding: 12px; background: rgba(0, 191, 165, 0.08); border-radius: 10px; border-left: 3px solid #00796b;">
        ${medicineText}
        ${createCartButton(medicineName, price)}
    </div>`;
}


// Triggered when user clicks a button (e.g., "Headache")
function selectSymptom(symptomName) {
    // Hide option buttons
    const optionsDiv = document.getElementById('symptomOptions');
    if (optionsDiv) optionsDiv.style.display = 'none';
    
    // Simulate user typing the symptom
    handleUserMessage(symptomName);
}


// --- MAIN LOGIC CONTROLLER ---

function handleUserMessage(message) {
    appendMessage(message, 'user');

    // 1. Check if we are already in a diagnostic flow
    if (isDiagnosing) {
        handleDiagnosticAnswer(message);
        return;
    }

    // 2. Check if the message matches a known symptom keyword to START diagnosis
    const lowerMsg = message.toLowerCase();
    let foundSymptom = null;

    // Enhanced keyword matching for all symptoms
    if (lowerMsg.includes("headache") || lowerMsg.includes("head pain") || lowerMsg.includes("migraine")) foundSymptom = "headache";
    else if (lowerMsg.includes("fever") || lowerMsg.includes("temp") || lowerMsg.includes("temperature")) foundSymptom = "fever";
    else if (lowerMsg.includes("stomach") || lowerMsg.includes("belly") || lowerMsg.includes("abdomen") || lowerMsg.includes("stomachache")) foundSymptom = "stomach pain";
    else if (lowerMsg.includes("cold") || lowerMsg.includes("flu") || lowerMsg.includes("runny nose") || lowerMsg.includes("nasal congestion")) foundSymptom = "cold";
    else if (lowerMsg.includes("muscle pain") || lowerMsg.includes("muscle ache") || lowerMsg.includes("muscle soreness") || lowerMsg.includes("sore muscles")) foundSymptom = "muscle pain";
    else if (lowerMsg.includes("back pain") || lowerMsg.includes("backache") || lowerMsg.includes("lower back") || lowerMsg.includes("upper back")) foundSymptom = "back pain";
    else if (lowerMsg.includes("joint pain") || lowerMsg.includes("joint ache") || lowerMsg.includes("arthritis") || lowerMsg.includes("achy joints")) foundSymptom = "joint pain";
    else if (lowerMsg.includes("fatigue") || lowerMsg.includes("tired") || lowerMsg.includes("exhausted") || lowerMsg.includes("low energy") || lowerMsg.includes("feeling tired")) foundSymptom = "fatigue";
    else if (lowerMsg.includes("dizziness") || lowerMsg.includes("dizzy") || lowerMsg.includes("lightheaded") || lowerMsg.includes("vertigo") || lowerMsg.includes("feeling faint")) foundSymptom = "dizziness";
    else if (lowerMsg.includes("nausea") || lowerMsg.includes("nauseous") || lowerMsg.includes("feeling sick") || lowerMsg.includes("queasy")) foundSymptom = "nausea";
    else if (lowerMsg.includes("diarrhea") || lowerMsg.includes("diarrhoea") || lowerMsg.includes("loose stool") || lowerMsg.includes("loose stools")) foundSymptom = "diarrhea";
    else if (lowerMsg.includes("constipation") || lowerMsg.includes("can't poop") || lowerMsg.includes("hard stool") || lowerMsg.includes("difficulty passing stool")) foundSymptom = "constipation";
    else if (lowerMsg.includes("sore throat") || lowerMsg.includes("throat pain") || lowerMsg.includes("throat hurts") || lowerMsg.includes("throatache")) foundSymptom = "sore throat";
    else if (lowerMsg.includes("cough") || lowerMsg.includes("coughing") || lowerMsg.includes("hacking")) foundSymptom = "cough";
    else if (lowerMsg.includes("insomnia") || lowerMsg.includes("can't sleep") || lowerMsg.includes("trouble sleeping") || lowerMsg.includes("sleep problems") || lowerMsg.includes("sleepless")) foundSymptom = "insomnia";

    if (foundSymptom) {
        startDiagnosticFlow(foundSymptom);
    } else {
        // 3. If no specific symptom recognized, use AI or Fallback
        if (apiKey) {
            getAIResponse(message);
        } else {
            setTimeout(() => {
                appendMessage("I can help with specific symptoms like:<br><br>" +
                    "• <strong>Headache</strong> • <strong>Fever</strong> • <strong>Cold/Flu</strong><br>" +
                    "• <strong>Stomach Pain</strong> • <strong>Muscle Pain</strong> • <strong>Back Pain</strong><br>" +
                    "• <strong>Joint Pain</strong> • <strong>Fatigue</strong> • <strong>Dizziness</strong><br>" +
                    "• <strong>Nausea</strong> • <strong>Diarrhea</strong> • <strong>Constipation</strong><br>" +
                    "• <strong>Sore Throat</strong> • <strong>Cough</strong> • <strong>Insomnia</strong><br><br>" +
                    "Please type one of these symptoms to start a detailed check-up, or configure your API key for general questions.");
            }, 600);
        }
    }
}


// --- DIAGNOSTIC FLOW FUNCTIONS ---

function startDiagnosticFlow(symptomKey) {
    isDiagnosing = true;
    currentSymptom = symptomKey;
    currentQuestionIndex = 0;
    userAnswers = [];

    setTimeout(() => {
        appendMessage(`I see you have a <strong>${symptomKey}</strong>. Let me ask you a few questions to suggest the best medicine.`);
    }, 500);

    setTimeout(() => {
        askNextQuestion();
    }, 1500);
}

function askNextQuestion() {
    const protocol = symptomProtocols[currentSymptom];
    
    if (currentQuestionIndex < protocol.questions.length) {
        const q = protocol.questions[currentQuestionIndex];
        appendMessage(`<strong>Q${currentQuestionIndex + 1}:</strong> ${q}`);
    } else {
        finishDiagnosis();
    }
}

function handleDiagnosticAnswer(answer) {
    // Store the answer
    userAnswers.push(answer);
    currentQuestionIndex++;

    // Simulate "Typing" delay
    setTimeout(() => {
        askNextQuestion();
    }, 600);
}

function finishDiagnosis() {
    // Show loading state
    const loadingId = 'analyzing-' + Date.now();
    const loadingMsg = document.createElement('div');
    loadingMsg.classList.add('bot-message', 'loading');
    loadingMsg.id = loadingId;
    loadingMsg.innerHTML = '<span class="typing-indicator">💊 MediBot is analyzing your answers...</span>';
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        // Remove loading
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();

        // Get Analysis
        const protocol = symptomProtocols[currentSymptom];
        const finalAdvice = protocol.analyze(userAnswers);

        appendMessage(finalAdvice);
        
        // Add disclaimer
        appendMessage("<small><em>Disclaimer: I am an AI, not a doctor. These are OTC recommendations. If symptoms persist or worsen, please visit a hospital immediately.</em></small>");

        // Reset State
        isDiagnosing = false;
        currentSymptom = null;
        userAnswers = [];
    }, 2000);
}


// --- INPUT HANDLERS ---

function handleChatInputKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendChatMessage();
    }
}

function sendChatMessage() {
    if (!chatInput) {
        chatInput = document.getElementById('chatInput') || document.getElementById('messageInput');
    }
    if (!chatInput) {
        console.error('Chat input element not found');
        return;
    }
    
    const message = chatInput.value.trim();
    if (!message) return;

    chatInput.value = ''; // Clear input
    
    // Hide initial options if they exist
    const symptomOptions = document.getElementById('symptomOptions');
    if (symptomOptions) symptomOptions.style.display = 'none';
    
    // Clear empty state
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    handleUserMessage(message);
}


// --- OPENAI API INTEGRATION (Fallback/General) ---
async function getAIResponse(userMessage) {
    const loadingMsg = document.createElement('div');
    loadingMsg.classList.add('bot-message', 'loading');
    loadingMsg.innerHTML = '<span class="typing-indicator">🤔 AI is thinking...</span>';
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: "You are a helpful medical assistant. Provide general advice." },
                    ...conversationHistory.slice(-5),
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 200
            })
        });

        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        loadingMsg.remove();
        appendMessage(data.choices[0].message.content, 'bot');

    } catch (error) {
        loadingMsg.remove();
        let errorMsg = "⚠️ AI Connection failed. ";
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            errorMsg += "Invalid API Key. Please check your API key in settings (🔑 API Key button).";
        } else if (error.message.includes('429')) {
            errorMsg += "Rate limit exceeded. Please try again later.";
        } else if (!apiKey) {
            errorMsg += "No API key configured. Click the 🔑 API Key button to add one, or try the specific symptom checkers (Headache, Fever, etc).";
        } else {
            errorMsg += "Please check your API Key or try the specific symptom checkers (Headache, Fever, etc).";
        }
        
        appendMessage(errorMsg, 'error');
    }
}

// API Key UI Helpers
function toggleApiKeyConfig() {
    const modal = document.getElementById('apiKeyModal');
    const input = document.getElementById('apiKeyInput');
    
    if (!modal) return;
    
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
    } else {
        modal.classList.add('active');
        if (input) {
            // Show masked version if key exists
            input.value = apiKey ? (apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4)) : '';
            input.type = apiKey ? 'password' : 'text';
            // Focus and select all for easy replacement
            setTimeout(() => {
                input.focus();
                input.select();
            }, 100);
        }
    }
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    if (!input) return;
    
    const newKey = input.value.trim();
    
    // Validate API key format (should start with sk-)
    if (newKey && !newKey.startsWith('sk-')) {
        alert('⚠️ Invalid API Key format. OpenAI API keys should start with "sk-"');
        return;
    }
    
    apiKey = newKey;
    localStorage.setItem('openai_api_key', apiKey);
    
    // Show success message
    const modal = document.getElementById('apiKeyModal');
    if (modal) {
        const saveBtn = modal.querySelector('.api-key-btn-save');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✅ Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #0f9d58, #34a853)';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
            toggleApiKeyConfig();
        }, 1500);
    }
    
    // Update API key status indicator if it exists
    updateApiKeyStatus();
}

function updateApiKeyStatus() {
    const apiKeyBtn = document.querySelector('.api-key-btn');
    if (!apiKeyBtn) return;
    
    // Remove existing status
    const existingStatus = apiKeyBtn.querySelector('.api-key-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Add status indicator
    const status = document.createElement('span');
    status.className = `api-key-status ${apiKey ? 'connected' : 'not-connected'}`;
    status.textContent = apiKey ? '✓ Connected' : '✗ Not Set';
    apiKeyBtn.appendChild(status);
}
