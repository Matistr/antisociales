// main.js

document.addEventListener('DOMContentLoaded', () => {
    const matchButton = document.getElementById('match-button');
    const resultContainer = document.getElementById('result-container');

    matchButton.addEventListener('click', () => {
        const players = getPlayers();
        const matches = createMatches(players);
        displayMatches(matches);
    });

    function getPlayers() {
        // Aquí se puede implementar la lógica para obtener la lista de jugadores
        return ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'];
    }

    function createMatches(players) {
        const shuffledPlayers = players.sort(() => 0.5 - Math.random());
        const matches = [];

        for (let i = 0; i < shuffledPlayers.length; i += 2) {
            if (shuffledPlayers[i + 1]) {
                matches.push([shuffledPlayers[i], shuffledPlayers[i + 1]]);
            }
        }

        return matches;
    }

    function displayMatches(matches) {
        resultContainer.innerHTML = '';
        matches.forEach(match => {
            const matchElement = document.createElement('div');
            matchElement.textContent = `${match[0]} vs ${match[1]}`;
            resultContainer.appendChild(matchElement);
        });
    }
});