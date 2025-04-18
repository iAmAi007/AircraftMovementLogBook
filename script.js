// Helper function to validate AIM input
function isValidAIMInput(input) {
    return /^\d{1,3}$/.test(input) && parseInt(input, 10) >= 1 && parseInt(input, 10) <= 999;
}

// Function to generate AIM numbers based on the starting value
function generateAIMNumbers(startValue) {
    const aimCells = document.querySelectorAll('.aim-cell:not(.header-cell)');
    let currentValue = parseInt(startValue, 10);

    if (isNaN(currentValue) || currentValue < 1 || currentValue > 999) {
        console.error('Invalid start value for AIM numbers.');
        return;
    }

    aimCells.forEach((cell, index) => {
        if (index === 0) {
            // Populate the first cell with the user-provided value
            cell.innerText = currentValue.toString().padStart(3, '0');
        } else {
            // Increment and populate the rest of the cells
            currentValue = (currentValue % 999) + 1; // Wrap around after 999
            cell.innerText = currentValue.toString().padStart(3, '0'); // Format as 3 digits
        }
    });
}

// Function to handle AIM cell input
function handleAIMInput(event) {
    const cell = event.target;
    const input = cell.innerText;

    if (!isValidAIMInput(input)) {
        cell.classList.add('invalid'); // Add a class for styling invalid input
    } else {
        cell.classList.remove('invalid');
    }
}

// Function to auto-format the AIM cell and generate numbers when the user finishes typing
function autoFormatAIM(event) {
    const cell = event.target;
    const input = cell.innerText;

    if (isValidAIMInput(input)) {
        const numericValue = parseInt(input, 10);
        cell.innerText = numericValue.toString().padStart(3, '0'); // Format as 3 digits
        generateAIMNumbers(numericValue); // Populate the rest of the AIM cells
    } else {
        // Do not clear the input if it's invalid; let the user correct it
        cell.classList.add('invalid'); // Add a class for styling invalid input
    }
}

// Function to handle Tab key press
function handleTabKey(event) {
    if (event.key === 'Tab') {
        const cell = event.target;
        setTimeout(() => {
            cell.blur(); // Trigger the blur event to format the input
        }, 0);
    }
}

// Add event listeners to AIM cells
document.querySelectorAll('.aim-cell').forEach((cell) => {
    cell.addEventListener('input', handleAIMInput); // Use 'input' event for real-time validation
    cell.addEventListener('blur', autoFormatAIM); // Use 'blur' event to auto-format when done typing
    cell.addEventListener('keydown', handleTabKey); // Handle Tab key press
});

