const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION || "1.0";

app.get("/", (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Blue-Green Deployment</title>
            </head>
            <body>
                <h1>Blue-Green Deployment Demo</h1>
                <h2>Application Version: ${VERSION}</h2>
                <p>Running on port: ${PORT}</p>
                <p> CI/CD works! </p>
            </body>
        </html>
    `);
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        version: VERSION
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});