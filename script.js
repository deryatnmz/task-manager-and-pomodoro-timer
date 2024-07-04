let timerInterval;
let isWorkTime = true;
let schedule = [];
let currentSessionIndex = 0;
let totalTime;  // Holds remaining time for current session or break
let originalTime;  // Holds the original time of the session or break
let isPaused = false; // Flag to check if the timer is paused
const colors = ["#FF6347", "#4682B4", "#32CD32", "#FFD700", "#FF69B4"]; // Example colors for sessions
const breakColor = "#87CEFA"; // Soft color for all breaks

function updateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('date').textContent = dateString;

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').textContent = timeString;
}

function startTimer() {
    if (currentSessionIndex >= schedule.length) {
        alert("All sessions completed!");
        return;
    }

    const currentSession = schedule[currentSessionIndex];
    const workTime = currentSession.workTime * 60;
    const breakTime = currentSession.breakTime * 60;
    
    if (!isPaused) {
        totalTime = isWorkTime ? workTime : breakTime;
        originalTime = totalTime;
    } else {
        isPaused = false;
    }

    const sessionElement = document.querySelector(`.schedule-item[data-index="${currentSessionIndex}"] .work-ring .progress-ring__circle`);
    const sessionTextElement = document.querySelector(`.schedule-item[data-index="${currentSessionIndex}"] .work-ring .ring-text`);
    const breakElement = document.querySelector(`.schedule-item[data-index="${currentSessionIndex}"] .break-ring .progress-ring__circle`);
    const breakTextElement = document.querySelector(`.schedule-item[data-index="${currentSessionIndex}"] .break-ring .ring-text`);

    // Set timer display color
    document.getElementById('timer-display').style.color = isWorkTime ? currentSession.sessionColor : breakColor;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const minutes = Math.floor(totalTime / 60).toString().padStart(2, '0');
        const seconds = (totalTime % 60).toString().padStart(2, '0');
        document.getElementById('timer-display').textContent = `${minutes}:${seconds}`;
        totalTime--;

        // Update progress bar and text inside the appropriate ring
        const progress = ((originalTime - totalTime) / originalTime) * 100;
        if (isWorkTime) {
            updateCircleProgress(sessionElement, sessionTextElement, progress, minutes, seconds);
        } else {
            updateCircleProgress(breakElement, breakTextElement, progress, minutes, seconds);
        }

        if (totalTime < 0) {
            clearInterval(timerInterval);

            if (isWorkTime) {
                isWorkTime = false;
                addTree(currentSession.sessionColor, currentSession.workTime);
            } else {
                isWorkTime = true;
                currentSessionIndex++;
            }

            startTimer();
        }
    }, 1000);
}


function continueTimer() {
    if (isPaused) {
        const currentSession = schedule[currentSessionIndex];
        document.getElementById('timer-display').style.color = isWorkTime ? currentSession.sessionColor : breakColor;
        startTimer();
    }
}




function stopTimer() {
    clearInterval(timerInterval);
    isPaused = true;
}


function addSession() {
    const workTime = parseInt(document.getElementById('work-time').value);
    const breakTime = parseInt(document.getElementById('break-time').value);
    const sessionColor = colors[schedule.length % colors.length];

    schedule.push({ workTime, breakTime, sessionColor });
    appendNewSession(schedule.length - 1, { workTime, breakTime, sessionColor });
}


function displaySchedule() {
    const scheduleItems = document.getElementById('schedule-items');
    scheduleItems.innerHTML = '';

    schedule.forEach((session, index) => {
        appendNewSession(index, session);
    });
}

function appendNewSession(index, session) {
    const scheduleItems = document.getElementById('schedule-items');
    const item = document.createElement('div');
    item.className = 'schedule-item';
    item.setAttribute('data-index', index);

    const workRing = createCircularRing(session.sessionColor, `work-ring-${index}`, 'work-ring', session.workTime * 60);
    const breakRing = createCircularRing(breakColor, `break-ring-${index}`, 'break-ring', session.breakTime * 60);

    const content = document.createElement('div');
    content.className = 'schedule-item-content';
    content.textContent = ` Session ${index + 1} `;

    item.appendChild(workRing);
    item.appendChild(content);
    item.appendChild(breakRing);

    scheduleItems.appendChild(item);
}

function createCircularRing(color, id, ringClass, initialTime) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add('circular-ring', ringClass);
    svg.setAttribute('viewBox', '0 0 200 200'); // Increase the viewBox size

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.classList.add('progress-ring__circle');
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-width', '15'); // Thicker stroke width
    circle.setAttribute('fill', 'transparent');
    circle.setAttribute('r', '75'); // Larger radius
    circle.setAttribute('cx', '100'); // Center x-coordinate
    circle.setAttribute('cy', '100'); // Center y-coordinate
    circle.setAttribute('stroke-linecap', 'round'); // Smooth the ends of the stroke
    const circumference = 75 * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.classList.add('ring-text');
    text.setAttribute('x', '100'); // Center x-coordinate
    text.setAttribute('y', '105'); // Adjusted y-coordinate for better alignment
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dy', '.5em');
    const minutes = Math.floor(initialTime / 60).toString().padStart(2, '0');
    const seconds = (initialTime % 60).toString().padStart(2, '0');
    text.textContent = `${minutes}:${seconds}`;

    svg.appendChild(circle);
    svg.appendChild(text);
    return svg;
}

function updateCircleProgress(element, textElement, progress, minutes, seconds) {
    const radius = element.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    element.style.strokeDashoffset = offset;
    textElement.textContent = `${minutes}:${seconds}`;
}



function addTree(color, workTime) {
    const treesContainer = document.getElementById('trees');
    const tree = document.createElement('div');
    tree.className = 'tree';

    const leaves = document.createElement('div');
    leaves.className = 'leaves';
    leaves.style.width = `${50 + workTime * 2}px`; // Make size proportional to session time
    leaves.style.height = `${50 + workTime * 2}px`; // Make size proportional to session time
    leaves.style.backgroundColor = color;
    leaves.textContent = `${workTime}`;
    tree.appendChild(leaves);

    const trunk = document.createElement('div');
    trunk.className = 'trunk';
    tree.appendChild(trunk);

    treesContainer.appendChild(tree);
}

function addTodo() {
    const todoInput = document.getElementById('new-todo');
    const todoList = document.getElementById('todo-list');

    if (todoInput.value.trim() !== '') {
        const listItem = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        const label = document.createElement('label');
        label.textContent = todoInput.value;

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        todoList.appendChild(listItem);

        todoInput.value = '';
    }
}

document.getElementById('start-timer').addEventListener('click', startTimer);
document.getElementById('stop-timer').addEventListener('click', stopTimer);
document.getElementById('continue-timer').addEventListener('click', continueTimer);
document.getElementById('add-session').addEventListener('click', addSession);
document.getElementById('add-todo').addEventListener('click', addTodo);

setInterval(updateTime, 1000);
updateTime(); // Initial call to display time immediately
