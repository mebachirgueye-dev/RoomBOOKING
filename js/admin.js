document.addEventListener('DOMContentLoaded', () => {

    let rooms = JSON.parse(localStorage.getItem('roomBook_rooms')) || [];
    let reservations = JSON.parse(localStorage.getItem('roomBook_reservations')) || [];

    const roomForm = document.getElementById('add-room-form');
    const roomsTableBody = document.getElementById('rooms-table-body');
    const totalRoomsCount = document.getElementById('total-rooms-count');
    const noRoomsMsg = document.getElementById('no-rooms-message');

    const reservationsTableBody = document.getElementById('reservations-table-body');
    const resCountBadge = document.getElementById('res-count-badge');
    const noResMsg = document.getElementById('no-res-message');

    const historyTableBody = document.getElementById('history-table-body');

    const statTotalRes = document.getElementById('stat-total-res');
    const statTotalRooms = document.getElementById('stat-total-rooms');
    const statConfirmedRes = document.getElementById('stat-confirmed-res');

    function saveRooms() {
        localStorage.setItem('roomBook_rooms', JSON.stringify(rooms));
        renderAll();
    }

    function saveReservations() {
        localStorage.setItem('roomBook_reservations', JSON.stringify(reservations));
        renderAll();
    }

    function renderAll() {
        renderRooms();
        renderReservations();
        renderHistory();
        updateDashboard();
    }

    function updateDashboard() {
        statTotalRooms.textContent = rooms.length;
        statTotalRes.textContent = reservations.length;
        const confirmedCount = reservations.filter(r => r.status === 'confirmé').length;
        statConfirmedRes.textContent = confirmedCount;
    }

    function renderRooms() {
        roomsTableBody.innerHTML = '';
        totalRoomsCount.textContent = `${rooms.length}`;

        if (rooms.length === 0) {
            noRoomsMsg.style.display = 'flex'; 
        } else {
            noRoomsMsg.style.display = 'none';

            const iconColors = ['blue', 'purple', 'green', 'orange'];

            rooms.forEach((room, index) => {
                const colorClass = iconColors[index % iconColors.length];

                let badgeClass = 'type-standard'; 
                const typeLower = room.type.toLowerCase();
                if (typeLower.includes('luxe') || typeLower.includes('vip')) badgeClass = 'type-luxe';
                else if (typeLower.includes('conférence') || typeLower.includes('réunion')) badgeClass = 'type-conference';
                else if (typeLower.includes('maintenance')) badgeClass = 'type-maintenance';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="room-name">
                            <div class="icon-box ${colorClass}">
                                <i class="fas fa-door-open"></i>
                            </div>
                            <div>
                                <span>${room.name}</span>
                                <small>ID: #${room.id ? room.id.toString().slice(-4) : 'N/A'}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge-type ${badgeClass}">${room.type}</span>
                    </td>
                    <td>
                        <span class="capacity-badge">
                            <i class="fas fa-user-friends"></i> ${room.capacity} pers.
                        </span>
                    </td>
                    <td class="text-right">
                        <button onclick="window.deleteRoom(${index})" class="btn-icon delete" title="Supprimer la salle">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                roomsTableBody.appendChild(tr);
            });
        }
    }

    if (roomForm) {
        roomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newRoom = {
                id: Date.now(),
                name: document.getElementById('room-name-input').value,
                capacity: document.getElementById('room-capacity-input').value,
                type: document.getElementById('room-type-input').value
            };
            rooms.push(newRoom);
            saveRooms();
            roomForm.reset();
        });
    }

    window.deleteRoom = (index) => {

        if(confirm('Supprimer définitivement cette salle ?')) {
            rooms.splice(index, 1);
            saveRooms();
        }
    };

    function renderReservations() {
        reservationsTableBody.innerHTML = '';

        const pendingRes = reservations.map((res, index) => ({...res, originalIndex: index}))
                                     .filter(r => r.status === 'attente');

        resCountBadge.textContent = pendingRes.length;

        if (pendingRes.length === 0) {
            noResMsg.style.display = 'block';
        } else {
            noResMsg.style.display = 'none';
            
            pendingRes.forEach((res) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${res.client}</strong></td>
                    <td>${res.room}</td>
                    <td>${res.date}</td>
                    <td><span class="status-badge attente">En attente</span></td>
                    <td class="text-right">
                        <button onclick="window.updateStatus(${res.originalIndex}, 'confirmé')" class="btn-icon validate" title="Valider" style="color:var(--primary); margin-right:8px; background:transparent; border:none; font-size:1.2rem; cursor:pointer;"><i class="fas fa-check-circle"></i></button>
                        <button onclick="window.updateStatus(${res.originalIndex}, 'annulé')" class="btn-icon cancel" title="Refuser" style="color:#ef4444; background:transparent; border:none; font-size:1.2rem; cursor:pointer;"><i class="fas fa-times-circle"></i></button>
                    </td>
                `;
                reservationsTableBody.appendChild(tr);
            });
        }
    }

    function renderHistory() {
        historyTableBody.innerHTML = '';
        
        const sortedRes = [...reservations].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedRes.forEach(res => {
            let statusClass = '';
            if(res.status === 'confirmé') statusClass = 'confirmé';
            else if(res.status === 'annulé') statusClass = 'annulé';
            else statusClass = 'attente';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${res.date}</td>
                <td>${res.client}</td>
                <td>${res.room}</td>
                <td><span class="status-badge ${statusClass}">${res.status}</span></td>
            `;
            historyTableBody.appendChild(tr);
        });
    }

    window.updateStatus = (index, newStatus) => {
        reservations[index].status = newStatus;
        saveReservations(); 
    };

    const btnLogout = document.querySelector('.btn-logout');
    if(btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            localStorage.removeItem('roomBook_isLoggedIn');
        });
    }

    renderAll();
});