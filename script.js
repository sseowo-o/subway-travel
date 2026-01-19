document.addEventListener('DOMContentLoaded', () => {
    console.log("Game Initialized");

    // Updated data with specific terminal stations as requested
    const subwayData = [
        { name: "1호선", count: 102, color: "#0052A4", terminals: ["연천", "인천", "광명", "서동탄", "신창"] },
        { name: "2호선", count: 51, color: "#00A84D", terminals: ["시청", "신설동", "까치"] },
        { name: "3호선", count: 44, color: "#EF7C1C", terminals: ["대화", "오금"] },
        { name: "4호선", count: 48, color: "#00A5DE", terminals: ["진접", "오이도"] },
        { name: "5호선", count: 56, color: "#996CAC", terminals: ["방화", "하남검단산", "마천"] },
        { name: "6호선", count: 39, color: "#CD7C2F", terminals: ["응암", "신내"] },
        { name: "7호선", count: 53, color: "#747F00", terminals: ["장암", "석남"] },
        { name: "8호선", count: 18, color: "#E6186C", terminals: ["별내", "모란"] },
        { name: "9호선", count: 38, color: "#BDB092", terminals: ["개화", "중앙보훈병원"] },
        { name: "경의중앙선", count: 56, color: "#77C4A3", terminals: ["임진강", "서울역", "지평"] },
        { name: "경춘선", count: 24, color: "#0C8E72", terminals: ["청량리", "춘천", "광운대"] },
        { name: "수인분당선", count: 63, color: "#F5A200", terminals: ["청량리", "인천"] },
        { name: "신분당선", count: 16, color: "#D4003B", terminals: ["신사", "광교"] },
        { name: "공항철도", count: 14, color: "#0090D2", terminals: ["서울역", "인천공항2터미널"] },
        { name: "의정부경전철", count: 16, color: "#FD8100", terminals: ["발곡", "탑석"] },
        { name: "에버라인", count: 15, color: "#509F22", terminals: ["기흥", "전대·에버랜드"] },
        { name: "경강선", count: 11, color: "#003DA5", terminals: ["판교", "여주"] },
        { name: "서해선", count: 17, color: "#81A914", terminals: ["일산", "원시"] },
        { name: "우이신설선", count: 13, color: "#B0CE18", terminals: ["북한산우이", "신설동"] },
        { name: "신림선", count: 11, color: "#6789CA", terminals: ["샛강", "관악산"] },
        { name: "인천1", count: 33, color: "#7CA8D5", terminals: ["검단호수공원", "송도달빛축제공원"] },
        { name: "인천2", count: 27, color: "#ED8B00", terminals: ["검단오류", "운연"] },
    ];

    const elements = {
        lineResult: document.getElementById('line-result'),
        stationResult: document.getElementById('station-result'),
        directionResult: document.getElementById('direction-result'),
        spinBtn: document.getElementById('spin-btn'),
        cards: {
            line: document.getElementById('line-card'),
            station: document.getElementById('station-card'),
            direction: document.getElementById('direction-card')
        }
    };

    if (!elements.spinBtn) {
        console.error("Critical Error: Spin button not found.");
        return;
    }

    let isSpinning = false;

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Effect similar to slot machine text change
    async function shuffleText(element, options = []) {
        if (!element) return;
        const duration = 500;
        const interval = 50;
        const steps = duration / interval;

        for (let i = 0; i < steps; i++) {
            if (options.length > 0) {
                element.textContent = options[Math.floor(Math.random() * options.length)];
            } else {
                element.textContent = Math.floor(Math.random() * 100);
            }
            await delay(interval);
        }
    }

    async function spin() {
        if (isSpinning) return;

        try {
            isSpinning = true;
            elements.spinBtn.disabled = true;
            elements.spinBtn.style.opacity = '0.5';

            // Reset visual state
            Object.values(elements.cards).forEach(card => {
                if (card) {
                    card.classList.remove('active');
                    const val = card.querySelector('.value');
                    if (val) val.style.color = '';
                }
            });

            document.documentElement.style.setProperty('--accent', '#00f2ff');

            // Reset Map
            if (elements.spinBtn.nextElementSibling) {
                // simple check or just verify map exists
            }

            // 1. Pick Line
            const lineIndex = Math.floor(Math.random() * subwayData.length);
            const selectedLine = subwayData[lineIndex];

            // Shuffle effect for Line
            await shuffleText(elements.lineResult, subwayData.map(d => d.name));
            if (elements.lineResult) elements.lineResult.textContent = selectedLine.name;

            // Apply line theme
            document.documentElement.style.setProperty('--accent', selectedLine.color);
            if (elements.cards.line) elements.cards.line.classList.add('active');

            // 2. Determine Terminal (Direction/Start)
            const terminals = selectedLine.terminals;
            const termIndex = Math.floor(Math.random() * terminals.length);
            const selectedTerminal = terminals[termIndex];

            // Check if we have station data for this line
            const hasStationData = typeof stationLists !== 'undefined' && stationLists[selectedLine.name];
            let stationList = hasStationData ? stationLists[selectedLine.name] : null;

            // Determine "Start Station" Logic
            // If the terminal is in our list, we use it as the index.
            // If not (e.g. branch line not fully mapped), we fall back to generic 1..N
            let startIndex = 0;
            let direction = 1; // 1 (forward) or -1 (backward)

            if (stationList) {
                const foundIndex = stationList.indexOf(selectedTerminal);
                if (foundIndex !== -1) {
                    startIndex = foundIndex;
                    // Decide direction based on where we are.
                    // If at end (last index), go back.
                    // If at start (0), go forward.
                    // If in middle, randomness? Or check "Terminals" semantic? 
                    // Usually "Incheon Departure" means "To Yeoncheon".
                    // "Yeoncheon Departure" means "To Incheon".
                    // Let's assume if index is closer to end than start, we go backward.
                    if (startIndex > stationList.length / 2) {
                        direction = -1;
                    }
                    // Special case for Line 2 (Loop)
                    // If loop, we can go either way?
                    // Let's stick to simple logic: go towards the bulk of the line.
                } else {
                    // Terminal name mismatch (e.g. 'Seodongtan' not in my main list)
                    // Fallback to random start in the list?? Or just 0.
                    // Let's just use 0 (Start of list) if not found.
                    // But label will be mismatch.
                    // If we have data but terminal mismatch, maybe pick a random station as start?
                    startIndex = 0;
                }
            }

            // 3. Render Map
            // Pass stationList if available to label intermediate nodes?
            // Actually renderMap takes (color, count, startLabel).
            // We can enhance renderMap later.
            renderMap(selectedLine.color, selectedLine.count, selectedTerminal);

            // 4. Pick Station Count
            // Shuffle station result
            await shuffleText(elements.stationResult);

            // Logic for count: 
            // If we have data, we pick a valid index reach.
            let stationNum;
            let targetStationName = "";
            let targetIndexInList = -1;

            if (stationList) {
                // Determine max safe distance.
                // If direction is 1 (forward), max stops = length - 1 - startIndex.
                // If direction is -1 (backward), max stops = startIndex.
                let maxStops = direction === 1 ? (stationList.length - 1 - startIndex) : startIndex;
                if (maxStops < 1) {
                    // Start is at end and direction is wrong? flip it.
                    direction *= -1;
                    maxStops = direction === 1 ? (stationList.length - 1 - startIndex) : startIndex;
                }

                // Pick random count between 1 and min(maxStops, selectedLine.count)
                // selectedLine.count is just general line length stats. 
                // We should rely on maxStops if available.
                const limit = Math.max(1, Math.min(maxStops, selectedLine.count));
                stationNum = getRandomInt(1, limit);

                targetIndexInList = startIndex + (stationNum * direction);
                targetStationName = stationList[targetIndexInList];

                // Update text
                // "N번째 역 (StationName)"
                if (elements.stationResult) elements.stationResult.textContent = `${stationNum}정거장 이동`;
            } else {
                stationNum = getRandomInt(1, selectedLine.count);
                if (elements.stationResult) elements.stationResult.textContent = `${stationNum}번째 역`;
            }

            if (elements.cards.station) elements.cards.station.classList.add('active');

            // 5. Display Direction
            await shuffleText(elements.directionResult, terminals);
            const displayText = selectedTerminal.includes("순환") ? selectedTerminal : `${selectedTerminal} 출발`;

            if (elements.directionResult) elements.directionResult.textContent = displayText;
            if (elements.cards.direction) elements.cards.direction.classList.add('active');

            // 6. Animate Map
            // If we have a target station name, pass it to animateMovement
            await animateMovement(stationNum, targetStationName);

        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            isSpinning = false;
            elements.spinBtn.disabled = false;
            elements.spinBtn.style.opacity = '1';
        }
    }

    elements.spinBtn.addEventListener('click', spin);

    const mapElements = {
        track: document.getElementById('map-track'),
        token: document.getElementById('player-token'),
        container: document.getElementById('map-scroll-container')
    };

    function renderMap(lineColor, totalStations, startTerminal) {
        if (!mapElements.track) return;

        mapElements.track.innerHTML = '';
        // Create nodes
        // If totalStations is too large, we might want to cap it visually, 
        // but for "Blue Marble" feel, seeing many nodes is okay.
        // Let's create at least enough to cover the count + buffer.
        // Actually, let's just create 'totalStations' nodes or a fixed large number if 'count' is small.
        // For the game logic, we only need to move up to the result count.
        // But to make it look like a line, we need more than just the destination.

        // Let's create nodes equal to the max count of that line + 5 just in case
        const renderCount = Math.max(totalStations, 20);

        for (let i = 0; i < renderCount; i++) {
            const node = document.createElement('div');
            node.className = 'station-node';

            // Add label to every node for visibility
            const label = document.createElement('div');
            label.className = 'station-label';

            if (i === 0) {
                node.classList.add('start-node');
                label.textContent = startTerminal;
                // Add specific class for start label if needed, but shared style checks start-node parent
            } else {
                // Number logic
                label.textContent = i;
                label.classList.add('count-label');
            }

            node.appendChild(label);
            mapElements.track.appendChild(node);
        }

        // Reset token
        if (mapElements.token) {
            mapElements.token.textContent = "You";
            mapElements.token.style.left = '0px'; // positions are relative to track, but track is flex.
            // Actually, token needs to be absolute relative to track or container? 
            // In CSS I put token inside map-scroll-container, but track is also inside.
            // Better to put token current visual position based on the node position.

            // To animate nicely, we need to know where the nodes are.
            // Let's wait for DOM update.
        }
    }

    async function animateMovement(targetIndex, targetName = null) {
        if (!mapElements.track || !mapElements.token) return;

        const nodes = mapElements.track.querySelectorAll('.station-node');
        if (nodes.length <= targetIndex) return;

        // Reset token position to start node
        const startNode = nodes[0];
        // ... (calc code simplified or rely on existing layout) ...
        // We re-query the positions in the loop, so no need to heavy init here except reset.

        let currentLeft = startNode.offsetLeft + (startNode.offsetWidth / 2);
        mapElements.token.style.left = `${currentLeft}px`;

        // Movement loop
        for (let i = 1; i <= targetIndex; i++) {
            await delay(200); // Faster hop as requested

            const nextNode = nodes[i];
            nodes[i - 1].classList.add('active'); // set previous active

            currentLeft = nextNode.offsetLeft + (nextNode.offsetWidth / 2);
            mapElements.token.style.left = `${currentLeft}px`;

            const scrollLeft = currentLeft - (mapElements.container.offsetWidth / 2);
            mapElements.container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }

        // Final state
        await delay(500);
        nodes[targetIndex].classList.add('target-node');
        nodes[targetIndex].classList.add('active');

        // Display Target Name if available
        const arriveText = "도착!";
        const nameText = targetName || "";

        // HTML structure for separate styling
        const labelHtml = `<span class="arrive-tag">${arriveText}</span><span class="station-name-tag">${nameText}</span>`;

        const targetLabel = nodes[targetIndex].querySelector('.station-label');
        if (targetLabel) {
            targetLabel.innerHTML = labelHtml;
            targetLabel.classList.remove('count-label');
            // Remove hardcoded whitespace style if it conflicts
            targetLabel.style.whiteSpace = '';
        } else {
            const label = document.createElement('div');
            label.className = 'station-label';
            label.innerHTML = labelHtml;
            nodes[targetIndex].appendChild(label);
        }
    }

    // Hook into existing spin function
    // We need to inject the call. Since I am replacing the event listener line, 
    // I can just replace the 'spin' function or specific parts. 
    // But 'spin' is inside the DOMContentLoaded scope.
    // I will replace the end of the file to include these functions and overwrite `spin` logic if I can find a way to inject.
    // Actually, I can just redefine `spin` variable if it was let/var, but it's function dec.
    // Easier to just replace the whole 'spin' function logic or append these helpers and call them from a modified spin.

    // I will modify the `spin` function in the previous `replace_file_content` if possible?
    // No, I should use `replace_file_content` to replace the `spin` function body.
});