// Function to enforce uppercase and ensure left-to-right typing
function enforceUppercase(event) {
    const cell = event.target;
    const originalText = cell.innerText;
    const cursorPosition = window.getSelection().getRangeAt(0).startOffset;

    cell.innerText = originalText.toUpperCase();

    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(cell.childNodes[0], cursorPosition);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

// Function to enforce numeric input for SKED, ATC, ETA, EET, ETA EDZ, EOBT, and ATD columns
function enforceNumericInput(event) {
    const cell = event.target;
    const originalText = cell.innerText;
    const cursorPosition = window.getSelection().getRangeAt(0).startOffset;

    const numericText = originalText.replace(/[^0-9]/g, '');
    cell.innerText = numericText;

    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(cell.childNodes[0], cursorPosition);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

// Function to enforce numeric input for POB and FR columns (positive numbers only)
function enforceNumericInputForPOBAndFR(event) {
    const cell = event.target;
    const originalText = cell.innerText;

    // Allow only positive numbers (digits 0-9)
    const numericText = originalText.replace(/[^0-9]/g, '');
    cell.innerText = numericText;

    // Move the cursor to the end of the input
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(cell);
    range.collapse(false); // Move cursor to the end
    selection.removeAllRanges();
    selection.addRange(range);
}

// Function to validate FROM and DEST columns (strictly four alphabets)
function validateFourAlphabets(event) {
    const cell = event.target;
    const input = cell.innerText.toUpperCase();

    if (input.length !== 4 || !/^[A-Z]{4}$/.test(input)) {
        cell.innerText = ''; // Clear invalid input
    }
}

// Function to validate SKED, ATC, ETA, EET, ETA EDZ, EOBT, and ATD columns
function validateFourNumeric(event) {
    const cell = event.target;

    // Skip validation for AIM, POB, and FR columns
    if (cell.classList.contains('aim-cell') || cell.classList.contains('pob-cell') || cell.classList.contains('fr-cell')) {
        return;
    }

    const input = cell.innerText;

    // Ensure the input is exactly 4 digits
    if (input.length !== 4 || !/^\d{4}$/.test(input)) {
        cell.innerText = ''; // Clear invalid input
        return;
    }

    // Split the input into hours and minutes
    const hours = parseInt(input.substring(0, 2), 10);
    const minutes = parseInt(input.substring(2, 4), 10);

    // Validate hours (00-23) and minutes (00-59)
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        cell.innerText = ''; // Clear invalid input
    }
}

// Function to add rows
function addRows() {
    const tables = document.querySelectorAll('.table-container > div'); // Select the table containers

    tables.forEach(tableContainer => {
        const addRowButton = document.createElement('button');
        addRowButton.innerText = '+';
        addRowButton.style.cursor = 'pointer';
        addRowButton.style.marginTop = '10px';
        addRowButton.style.marginBottom = '20px'; // Add some space below the button
        tableContainer.appendChild(addRowButton); // Add the button to the table container

        addRowButton.addEventListener('click', () => {
            const table = tableContainer.querySelector('table');
            const tbody = table.querySelector('tbody');

            // Find the last AIM value in the table
            const aimCells = table.querySelectorAll('.aim-cell:not(.header-cell)');
            let lastAIMValue = 0;

            if (aimCells.length > 0) {
                const lastAIMCell = aimCells[aimCells.length - 1];
                lastAIMValue = parseInt(lastAIMCell.innerText, 10) || 0;
            }

            for (let i = 0; i < 5; i++) { // Append 5 rows
                const newRow = tbody.insertRow();

                for (let j = 0; j < tbody.rows[0].cells.length; j++) {
                    const newCell = newRow.insertCell();
                    newCell.contentEditable = true;

                    if (tbody.rows[0].cells[j].classList.contains('aim-cell')) {
                        newCell.classList.add('aim-cell');
                        newCell.addEventListener('input', handleAIMInput);
                        newCell.addEventListener('blur', autoFormatAIM);

                        // Assign the next AIM number
                        lastAIMValue = (lastAIMValue % 999) + 1; // Wrap around after 999
                        newCell.innerText = lastAIMValue.toString().padStart(3, '0');
                    } else if (tbody.rows[0].cells[j].classList.contains('pob-cell') || tbody.rows[0].cells[j].classList.contains('fr-cell')) {
                        newCell.classList.add(tbody.rows[0].cells[j].classList.contains('pob-cell') ? 'pob-cell' : 'fr-cell');
                        newCell.addEventListener('input', enforceNumericInputForPOBAndFR);
                    } else if (tbody.rows[0].cells[j].getAttribute('inputmode') === 'numeric') {
                        newCell.setAttribute('inputmode', 'numeric');
                        newCell.addEventListener('input', enforceNumericInput);
                    } else {
                        newCell.addEventListener('input', enforceUppercase);
                    }

                    // Apply faded autocomplete to new cells
                    createFadedAutocomplete(newCell);
                }
            }
        });
    });
}



// Function to set the current date and time
function setCurrentDate() {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    const dateInbound = document.getElementById('date-inbound');
    const dateOutbound = document.getElementById('date-outbound');

    dateInbound.value = formattedDate;
    dateOutbound.value = formattedDate;

    const dayInbound = document.getElementById('day-inbound');
    const dayOutbound = document.getElementById('day-outbound');

    const dayOfWeek = getDayOfWeek(currentDate);
    dayInbound.value = dayOfWeek;
    dayOutbound.value = dayOfWeek;
}

// Function to get the day of the week from a date
function getDayOfWeek(date) {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return days[date.getDay()];
}

// Function to synchronize DAY and DATE inputs
function synchronizeInputs() {
    const dayInbound = document.getElementById('day-inbound');
    const dayOutbound = document.getElementById('day-outbound');
    const dateInbound = document.getElementById('date-inbound');
    const dateOutbound = document.getElementById('date-outbound');

    // Synchronize DAY inputs
    dayInbound.addEventListener('change', () => {
        dayOutbound.value = dayInbound.value;
    });
    dayOutbound.addEventListener('change', () => {
        dayInbound.value = dayOutbound.value;
    });

    // Synchronize DATE inputs and update DAY dropdown
    dateInbound.addEventListener('change', () => {
        const selectedDate = new Date(dateInbound.value);
        dateOutbound.value = dateInbound.value;
        const dayOfWeek = getDayOfWeek(selectedDate);
        dayInbound.value = dayOfWeek;
        dayOutbound.value = dayOfWeek;
    });
    dateOutbound.addEventListener('change', () => {
        const selectedDate = new Date(dateOutbound.value);
        dateInbound.value = dateOutbound.value;
        const dayOfWeek = getDayOfWeek(selectedDate);
        dayInbound.value = dayOfWeek;
        dayOutbound.value = dayOfWeek;
    });
}

// Add event listeners to all editable cells (excluding POB and FR)
document.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
    if (!cell.classList.contains('pob-cell') && !cell.classList.contains('fr-cell')) {
        cell.addEventListener('input', enforceUppercase);
    }
});

