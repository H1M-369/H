import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/" || urlPath.endsWith("/")) urlPath = urlPath + "index.html";
  if (!path.extname(urlPath)) urlPath = urlPath + "/index.html";

  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Mirror the host: unknown pages get the site's 404 page
      fs.readFile(path.join(__dirname, "404.html"), (err404, page) => {
        res.writeHead(404, { "Content-Type": err404 ? "text/plain" : "text/html" });
        res.end(err404 ? "404 Not Found" : page);
      });
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
