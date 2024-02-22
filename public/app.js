function showNotification(message, type) {
    Swal.fire({
        text: message,
        icon: type,
        position: 'top',
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        customClass: {
            popup: 'custom-toast',
            icon: 'custom-icon',
            title: 'custom-title',
            content: 'custom-content'
        }
    });
}

function fetchJSON() {
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.textContent = 'Loading Data...';

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id || !/^\d{5,10}$/.test(id)) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid ID',
            text: 'Please provide a valid ID between 5 and 10 digits.',
            confirmButtonText: 'OK'
        });
        document.getElementById('refresh-button').style.visibility = "hidden";
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = '';
        const row = document.createElement('tr');
        row.innerHTML = `
                <td colspan="4">No data available - Enter a Valid Match ID</td>
            `;
        tableBody.appendChild(row);
        return;
    }

    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    const loadingRow = document.createElement('tr');
    loadingRow.innerHTML = `
            <td colspan="4">Loading...</td>
        `;
    tableBody.appendChild(loadingRow);

    fetch(`/api/score?id=${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            //console.log('Raw JSON response:', data);
            updateTable(data);
            refreshButton.textContent = 'Refresh Score';
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
            refreshButton.textContent = 'Refresh Score';
        });
}

function updateTable(data) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    const row = document.createElement('tr');
    if (!data || Object.keys(data).length === 0 || data.livescore === "Data Not Found") {
        document.getElementById('refresh-button').style.visibility = "hidden";
        row.innerHTML = `
                <td colspan="4">${data.update || 'No data available'}</td>
            `;
        tableBody.appendChild(row);
    } else {
        tableBody.innerHTML = `
                <th>Match</th>
                <td>${data.title || '-'}</td>
                </tr>
                <tr>
                <th>Score</th>
                <td>${data.livescore || '-'}</td>
                </tr>
                <tr>
                <th>Run Rate</th>
                <td>${data.runrate || '-'}</td>
                </tr>
                <tr>
                <th>Status</th>
                <td>${data.update || '-'}</td>
                </tr>
            `;
        //tableBody.appendChild(row);
    }
}

document.addEventListener('DOMContentLoaded', fetchJSON);

function getData() {
    fetchJSON();
    showNotification('Refreshing data...', 'success');
}

const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
const wsURL = wsProtocol + window.location.host;
let ws;
function connectWebSocket() {
    ws = new WebSocket(wsURL);
    ws.onopen = function() {
        console.log('Connected to WebSocket server');
        //showNotification('WebSocket connected', 'success');
        updateButtonStatus(true);
    };
    ws.onmessage = function(event) {
        console.log('Message from server:', event.data);
        if (event.data === 'reload') {
            showNotification('Refreshing data...', 'success');
            fetchJSON();
        } else {
            showNotification(event.data, 'info');
        }
    };
    ws.onclose = function() {
        console.log('Disconnected from WebSocket server');
        showNotification('WebSocket disconnected', 'error');
        updateButtonStatus(false);
    };
}
function updateButtonStatus(connected) {
    const button = document.getElementById('wsBtn');
    const statusText = document.getElementById('statusText');
    const disconnectButton = document.getElementById('disconnectButton');
    if (connected) {
        button.textContent = 'Online';
        button.disabled = true;
        statusText.innerHTML = '<div class="tags has-addons is-centered"><span class="tag is-dark">Status</span><span class="tag is-link">Online 🟢</span></div>';
        disconnectButton.disabled = false;
    } else {
        button.textContent = 'Reconnect';
        button.disabled = false;
        statusText.innerHTML = '<div class="tags has-addons is-centered"><span class="tag is-dark">Status</span><span class="tag is-link">Offline 🔴</span></div>';
        disconnectButton.disabled = true;
    }
}
document.getElementById('wsBtn').addEventListener('click', function() {
    const button = document.getElementById('wsBtn');
    button.textContent = 'Reconnecting';
    button.disabled = false;
    statusText.textContent = 'Status: Checking....';
    setTimeout(function() {
        connectWebSocket();
        window.location.reload();
    }, 3000)
});
connectWebSocket();
const disconnectButton = document.getElementById('disconnectButton');
disconnectButton.addEventListener('click', function() {
    if (ws) {
        ws.close();
        console.log('WebSocket disconnected');
    } else {
        console.log('WebSocket connection does not exist');
    }
});