// Add event listeners to numeric cells (excluding POB and FR)
document.querySelectorAll('td[inputmode="numeric"]').forEach(cell => {
    if (!cell.classList.contains('pob-cell') && !cell.classList.contains('fr-cell')) {
        cell.addEventListener('input', enforceNumericInput);
    }
});

// Add event listeners to POB and FR cells
document.querySelectorAll('.pob-cell, .fr-cell').forEach(cell => {
    cell.addEventListener('input', enforceNumericInputForPOBAndFR);
});

// Add event listeners to FROM and DEST cells
document.querySelectorAll('.from-cell, .dest-cell').forEach(cell => {
    cell.addEventListener('blur', validateFourAlphabets);
});

// Add event listeners to SKED, ATC, ETA, EET, ETA EDZ, EOBT, and ATD cells (excluding POB and FR)
document.querySelectorAll('td[inputmode="numeric"]').forEach(cell => {
    if (!cell.classList.contains('pob-cell') && !cell.classList.contains('fr-cell')) {
        cell.addEventListener('blur', validateFourNumeric);
    }
});

// Add rows functionality
addRows();

// Set the current date and time on page load
setCurrentDate();

// Synchronize DAY and DATE inputs on page load
synchronizeInputs();

// Register the Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
        .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
            console.error("Service Worker registration failed:", error);
        });
}

// Function to save the HTML content to a file
function saveHTML() {
    // Remove the + icons before saving
    const addRowButtons = document.querySelectorAll('.table-container > div > button');
    addRowButtons.forEach(button => button.remove());

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/ /g, '_').toUpperCase();

    const filename = `${formattedDate}_index.html`; // Filename based on the current date
    const htmlContent = document.documentElement.outerHTML;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // Always use the same filename for the current date
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Re-add the + icons after saving
    addRows();
}

// Add event listener to the save button
document.getElementById('saveButton').addEventListener('click', saveHTML);
    
