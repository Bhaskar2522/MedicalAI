// Appointment Booking System
document.addEventListener('DOMContentLoaded', () => {
    const callTypeCard = document.getElementById('callType');
    const offlineTypeCard = document.getElementById('offlineType');
    const appointmentForm = document.getElementById('appointmentForm');
    const callFields = document.getElementById('callFields');
    const offlineFields = document.getElementById('offlineFields');
    const bookingForm = document.getElementById('bookingForm');
    const confirmationModal = document.getElementById('confirmationModal');
    const appointmentDate = document.getElementById('appointmentDate');
    const appointmentTime = document.getElementById('appointmentTime');
    const specialtySelect = document.getElementById('specialty');
    const doctorSelect = document.getElementById('doctor');

    let selectedAppointmentType = null;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    appointmentDate.setAttribute('min', today);

    // Appointment Type Selection
    callTypeCard.addEventListener('click', () => {
        selectAppointmentType('call');
    });

    offlineTypeCard.addEventListener('click', () => {
        selectAppointmentType('offline');
    });

    function selectAppointmentType(type) {
        selectedAppointmentType = type;
        
        // Update card selection
        callTypeCard.classList.remove('selected');
        offlineTypeCard.classList.remove('selected');
        
        if (type === 'call') {
            callTypeCard.classList.add('selected');
            callFields.style.display = 'block';
            offlineFields.style.display = 'none';
            document.getElementById('clinicLocation').removeAttribute('required');
        } else {
            offlineTypeCard.classList.add('selected');
            callFields.style.display = 'none';
            offlineFields.style.display = 'block';
            document.getElementById('clinicLocation').setAttribute('required', 'required');
        }
        
        // Show form with animation
        appointmentForm.style.display = 'block';
        appointmentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Doctor data based on specialty
    const doctorsBySpecialty = {
        general: [
            { id: 'dr-smith', name: 'Dr. Sarah Smith', available: true },
            { id: 'dr-johnson', name: 'Dr. Michael Johnson', available: true },
            { id: 'dr-patel', name: 'Dr. Priya Patel', available: true }
        ],
        cardiology: [
            { id: 'dr-kumar', name: 'Dr. Rajesh Kumar', available: true },
            { id: 'dr-sharma', name: 'Dr. Anjali Sharma', available: true }
        ],
        dermatology: [
            { id: 'dr-williams', name: 'Dr. Emily Williams', available: true },
            { id: 'dr-brown', name: 'Dr. David Brown', available: true }
        ],
        pediatrics: [
            { id: 'dr-gupta', name: 'Dr. Meera Gupta', available: true },
            { id: 'dr-singh', name: 'Dr. Arjun Singh', available: true }
        ],
        orthopedics: [
            { id: 'dr-verma', name: 'Dr. Vikram Verma', available: true },
            { id: 'dr-reddy', name: 'Dr. Kavya Reddy', available: true }
        ],
        psychiatry: [
            { id: 'dr-khan', name: 'Dr. Ayesha Khan', available: true },
            { id: 'dr-iyer', name: 'Dr. Ravi Iyer', available: true }
        ],
        gynecology: [
            { id: 'dr-nair', name: 'Dr. Sunita Nair', available: true },
            { id: 'dr-malhotra', name: 'Dr. Neha Malhotra', available: true }
        ],
        neurology: [
            { id: 'dr-kapoor', name: 'Dr. Amit Kapoor', available: true },
            { id: 'dr-desai', name: 'Dr. Sneha Desai', available: true }
        ]
    };

    // Update doctors when specialty changes
    specialtySelect.addEventListener('change', (e) => {
        const specialty = e.target.value;
        doctorSelect.innerHTML = '<option value="">Select a doctor</option>';
        
        if (specialty && doctorsBySpecialty[specialty]) {
            doctorsBySpecialty[specialty].forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = doctor.name;
                doctorSelect.appendChild(option);
            });
        }
    });

    // Generate time slots
    function generateTimeSlots() {
        const slots = [];
        const startHour = 9; // 9 AM
        const endHour = 18; // 6 PM
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = formatTime(hour, minute);
                slots.push({ value: timeString, display: displayTime });
            }
        }
        
        return slots;
    }

    function formatTime(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    }

    // Update time slots when date changes
    appointmentDate.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        appointmentTime.innerHTML = '<option value="">Select time slot</option>';
        
        if (selectedDate) {
            const slots = generateTimeSlots();
            slots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.value;
                option.textContent = slot.display;
                appointmentTime.appendChild(option);
            });
            
            // Show info
            const infoBox = document.getElementById('timeSlotsInfo');
            infoBox.textContent = `Available time slots for ${formatDate(selectedDate)}`;
            infoBox.style.display = 'block';
        }
    });

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Form submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!selectedAppointmentType) {
            alert('Please select an appointment type first!');
            return;
        }
        
        // Collect form data
        const formData = {
            type: selectedAppointmentType,
            patientName: document.getElementById('patientName').value,
            patientAge: document.getElementById('patientAge').value,
            patientPhone: document.getElementById('patientPhone').value,
            patientEmail: document.getElementById('patientEmail').value,
            specialty: specialtySelect.value,
            doctor: doctorSelect.options[doctorSelect.selectedIndex].text,
            date: appointmentDate.value,
            time: appointmentTime.options[appointmentTime.selectedIndex].text,
            reason: document.getElementById('reason').value,
            urgent: document.getElementById('urgent').checked,
            notes: document.getElementById('notes').value
        };
        
        if (selectedAppointmentType === 'call') {
            const callType = document.querySelector('input[name="callType"]:checked').value;
            formData.callType = callType;
            formData.platform = document.getElementById('callPlatform').value;
        } else {
            formData.location = document.getElementById('clinicLocation').options[document.getElementById('clinicLocation').selectedIndex].text;
        }
        
        // Save to localStorage and get appointment ID
        const appointmentId = saveAppointment(formData);
        formData.id = appointmentId;
        
        // Show confirmation
        showConfirmation(formData);
    });

    function saveAppointment(data) {
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const appointmentId = Date.now().toString();
        const appointment = {
            id: appointmentId,
            ...data,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Log to console for verification
        console.log('✅ Appointment saved successfully!', appointment);
        console.log('📋 Total appointments:', appointments.length);
        
        return appointmentId;
    }

    function showConfirmation(data) {
        const appointmentId = data.id || 'N/A';
        const bookingDetails = document.getElementById('bookingDetails');
        
        // Verify data was saved
        const savedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
        const savedAppointment = savedAppointments.find(apt => apt.id === appointmentId);
        
        if (!savedAppointment) {
            console.warn('⚠️ Appointment not found in localStorage after save');
        } else {
            console.log('✅ Verified: Appointment saved successfully', savedAppointment);
        }
        
        const displayId = typeof appointmentId === 'string' && appointmentId.length > 6 
            ? appointmentId.slice(-6) 
            : appointmentId;
            
        bookingDetails.innerHTML = `
            <h3>Appointment Details</h3>
            <div class="detail-row">
                <span class="detail-label">Appointment ID:</span>
                <span class="detail-value">#${displayId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${data.type === 'call' ? 'Phone/Video Call' : 'In-Person Visit'}</span>
            </div>
            ${data.type === 'call' ? `
                <div class="detail-row">
                    <span class="detail-label">Call Type:</span>
                    <span class="detail-value">${data.callType === 'phone' ? 'Phone Call' : 'Video Call'}</span>
                </div>
                ${data.platform ? `
                    <div class="detail-row">
                        <span class="detail-label">Platform:</span>
                        <span class="detail-value">${data.platform}</span>
                    </div>
                ` : ''}
            ` : `
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${data.location}</span>
                </div>
            `}
            <div class="detail-row">
                <span class="detail-label">Doctor:</span>
                <span class="detail-value">${data.doctor}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Specialty:</span>
                <span class="detail-value">${data.specialty.charAt(0).toUpperCase() + data.specialty.slice(1)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formatDate(data.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${data.time}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Patient:</span>
                <span class="detail-value">${data.patientName} (Age: ${data.patientAge})</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Contact:</span>
                <span class="detail-value">${data.patientPhone}</span>
            </div>
            ${data.urgent ? `
                <div class="detail-row">
                    <span class="detail-label">Priority:</span>
                    <span class="detail-value" style="color: #d32f2f; font-weight: 700;">URGENT</span>
                </div>
            ` : ''}
        `;
        
        confirmationModal.classList.add('show');
        bookingForm.reset();
        appointmentForm.style.display = 'none';
        selectedAppointmentType = null;
        callTypeCard.classList.remove('selected');
        offlineTypeCard.classList.remove('selected');
    }

    // Close modal
    window.closeModal = function() {
        confirmationModal.classList.remove('show');
    };

    // Reset form
    window.resetForm = function() {
        if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
            bookingForm.reset();
            appointmentForm.style.display = 'none';
            selectedAppointmentType = null;
            callTypeCard.classList.remove('selected');
            offlineTypeCard.classList.remove('selected');
            document.getElementById('timeSlotsInfo').style.display = 'none';
        }
    };

    // View appointments
    window.viewAppointments = function() {
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        if (appointments.length === 0) {
            alert('You have no appointments booked yet.');
        } else {
            // Create a detailed display of appointments
            let message = `📅 Your Appointments (${appointments.length} total):\n\n`;
            appointments.forEach((apt, index) => {
                message += `${index + 1}. Appointment #${apt.id.slice(-6)}\n`;
                message += `   Doctor: ${apt.doctor}\n`;
                message += `   Date: ${formatDate(apt.date)}\n`;
                message += `   Time: ${apt.time}\n`;
                message += `   Type: ${apt.type === 'call' ? 'Phone/Video Call' : 'In-Person Visit'}\n`;
                if (apt.type === 'call' && apt.callType) {
                    message += `   Call Type: ${apt.callType === 'phone' ? 'Phone' : 'Video'}\n`;
                }
                if (apt.location) {
                    message += `   Location: ${apt.location}\n`;
                }
                message += `   Status: ${apt.status}\n`;
                message += `   Patient: ${apt.patientName} (Age: ${apt.patientAge})\n`;
                message += `   Contact: ${apt.patientPhone}\n\n`;
            });
            alert(message);
            
            // Also log to console for debugging
            console.log('📋 All saved appointments:', appointments);
        }
        closeModal();
    };

    // Close modal on outside click
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            closeModal();
        }
    });
});

