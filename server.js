
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_PATH = path.join(__dirname, "frontend");

app.use(express.json({ limit: "10kb" }));
app.use(express.static(FRONTEND_PATH));

app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_PATH, "index.html"));
});

app.post("/api/calculate", (req, res) => {
    try {
        const { firstNumber, secondNumber, operation } = req.body || {};

        if (
            firstNumber === "" ||
            secondNumber === "" ||
            firstNumber === null ||
            secondNumber === null ||
            firstNumber === undefined ||
            secondNumber === undefined
        ) {
            return res.status(400).json({
                error: "Please enter two valid numbers."
            });
        }

        const first = Number(firstNumber);
        const second = Number(secondNumber);

        if (!Number.isFinite(first) || !Number.isFinite(second)) {
            return res.status(400).json({
                error: "Please enter two valid numbers."
            });
        }

        let result;

        switch (operation) {
            case "add":
                result = first + second;
                break;
            case "subtract":
                result = first - second;
                break;
            case "multiply":
                result = first * second;
                break;
            case "divide":
                if (second === 0) {
                    return res.status(400).json({
                        error: "Cannot divide by zero."
                    });
                }
                result = first / second;
                break;
            default:
                return res.status(400).json({
                    error: "Please select a valid operation."
                });
        }

        if (!Number.isFinite(result)) {
            return res.status(400).json({
                error: "The result is outside the supported numeric range."
            });
        }

        res.json({ result });
    } catch (error) {
        console.error("Calculation error:", error.message);
        res.status(500).json({
            error: "Calculation failed."
        });
    }
});

// History is temporarily unavailable without a database.
app.get("/api/history", (req, res) => {
    res.json([]);
});

app.use("/api", (req, res) => {
    res.status(404).json({
        error: "API endpoint not found."
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Calculator running on port ${PORT}`);
});