const predefinedData = {
    SVC: [
        "ATC405", "ATC401", "07", "05","02","08","01","ATC111", "ATC201", "ATC113", "ATC109", "ATC117", "ATC157", "ATC133", "ATC219", 
        "ATC209", "ATC215", "ATC213", "ATC137", "ATC119", "ATC107", "ATC203", "ATC125", "ATC103", "KQA488", 
        "THY603", "ETh827", "KQA482", "QTR1499", "ETH805", "AZB504", "LAM460", "AZW438", "OTRI476", "UAE725", 
        "LNK032", "KQA484", "OMA705", "RWD442", "FDB1687", "UGD320", "ETH803", "KQA486", "MWI042", "KLM571",
        "ATC110/1", "ATC200", "ATC112/3", "ATC108/9", "ATC116/7", "ATC157", "ATC132/3", "ATC218/9", "ATC208", "ATC214/5", "ATC213", "ATC136/7", "ATC118/9", "ATC156", "ATC106/7", "ATC202", "ATC404", "ATC400", "АТС124/5", "ATC102/3", "PRF717/8", "PRF400/1", "PRF713/2", "PRF420/1", "PRF416/7", "PRF642", "PRF612/3", "PRF422/3", "PRF721/0"
    ],
    REG: [
        "5HKKC", "5HCGZ", "5HMXY", "5HAAA", "5HAAC", "5HAAE", "5HAAF", "5HAAG", "5HFLS", "5HFOX", "5HFZA", "5HGAS", "5HGEN", "5HGUS", "5HHEL", "5HIHN", "5HIKA", "5HIKI", "5HJAM", "5HAAU", "5HJOE", "5HAAJ", "5HAAK", "5HAAL", "5HAAN", "5HAAH", "5HAAP", "5HAAQ", "5HABC", "5HAIR", "5HAJK", "5HALO", "5HAMH", "5HAMI", "5HARD", "5HATP", "5HBAT", "5HBEE", "5HBIG", "5HBTZ", "5HBYO", "5HCCT", "5HCFA", "5HCPT", "5HCTJ", "5HDJS", "5HDTS", "5HEWA", "5HEXP", "5HFAR", "5HMYM", "5HZRP", "5HZOE", "5HKEG", "5HKJS", "5HZOG", "5HLEO", "5HLUV", "5HZAI", "5HYES", "5HMAD", "5HMEA", "5HMEB", "5HMEC", "5HMED", "5HMEE", "5HMEF", "5HMEK", "5HMFH", "5HWKF", "5HMIK", "5HMPK", "5HTZC", "5HTWF", "5HTPK", "5HMSO", "5HTPC", "5HTGF", "5HTEC", "5HTCJ", "5HTCH", "5HKIH", "5HTCF", "5HTCP", "5HTCR", "5HTCI", "5HTCE", "5HTCK", "5HTCD", "5HTCB", "5HTCO", "5HTCM", "5HTAQ", "5HTAM", "5HSTJ", "5HSPC", "5HMWA", "5HSPA", "5HSGR", "5HMXG", "5HPWG", "5HPWE", "5HPWD", "5HPWC", "5HPWB", "5HMWF", "5HPOP", "5HPOA", "5HOIL", "5HMZU", "5HMZT", "5HMZD", "5HMZC", "5HMYK", "5HMYJ", "5HMYI", "5HMYH", "5HMYG", "5HTCL", "5HLCL", "5HELI", "5HLPD", "5HMEI", "5HLAB", "5HMYO", "5HMYP", "5HMYR", "5HMYQ", "5HMYN", "5HAAV", "5HMYS", "5HMHN", "5HUNT", "5HNIT", "5HNIA", "5HSPD", "5HOYO", "5HTFM", "5HSPE", "5HMEM", "5HMEH", "5HMEL", "5HTFB", "5HTFA", "5HAAX", "5HTCQ", "5HVAN", "5HMZE", "5HFLA", "5HFLB", "5HMYT", "5HTFG", "5HBLN", "5HHAD", "5HNAR", "5HKMA", "5HLUA", "5HMEP", "5HMEO", "5HSRA", "5HMYY", "5HPTJ", "5HMYU", "5HGEO", "5HMZR", "5HAZH", "5HULR", "5HIGH", "5HMEN", "5HMEJ", "5HLVV", "5HUSU", "5HCDL", "5HBIL", "TC", "ET", "A7", "C9", "Z", "A6", "ZS", "A4O", "9XR", "A6", "5Y", "PH", "5X"
    ],
    TYPE: [
        "B39M", "B788", "BCS3", "DH8D", "E145", "B737", "E120", "A330", "CRJ9", "E145", "B773", 
        "E190", "DH8D", "B38M", "AT45", "B77W", "PC12", "DH8A", "DH8B", "C172", "C206", "B789", "AT75", "C208", "F406", "F50", "AS32"
    ],
    FROM: [
        "OMDB", "VABB", "HTMW", "HKJK", "HTIR", "HTDO", "HTDA", "HTGW", "HTZA", "HTSO", "HTKA", 
        "FAOR", "HTKJ", "FZQA", "LTFM", "HAAB", "PQPB", "FVRG", "OTHH", "HRYR", "HUEN", 
        "FWCL", "FLSK", "HTMT", "OOMS", "HTAR", "EHAM", "HTAI", "HTAL", "HTAR", "HTAS", "HTBA", "HTBB", "HTBE", "HTBF", "HTBG", "HTBH", "HTBJ", "HTBM", "HTBN", "HTBO", "HTBS", "HTBT", "HTBU", "HTBV", "HTBX", "HTBY", "HTCF", "HTCH", "HTCM", "HTCV", "HTDA", "HTDB", "HTDG", "HTDK", "HTDN", "HTDO", "HTDU", "HTDY", "HTEB", "HTEE", "HTEJ", "HTEN", "HTEQ", "HTER", "HTES", "HTEY", "HTFE", "HTFI", "HTFR", "HTGA", "HTGE", "HTGL", "HTGM", "HTGO", "HTGP", "HTGR", "HTGS", "HTGT", "HTGU", "HTGV", "HTGW", "HTGZ", "HTHB", "HTHG", "HTHI", "HTHM", "HTHR", "HTHS", "HTHY", "HTIA", "HTIF", "HTIH", "HTIK", "HTIL", "HTIR", "HTIW", "HTIY", "HTJN", "HTJO", "HTJR", "HTKA", "HTKB", "HTKC", "HTKD", "HTKE", "HTKF", "HTKG", "HTKH", "HTKI", "HTKJ", "HTKL", "HTKM", "HTKN", "HTKO", "HTKP", "HTKR", "HTKS", "HTKT", "HTKU", "HTKX", "HTLA", "HTLB", "HTLD", "HTLE", "HTLI", "HTLJ", "HTLK", "HTLL", "HTLM", "HTLN", "HTLO", "HTLP", "HTLR", "HTLS", "HTLT", "HTLU", "HTLV", "HTLW", "HTLY", "HTMA", "HTMD", "HTME", "HTMF", "HTMG", "HTMH", "HTMI", "HTMJ", "HTMK", "HTML", "HTMM", "HTMN", "HTMO", "HTMP", "HTMR", "HTMS", "HTMT", "HTMU", "HTMV", "HTMW", "HTMX", "HTMY", "HTNA", "HTNB", "HTND", "HTNF", "HTNG", "HTNH", "HTNJ", "HTNK", "HTNM", "HTNN", "HTNO", "HTNR", "HTNW", "HTNY", "HTNZ", "HTOM", "HTON", "HTOP", "HTOR", "HTOZ", "HTPD", "HTPE", "HTPP", "HTPT", "HTPW", "HTRA", "HTRB", "HTRE", "HTRG", "HTRL", "HTRN", "HTRS", "HTRU", "HTRX", "HTRZ", "HTSA", "HTSB", "HTSD", "HTSE", "HTSG", "HTSH", "HTSI", "HTSJ", "HTSK", "HTSL", "HTSM", "HTSN", "HTSO", "HTSS", "HTST", "HTSU", "HTSW", "HTSY", "HTTA", "HTTB", "HTTC", "HTTE", "HTTF", "HTTG", "HTTJ", "HTTL", "HTTN", "HTTO", "HTTR", "HTTS", "HTTU", "HTTV", "HTTX", "HTTY", "HTTZ", "HTUC", "HTUF", "HTUG", "HTUK", "HTUN", "HTUO", "HTUP", "HTUR", "HTUS", "HTUT", "HTUU", "HTUV", "HTUW", "HTUZ", "HTVR", "HTWA", "HTWB", "HTWH", "HTWI", "HTWK", "HTWS", "HTYA", "HTYE", "HTYO", "HTYW", "HTYY", "HTZA", "HTZI", "HTZW"
    ],
    'ADDRESSEE’S': [
        "DEP/HTAI", "DEP/HTAL", "DEP/HTAR", "DEP/HTAS", "DEP/HTBA", "DEP/HTBB", "DEP/HTBE", "DEP/HTBF", "DEP/HTBG", "DEP/HTBH", "DEP/HTBJ", "DEP/HTBM", "DEP/HTBN", "DEP/HTBO", "DEP/HTBS", "DEP/HTBT", "DEP/HTBU", "DEP/HTBV", "DEP/HTBX", "DEP/HTBY", "DEP/HTCF", "DEP/HTCH", "DEP/HTCM", "DEP/HTCV", "DEP/HTDA", "DEP/HTDB", "DEP/HTDG", "DEP/HTDK", "DEP/HTDN", "DEP/HTDO", "DEP/HTDU", "DEP/HTDY", "DEP/HTEB", "DEP/HTEE", "DEP/HTEJ", "DEP/HTEN", "DEP/HTEQ", "DEP/HTER", "DEP/HTES", "DEP/HTEY", "DEP/HTFE", "DEP/HTFI", "DEP/HTFR", "DEP/HTGA", "DEP/HTGE", "DEP/HTGL", "DEP/HTGM", "DEP/HTGO", "DEP/HTGP", "DEP/HTGR", "DEP/HTGS", "DEP/HTGT", "DEP/HTGU", "DEP/HTGV", "DEP/HTGW", "DEP/HTGZ", "DEP/HTHB", "DEP/HTHG", "DEP/HTHI", "DEP/HTHM", "DEP/HTHR", "DEP/HTHS", "DEP/HTHY", "DEP/HTIA", "DEP/HTIF", "DEP/HTIH", "DEP/HTIK", "DEP/HTIL", "DEP/HTIR", "DEP/HTIW", "DEP/HTIY", "DEP/HTJN", "DEP/HTJO", "DEP/HTJR", "DEP/HTKA", "DEP/HTKB", "DEP/HTKC", "DEP/HTKD", "DEP/HTKE", "DEP/HTKF", "DEP/HTKG", "DEP/HTKH", "DEP/HTKI", "DEP/HTKJ", "DEP/HTKL", "DEP/HTKM", "DEP/HTKN", "DEP/HTKO", "DEP/HTKP", "DEP/HTKR", "DEP/HTKS", "DEP/HTKT", "DEP/HTKU", "DEP/HTKX", "DEP/HTLA", "DEP/HTLB", "DEP/HTLD", "DEP/HTLE", "DEP/HTLI", "DEP/HTLJ", "DEP/HTLK", "DEP/HTLL", "DEP/HTLM", "DEP/HTLN", "DEP/HTLO", "DEP/HTLP", "DEP/HTLR", "DEP/HTLS", "DEP/HTLT", "DEP/HTLU", "DEP/HTLV", "DEP/HTLW", "DEP/HTLY", "DEP/HTMA", "DEP/HTMD", "DEP/HTME", "DEP/HTMF", "DEP/HTMG", "DEP/HTMH", "DEP/HTMI", "DEP/HTMJ", "DEP/HTMK", "DEP/HTML", "DEP/HTMM", "DEP/HTMN", "DEP/HTMO", "DEP/HTMP", "DEP/HTMR", "DEP/HTMS", "DEP/HTMT", "DEP/HTMU", "DEP/HTMV", "DEP/HTMW", "DEP/HTMX", "DEP/HTMY", "DEP/HTNA", "DEP/HTNB", "DEP/HTND", "DEP/HTNF", "DEP/HTNG", "DEP/HTNH", "DEP/HTNJ", "DEP/HTNK", "DEP/HTNM", "DEP/HTNN", "DEP/HTNO", "DEP/HTNR", "DEP/HTNW", "DEP/HTNY", "DEP/HTNZ", "DEP/HTOM", "DEP/HTON", "DEP/HTOP", "DEP/HTOR", "DEP/HTOZ", "DEP/HTPD", "DEP/HTPE", "DEP/HTPP", "DEP/HTPT", "DEP/HTPW", "DEP/HTRA", "DEP/HTRB", "DEP/HTRE", "DEP/HTRG", "DEP/HTRL", "DEP/HTRN", "DEP/HTRS", "DEP/HTRU", "DEP/HTRX", "DEP/HTRZ", "DEP/HTSA", "DEP/HTSB", "DEP/HTSD", "DEP/HTSE", "DEP/HTSG", "DEP/HTSH", "DEP/HTSI", "DEP/HTSJ", "DEP/HTSK", "DEP/HTSL", "DEP/HTSM", "DEP/HTSN", "DEP/HTSO", "DEP/HTSS", "DEP/HTST", "DEP/HTSU", "DEP/HTSW", "DEP/HTSY", "DEP/HTTA", "DEP/HTTB", "DEP/HTTC", "DEP/HTTE", "DEP/HTTF", "DEP/HTTG", "DEP/HTTJ", "DEP/HTTL", "DEP/HTTN", "DEP/HTTO", "DEP/HTTR", "DEP/HTTS", "DEP/HTTU", "DEP/HTTV", "DEP/HTTX", "DEP/HTTY", "DEP/HTTZ", "DEP/HTUC", "DEP/HTUF", "DEP/HTUG", "DEP/HTUK", "DEP/HTUN", "DEP/HTUO", "DEP/HTUP", "DEP/HTUR", "DEP/HTUS", "DEP/HTUT", "DEP/HTUU", "DEP/HTUV", "DEP/HTUW", "DEP/HTUZ", "DEP/HTVR", "DEP/HTWA", "DEP/HTWB", "DEP/HTWH", "DEP/HTWI", "DEP/HTWK", "DEP/HTWS", "DEP/HTYA", "DEP/HTYE", "DEP/HTYO", "DEP/HTYW", "DEP/HTYY", "DEP/HTZA", "DEP/HTZI", "DEP/HTZW"
    ],
    DEST: [
        "OMDB", "VABB", "HTMW", "HKJK", "HTIR", "HTDO", "HTDA", "HTGW", "HTZA", "HTSO", "HTKA", 
        "FAOR", "HTKJ", "FZQA", "LTFM", "HAAB", "PQPB", "FVRG", "OTHH", "HRYR", "HUEN", 
        "FWCL", "FLSK", "HTMT", "OOMS", "HTAR", "EHAM", "HTAI", "HTAL", "HTAR", "HTAS", "HTBA", "HTBB", "HTBE", "HTBF", "HTBG", "HTBH", "HTBJ", "HTBM", "HTBN", "HTBO", "HTBS", "HTBT", "HTBU", "HTBV", "HTBX", "HTBY", "HTCF", "HTCH", "HTCM", "HTCV", "HTDA", "HTDB", "HTDG", "HTDK", "HTDN", "HTDO", "HTDU", "HTDY", "HTEB", "HTEE", "HTEJ", "HTEN", "HTEQ", "HTER", "HTES", "HTEY", "HTFE", "HTFI", "HTFR", "HTGA", "HTGE", "HTGL", "HTGM", "HTGO", "HTGP", "HTGR", "HTGS", "HTGT", "HTGU", "HTGV", "HTGW", "HTGZ", "HTHB", "HTHG", "HTHI", "HTHM", "HTHR", "HTHS", "HTHY", "HTIA", "HTIF", "HTIH", "HTIK", "HTIL", "HTIR", "HTIW", "HTIY", "HTJN", "HTJO", "HTJR", "HTKA", "HTKB", "HTKC", "HTKD", "HTKE", "HTKF", "HTKG", "HTKH", "HTKI", "HTKJ", "HTKL", "HTKM", "HTKN", "HTKO", "HTKP", "HTKR", "HTKS", "HTKT", "HTKU", "HTKX", "HTLA", "HTLB", "HTLD", "HTLE", "HTLI", "HTLJ", "HTLK", "HTLL", "HTLM", "HTLN", "HTLO", "HTLP", "HTLR", "HTLS", "HTLT", "HTLU", "HTLV", "HTLW", "HTLY", "HTMA", "HTMD", "HTME", "HTMF", "HTMG", "HTMH", "HTMI", "HTMJ", "HTMK", "HTML", "HTMM", "HTMN", "HTMO", "HTMP", "HTMR", "HTMS", "HTMT", "HTMU", "HTMV", "HTMW", "HTMX", "HTMY", "HTNA", "HTNB", "HTND", "HTNF", "HTNG", "HTNH", "HTNJ", "HTNK", "HTNM", "HTNN", "HTNO", "HTNR", "HTNW", "HTNY", "HTNZ", "HTOM", "HTON", "HTOP", "HTOR", "HTOZ", "HTPD", "HTPE", "HTPP", "HTPT", "HTPW", "HTRA", "HTRB", "HTRE", "HTRG", "HTRL", "HTRN", "HTRS", "HTRU", "HTRX", "HTRZ", "HTSA", "HTSB", "HTSD", "HTSE", "HTSG", "HTSH", "HTSI", "HTSJ", "HTSK", "HTSL", "HTSM", "HTSN", "HTSO", "HTSS", "HTST", "HTSU", "HTSW", "HTSY", "HTTA", "HTTB", "HTTC", "HTTE", "HTTF", "HTTG", "HTTJ", "HTTL", "HTTN", "HTTO", "HTTR", "HTTS", "HTTU", "HTTV", "HTTX", "HTTY", "HTTZ", "HTUC", "HTUF", "HTUG", "HTUK", "HTUN", "HTUO", "HTUP", "HTUR", "HTUS", "HTUT", "HTUU", "HTUV", "HTUW", "HTUZ", "HTVR", "HTWA", "HTWB", "HTWH", "HTWI", "HTWK", "HTWS", "HTYA", "HTYE", "HTYO", "HTYW", "HTYY", "HTZA", "HTZI", "HTZW"
    ]
};

