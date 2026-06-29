document.addEventListener('DOMContentLoaded', () => {
    
    const rooms = JSON.parse(localStorage.getItem('roomBook_rooms')) || [];
    const reservations = JSON.parse(localStorage.getItem('roomBook_reservations')) || [];

    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;
            const errorMsg = document.getElementById('msg-erreur-login');

            if (user === 'admin' && pass === '1234') {
                localStorage.setItem('roomBook_isLoggedIn', 'true');
                window.location.href = '/html/gestion.html'; 
            } else {
                errorMsg.style.display = 'block';
            }
        });
    }

    const selectSalle = document.getElementById('select-salle');
    if (selectSalle) {
        if (rooms.length > 0) {
            rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.name;
                option.textContent = `${room.name} (${room.type} - ${room.capacity} pers.)`;
                selectSalle.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.textContent = "Aucune salle disponible";
            selectSalle.appendChild(option);
            selectSalle.disabled = true;
        }
    }

    const reservationForm = document.getElementById('form-reservation');
    const feedbackMsg = document.getElementById('message-feedback');

    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newReservation = {
                id: Date.now(), 
                client: document.getElementById('nom-user').value,
                room: document.getElementById('select-salle').value,
                date: document.getElementById('date-reservation').value,
                status: 'attente' 
            };

            const isTaken = reservations.some(res => 
                res.room === newReservation.room && 
                res.date === newReservation.date && 
                res.status !== 'annulé'
            );

            if (isTaken) {
                feedbackMsg.className = 'message error'; 
                feedbackMsg.textContent = "Désolé, cette salle est déjà réservée à cette date.";
                feedbackMsg.style.display = 'block';
                feedbackMsg.style.color = 'red';
                return;
            }

            reservations.push(newReservation);
            localStorage.setItem('roomBook_reservations', JSON.stringify(reservations));

            feedbackMsg.className = 'message success';
            feedbackMsg.style.color = 'green';
            feedbackMsg.style.display = 'block';
            feedbackMsg.textContent = "Réservation envoyée avec succès ! En attente de validation.";
            
            reservationForm.reset();
            
            renderAvailability(document.getElementById('check-date').value);

            setTimeout(() => {
                feedbackMsg.style.display = 'none';
            }, 5000);
        });
    }

    const grid = document.getElementById('availability-grid');
    const dateInput = document.getElementById('check-date');

    if (grid && dateInput) {

        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;

        function renderAvailability(selectedDate) {
            grid.innerHTML = ''; 

            if (rooms.length === 0) {
                grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Aucune salle configurée par l\'administrateur.</p>';
                return;
            }

            rooms.forEach(room => {

                const currentReservations = JSON.parse(localStorage.getItem('roomBook_reservations')) || [];
                
                const isReserved = currentReservations.some(res => 
                    res.room === room.name && 
                    res.date === selectedDate && 
                    res.status !== 'annulé'
                );

                const statusText = isReserved ? 'Réservé' : 'Disponible';
                const dotColor = isReserved ? '#ef4444' : '#10b981';
                const badgeBg = isReserved ? '#fef2f2' : '#ecfdf5';
                const badgeText = isReserved ? '#991b1b' : '#065f46';

                const card = document.createElement('div');
                card.className = 'avail-card'; 
                card.innerHTML = `
                    <div class="avail-header">
                        <span class="room-type-label">${room.type}</span>
                        <div class="status-live" style="background-color: ${badgeBg}; color: ${badgeText};">
                            <span class="status-dot" style="background-color: ${dotColor};"></span> ${statusText}
                        </div>
                    </div>
                    
                    <div class="avail-body">
                        <h3>${room.name}</h3>
                    </div>

                    <div class="avail-footer">
                        <i class="fas fa-users"></i>
                        <span>Capacité : <strong>${room.capacity}</strong> personnes</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        renderAvailability(today);

        dateInput.addEventListener('change', (e) => {
            renderAvailability(e.target.value);
        });
    }

    const contactForm = document.getElementById('form-contact');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Message envoyé ! (Simulation)");
            contactForm.reset();
        });
    }
});