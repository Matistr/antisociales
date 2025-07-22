document.addEventListener('DOMContentLoaded', () => {
    const modalidad = document.getElementById('modalidad');
    const inputContainer = document.getElementById('inputContainer');
    let inputRef = document.getElementById('participantes');
    const matchButton = document.getElementById('match-button');
    const seccionInicio = document.getElementById('matchmaking');
    const seccionFases = document.getElementById('fases');
    const resultContainer = document.getElementById('result-container');
    const btnRegenerar = document.getElementById('regenerar');
    const btnVolver = document.getElementById('volver');

    let ultimaData = [];
    let ultimaModalidad = '1v1';
    let faseActual = [];
    let ronda = 1;
    let ganadoresPrevios = [];

    modalidad.addEventListener('change', function() {
        if (modalidad.value === '2v2') {
            inputContainer.innerHTML = `
                <label for="equipos" style="color: #fff;">Nombres de los equipos (uno por línea, cada equipo separado por coma):</label>
                <textarea id="equipos" rows="6" placeholder="Ejemplo:&#10;Equipo1A,Equipo1B&#10;Equipo2A,Equipo2B"></textarea>
            `;
            inputRef = document.getElementById('equipos');
        } else {
            inputContainer.innerHTML = `
                <label for="participantes" style="color: #fff;">Nombres de los jugadores (uno por línea):</label>
                <textarea id="participantes" rows="6" placeholder="Ejemplo:&#10;Jugador1&#10;Jugador2&#10;Jugador3"></textarea>
            `;
            inputRef = document.getElementById('participantes');
        }
    });

    matchButton.addEventListener('click', () => {
        let data = inputRef.value.trim().split('\n').map(x => x.trim()).filter(Boolean);
        ultimaModalidad = modalidad.value;
        if (modalidad.value === '2v2') {
            let equipos = data.map(eq => eq.split(',').map(j => j.trim()).filter(Boolean));
            if (equipos.some(eq => eq.length !== 2)) {
                alert('Cada equipo debe tener 2 jugadores.');
                return;
            }
            ultimaData = equipos.map(eq => `${eq[0]} & ${eq[1]}`);
        } else {
            if (modalidad.value === '4p' && data.length !== 4) {
                alert('Debes ingresar exactamente 4 jugadores.');
                return;
            }
            if (modalidad.value === '1v1' && data.length < 2) {
                alert('Debes ingresar al menos 2 jugadores.');
                return;
            }
            ultimaData = data;
        }
        seccionInicio.style.display = 'none';
        seccionFases.style.display = 'block';
        ronda = 1;
        ganadoresPrevios = []; // Limpiar ganadores previos al iniciar torneo
        mostrarFase(ultimaData);
    });

    btnRegenerar.addEventListener('click', function() {
        // Si hay ganadores previos, solo tomar esos para la siguiente fase
        if (ganadoresPrevios.length > 0) {
            mostrarFase(ganadoresPrevios);
        } else {
            mostrarFase(ultimaData);
        }
    });

    btnVolver.addEventListener('click', function() {
        seccionFases.style.display = 'none';
        seccionInicio.style.display = 'block';
    });

    function mostrarFase(participantes) {
        resultContainer.innerHTML = '';
        if (ultimaModalidad === '4p') {
            let jugadores = [...participantes];
            shuffleArray(jugadores);
            let html = `<h3 style="color:#fff;">Todos vs Todos</h3>`;
            for (let i = 0; i < jugadores.length; i++) {
                for (let j = i+1; j < jugadores.length; j++) {
                    html += `<div class="match-red">${jugadores[i]} <span style="color:#ff1744;">VS</span> ${jugadores[j]}</div>`;
                }
            }
            resultContainer.innerHTML = html;
            return;
        }

        // 1v1 y 2v2: solo mostrar la fase actual
        let fase = emparejarConBye([...participantes]);
        faseActual = fase;
        let nombreFase = getNombreFase(participantes.length, ronda);
        let html = `<div class="fase-torneo"><h3 style="color:#fff;">${nombreFase}</h3>`;
        fase.forEach((match, idx) => {
            if (match.length === 2) {
                html += `
                    <div class="match-red">
                        <span>${match[0]}</span>
                        <span style="color:#ff1744;">VS</span>
                        <span>${match[1]}</span>
                        <input type="text" class="input-ganador" placeholder="Ganador" style="margin-left:16px; border-radius:12px; border:1.5px solid #ff1744; padding:4px 10px; background:#181818; color:#fff;">
                    </div>
                `;
            } else {
                html += `
                    <div class="match-red">
                        <span>${match[0]}</span>
                        <span style="color:#ff1744;">pasa a siguiente ronda</span>
                        <input type="text" class="input-ganador" value="${match[0]}" readonly style="margin-left:16px; border-radius:12px; border:1.5px solid #ff1744; padding:4px 10px; background:#181818; color:#fff;">
                    </div>
                `;
            }
        });
        html += `</div>`;
        html += `<button id="siguiente-fase" class="button-red" style="margin-top:24px;">Siguiente fase</button>`;
        resultContainer.innerHTML = html;

        document.getElementById('siguiente-fase').onclick = () => {
            const inputs = Array.from(document.querySelectorAll('.input-ganador'));
            let ganadores = [];
            inputs.forEach((input, i) => {
                let val = input.value.trim();
                if (val) ganadores.push(val);
            });
            if (ganadores.length < Math.ceil(fase.length / 1)) {
                alert('Debes ingresar el ganador de cada enfrentamiento.');
                return;
            }
            ganadoresPrevios = ganadores; // Guardar ganadores para regenerar correctamente
            if (ganadores.length === 1) {
                resultContainer.innerHTML = `<div class="fase-torneo"><h3 style="color:#fff;">¡Ganador del Torneo!</h3>
                    <div class="match-red" style="font-size:1.3em;text-align:center;">🏆 <b>${ganadores[0]}</b> 🏆</div>
                </div>`;
            } else {
                ronda++;
                mostrarFase(ganadores);
            }
        };
    }

    function getNombreFase(num, ronda) {
        if (num >= 16) return ['Octavos', 'Cuartos', 'Semifinal', 'Final'][ronda - 1] || `Ronda ${ronda}`;
        if (num >= 8) return ['Cuartos', 'Semifinal', 'Final'][ronda - 1] || `Ronda ${ronda}`;
        if (num >= 4) return ['Semifinal', 'Final'][ronda - 1] || `Ronda ${ronda}`;
        if (num === 2) return 'Final';
        return `Ronda ${ronda}`;
    }

    // Empareja y si hay impar, uno pasa de ronda (bye)
    function emparejarConBye(arr) {
        let res = [];
        let temp = [...arr];
        if (temp.length % 2 !== 0) {
            shuffleArray(temp);
            res.push([temp.shift()]);
        }
        for (let i = 0; i < temp.length; i += 2) {
            res.push([temp[i], temp[i+1]]);
        }
        return res;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});