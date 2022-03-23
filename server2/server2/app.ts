import http, { IncomingMessage, Server, ServerResponse } from "http";
const cheerio = require("cheerio");
const https = require("https");
/*
implement your server code here
*/
const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "POST") {
      let url = "";
      req.on("data", (chunk) => {
        url += chunk.toString();
      });
      req.on("end", () => {
        url = JSON.parse(url);

        https.get(url, (ress: ServerResponse) => {
          let data: string[] = [];
          ress.on("data", (chunk) => {
            data.push(chunk);
          });

          ress.on("end", () => {
            const $ = cheerio.load(data.toString());

            const imgUrls: string[] = [];
            let titles = "";
            let descriptions = "";

            const images = $("img");
            images.each((i: number, elem: [key: string]) => {
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
      res.on("error", (err: Error) => {
        console.log("Error: ", err.message);
      });
    }
  }
);
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
