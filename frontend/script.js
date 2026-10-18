
const form = document.getElementById("calculatorForm");
const firstInput = document.getElementById("firstNumber");
const secondInput = document.getElementById("secondNumber");
const operationInput = document.getElementById("operation");
const calculateBtn = document.getElementById("calculateBtn");
const resultBox = document.getElementById("result");
const message = document.getElementById("message");
const historyList = document.getElementById("historyList");
const copyBtn = document.getElementById("copyBtn");
const refreshBtn = document.getElementById("refreshBtn");

let lastResult = null;

const symbols = {
    add: "+",
    subtract: "−",
    multiply: "×",
    divide: "÷"
};

// Operation buttons
document.querySelectorAll(".operation-btn").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".operation-btn").forEach((btn) => {
            btn.classList.remove("active");
            btn.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
        operationInput.value = button.dataset.operation;
        message.textContent = "";
    });
});

// Read API response safely
async function readResponse(response) {
    const text = await response.text();

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(
            `Server response error (${response.status}): ${text.slice(0, 200)}`
        );
    }

    if (!response.ok) {
        throw new Error(data.error || `Request failed: ${response.status}`);
    }

    return data;
}

// Calculate
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstNumber = firstInput.value.trim();
    const secondNumber = secondInput.value.trim();
    const operation = operationInput.value;

    if (firstNumber === "" || secondNumber === "") {
        message.textContent = "Please enter both numbers.";
        return;
    }

    calculateBtn.disabled = true;
    calculateBtn.textContent = "Calculating...";
    message.textContent = "";

    try {
        const response = await fetch("/api/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstNumber,
                secondNumber,
                operation
            })
        });

        const data = await readResponse(response);

        lastResult = data.result;
        resultBox.textContent = Number(data.result).toLocaleString(
            "en-US",
            { maximumFractionDigits: 10 }
        );

        message.textContent = "Calculation successful!";
        await loadHistory();
    } catch (error) {
        console.error("Calculation error:", error);
        message.textContent = error.message || "Calculation failed.";
    } finally {
        calculateBtn.disabled = false;
        calculateBtn.innerHTML = 'Calculate now <span>→</span>';
    }
});

// Load calculation history
async function loadHistory() {
    try {
        const response = await fetch("/api/history");
        const rows = await readResponse(response);

        historyList.replaceChildren();

        if (!Array.isArray(rows) || rows.length === 0) {
            historyList.textContent = "No calculations yet.";
            return;
        }

        rows.forEach((item) => {
            const entry = document.createElement("div");
            entry.className = "history-item";

            const expression = document.createElement("div");
            expression.className = "history-expression";
            expression.textContent =
                `${item.firstNumber} ${symbols[item.operation] || item.operation} ${item.secondNumber}`;

            const answer = document.createElement("div");
            answer.className = "history-result";
            answer.textContent = `= ${item.result}`;

            entry.append(expression, answer);
            historyList.appendChild(entry);
        });
    } catch (error) {
        console.error("History error:", error);
        historyList.textContent = "Could not load history. Check server.";
    }
}

// Copy result
copyBtn.addEventListener("click", async () => {
    if (lastResult === null) {
        message.textContent = "Calculate a result first.";
        return;
    }

    try {
        await navigator.clipboard.writeText(String(lastResult));
        message.textContent = "Result copied!";
    } catch (error) {
        console.error("Copy error:", error);
        message.textContent = "Copy failed. Select and copy the result manually.";
    }
});

// Refresh history
refreshBtn.addEventListener("click", loadHistory);

// Initial history
loadHistory();