// Map column headers to their predefined data
const columnToDataMap = {
    'SVC': predefinedData.SVC,
    'REG': predefinedData.REG,
    'TYPE': predefinedData.TYPE,
    'FROM': predefinedData.FROM,
    'DEST': predefinedData.DEST,
    'ADDRESSEE’S': predefinedData['ADDRESSEE’S']
};

// Function to get the column header for a cell
function getColumnHeader(cell) {
    const table = cell.closest('table');
    const headerRow = table.querySelector('thead tr');
    const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
    return headerRow.children[cellIndex].innerText.trim();
}

// Function to create faded autocomplete
function createFadedAutocomplete(cell) {
    let suggestion = document.createElement('span');
    suggestion.className = 'faded-suggestion';
    cell.appendChild(suggestion);

    cell.addEventListener('input', function () {
        const input = cell.innerText.toUpperCase();
        suggestion.innerText = '';

        if (input.length > 0) {
            // Determine the column header
            const columnHeader = getColumnHeader(cell);
            const data = columnToDataMap[columnHeader] || [];

            // Find the first match that starts with the input
            const startsWithMatch = data.find(item => item.startsWith(input));

            // Find the first match that contains the input
            const containsMatch = data.find(item => item.includes(input));

            // Use the first match from either method
            const match = startsWithMatch || containsMatch;

            if (match) {
                // Show the remaining part of the suggestion
                suggestion.innerText = match.slice(input.length);
            }
        }
    });

    cell.addEventListener('keydown', function (event) {
        // Handle TAB and ENTER keys
        if (event.key === 'Tab' || event.key === 'Enter') {
            event.preventDefault(); // Prevent default Tab or Enter behavior

            // Only proceed if the cell is not empty
            if (cell.innerText.trim() !== '') {
                const input = cell.innerText.toUpperCase();

                // Determine the column header
                const columnHeader = getColumnHeader(cell);
                const data = columnToDataMap[columnHeader] || [];

                // Find the first match that starts with the input
                const startsWithMatch = data.find(item => item.startsWith(input));

                // Find the first match that contains the input
                const containsMatch = data.find(item => item.includes(input));

                // Use the first match from either method
                const match = startsWithMatch || containsMatch;

                if (match) {
                    // Autofill the suggestion
                    cell.innerText = match;
                    suggestion.innerText = ''; // Clear the faded suggestion
                }
            }

            // Move focus based on the key pressed
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    // Shift+TAB: Move to the previous cell in the same row
                    const prevCell = cell.previousElementSibling;
                    if (prevCell) {
                        prevCell.focus();
                    }
                } else {
                    // TAB: Move to the next cell in the same row
                    const nextCell = cell.nextElementSibling;
                    if (nextCell) {
                        nextCell.focus();
                    }
                }
            } else if (event.key === 'Enter') {
                // ENTER: Move to the same cell in the next row
                const nextRow = cell.parentElement.nextElementSibling;
                if (nextRow) {
                    const nextCell = nextRow.cells[cell.cellIndex];
                    if (nextCell) {
                        nextCell.focus();
                    }
                }
            }
        }

        // Handle arrow keys (up, down, left, right)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault(); // Prevent default arrow key behavior

            let targetCell = null;

            switch (event.key) {
                case 'ArrowUp':
                    // Move to the cell above
                    const prevRow = cell.parentElement.previousElementSibling;
                    if (prevRow) {
                        targetCell = prevRow.cells[cell.cellIndex];
                    }
                    break;

                case 'ArrowDown':
                    // Move to the cell below
                    const nextRow = cell.parentElement.nextElementSibling;
                    if (nextRow) {
                        targetCell = nextRow.cells[cell.cellIndex];
                    }
                    break;

                case 'ArrowLeft':
                    // Move to the previous cell in the same row
                    targetCell = cell.previousElementSibling;
                    break;

                case 'ArrowRight':
                    // Move to the next cell in the same row
                    targetCell = cell.nextElementSibling;
                    break;
            }

            // Focus the target cell if it exists
            if (targetCell) {
                targetCell.focus();
            }
        }
    });

    cell.addEventListener('blur', function () {
        suggestion.innerText = ''; // Clear the faded suggestion when the cell loses focus
    });
}

// Apply faded autocomplete to all editable cells
document.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
    createFadedAutocomplete(cell);
});
