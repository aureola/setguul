/**
 * cPanel / Passenger Node.js App entry point.
 *
 * Datacom-ийн "Setup Node.js App" тохиргоонд энэ файлыг Application startup file
 * болгож зааж өгнө. Passenger `PORT` environment variable-ийг автоматаар тохируулдаг.
 *
 * Deploy алхмууд (README.md-д дэлгэрэнгүй):
 *   1. npm install
 *   2. npm run build
 *   3. npx prisma migrate deploy
 *   4. npm run db:seed   (эхний удаад admin хэрэглэгч үүсгэхэд)
 *   5. cPanel дээр "Restart" дарах
 */
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Setguul.mn ready on port ${port} (${dev ? "development" : "production"})`);
  });
});
