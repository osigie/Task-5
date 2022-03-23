"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const cheerio = require("cheerio");
const https = require("https");
/*
implement your server code here
*/
const server = http_1.default.createServer((req, res) => {
    if (req.method === "POST") {
        let url = "";
        req.on("data", (chunk) => {
            url += chunk.toString();
        });
        req.on("end", () => {
            url = JSON.parse(url);
            https.get(url, (ress) => {
                let data = [];
                ress.on("data", (chunk) => {
                    data.push(chunk);
                });
                ress.on("end", () => {
                    const $ = cheerio.load(data.toString());
                    const imgUrls = [];
                    let titles = "";
                    let descriptions = "";
                    const images = $("img");
                    images.each((i, elem) => {
                        const eachUrl = $(elem).attr("src");
                        imgUrls.push(eachUrl);
                    });
                    descriptions += $('meta[name="description"]').attr("content");
                    titles += $("title").text();
                    const scrapedObj = {
                        titles,
                        descriptions,
                        imgUrls,
                    };
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(scrapedObj));
                });
            });
        });
        res.on("error", (err) => {
            console.log("Error: ", err.message);
        });
    }
});
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
