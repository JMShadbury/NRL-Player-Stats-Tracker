let allData = [];
let chartInstance;
let statsLegend = {}; // Define the statsLegend variable

// Function to fetch the stats legend from stats_legend.json
async function fetchStatsLegend() {
    try {
        const response = await fetch('stats_legend.json');
        if (!response.ok) {
            throw new Error('Failed to fetch stats legend');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats legend:', error);
    }
}

// Function to initialize the table with player data
function initializeTable(data) {
    const table = document.getElementById('players-table');
    table.innerHTML = ''; // Clear existing table rows

    // Create the header row
    const header = table.createTHead();
    const headerRow = header.insertRow(0);
    const headerCell = headerRow.insertCell(0);
    headerCell.colSpan = "2";
    headerCell.innerHTML = '<strong>Player Name</strong>';

    // Create a row for each player
    data.forEach((player, index) => {
        // Manually assign a unique ID to each player object
        player.id = `player${index + 1}`;

        const row = table.insertRow(-1);
        row.insertCell(0).textContent = player.name;
        row.setAttribute('data-player-id', player.id); // Set a data attribute to identify the player
        row.onclick = function() {
            const playerId = this.getAttribute('data-player-id');
            console.log('Selected Player ID:', playerId); // Log the selected player's ID
            const selectedPlayer = data.find(player => player.id === playerId);
            console.log('Selected Player Data:', selectedPlayer); // Log the selected player's data
            updateChart(selectedPlayer);
        };
    });
}

// Function to initialize the stats table with data
function initializeStatsTable(data) {
    const table = document.getElementById('stats-table');
    table.innerHTML = ''; // Clear existing table rows

    // Create the header row
    const headerRow = table.insertRow();
    const headerCell1 = headerRow.insertCell();
    const headerCell2 = headerRow.insertCell();
    headerCell1.textContent = 'Stat Acronym';
    headerCell2.textContent = 'Stat Name';

    // Populate the table with stat data
    data.forEach(([acronym, name]) => {
        const row = table.insertRow();
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        cell1.textContent = acronym;
        cell2.textContent = name;
    });
}

// Function to filter stats based on search input
function filterStats(query) {
    query = query.toLowerCase();
    const filteredStats = Object.entries(statsLegend).filter(([key, value]) => key.toLowerCase().includes(query) || value.toLowerCase().includes(query));
    initializeStatsTable(filteredStats);
}


// Modify the updateChart function to accept an array of selected stats
function updateChart(playerData, selectedStats) {
    const statLabels = selectedStats.map(stat => statsLegend[stat]);
    const statData = selectedStats.map(stat => +playerData.stats[stat]);

    if (!chartInstance) {
        const ctx = document.getElementById('player-stats-chart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statLabels,
                datasets: [{
                    label: `${playerData.name}'s Stats`,
                    data: statData,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        chartInstance.data.labels = statLabels;
        chartInstance.data.datasets[0].data = statData;
        chartInstance.data.datasets[0].label = `${playerData.name}'s Stats`;
        chartInstance.update();
    }
}

// Create a function to handle the selection/deselection of stats and update the chart accordingly
function updateChartWithSelectedStats() {
    const selectedStats = Array.from(document.querySelectorAll('#stats-table input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    const selectedPlayerId = document.querySelector('#players-table .selected')?.getAttribute('data-player-id');
    if (selectedPlayerId) {
        const selectedPlayer = allData.find(player => player.id === selectedPlayerId);
        updateChart(selectedPlayer, selectedStats);
    }
}

// Event listener for stat checkbox changes
document.getElementById('stats-table').addEventListener('change', updateChartWithSelectedStats);


// Function to filter players based on search input
function filterPlayers(query) {
    query = query.toLowerCase();
    const filteredData = allData.filter(player => player.name.toLowerCase().includes(query));
    initializePlayerTable(filteredData);
}

// Function to filter stats based on search input
function filterStats(query) {
    query = query.toLowerCase();
    const filteredStats = Object.entries(statsLegend).filter(([key, value]) => key.toLowerCase().includes(query) || value.toLowerCase().includes(query));
    initializeStatsTable(filteredStats);
}

function updateChartWithSelectedStats() {
    const selectedStats = Array.from(document.querySelectorAll('#stats-table input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
    const selectedPlayerId = document.querySelector('#players-table .selected')?.getAttribute('data-player-id');
    if (selectedPlayerId) {
        const selectedPlayer = allData.find(player => player.id === selectedPlayerId);
        updateChart(selectedPlayer, selectedStats);
    }
}

// Event listeners for player and stat search boxes
document.getElementById('player-search-box').addEventListener('input', function (e) {
    filterPlayers(e.target.value);
});

document.getElementById('stat-search-box').addEventListener('input', function (e) {
    filterStats(e.target.value);
});

document.getElementById('stats-table').addEventListener('change', updateChartWithSelectedStats);


// Function to populate the stats search box with options
function populateStatSearchBox() {
    const statSearchBox = document.getElementById('stat-search-box');
    const options = Object.entries(statsLegend).map(([key, value]) => `${key} - ${value}`);
    statSearchBox.setAttribute('data-options', JSON.stringify(options));
}

// Fetch the JSON data and set up the table and chart
async function fetchDataAndSetup() {
    try {
        const [data, legend] = await Promise.all([fetch('players_stats.json').then(response => response.json()), fetchStatsLegend()]);
        allData = data;
        statsLegend = legend; // Populate the statsLegend variable
        initializeTable(data);
        populateStatSearchBox();

        document.getElementById('player-search-box').addEventListener('input', function (e) {
            filterPlayers(e.target.value);
        });

        document.getElementById('stat-search-box').addEventListener('input', function (e) {
            const filteredStats = filterStats(e.target.value);
            console.log(filteredStats); // Log the filtered stats for testing
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchDataAndSetup();
