# Setguul.mn

Мэдээллийн вэб сайт — Next.js (App Router) + MySQL (Prisma) + NextAuth. Эрхийн
удирдлагатай Admin panel (Administrator / Moderator / Editor) болон бүх админ
үйлдлийг бичдэг audit log-той.

## Технологи

- Next.js 16 (App Router, TypeScript)
- MySQL 8 + Prisma ORM
- NextAuth.js v5 (Credentials, JWT session)
- Tailwind CSS v4
- Зураг хадгалалт: `public/uploads/` (локал диск)

## Локал хөгжүүлэлт

1. Dependency суулгах:
   ```bash
   npm install
   ```
2. `.env.example`-ийг хуулж `.env` үүсгэх, өөрийн MySQL холболтоор бөглөх:
   ```bash
   cp .env.example .env
   ```
3. Хүснэгт үүсгэх (анх удаа):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Эхний өгөгдөл (admin хэрэглэгч, ангилал, цэс, тохиргоо) оруулах:
   ```bash
   npm run db:seed
   ```
   Admin нэвтрэх мэдээлэл: **admin / pass** — эхний нэвтрэлтийн дараа
   `/admin/users`-ээс нууц үгээ солино уу.
5. Dev server ажиллуулах:
   ```bash
   npm run dev
   ```
   - Нийтийн сайт: http://localhost:3000
   - Admin panel: http://localhost:3000/admin/login

## Эрхийн систем

| Эрх | Боломж |
|---|---|
| **Administrator** | Бүх зүйл: мэдээ, ангилал, баннер, цэс, theme/тохиргоо, хэрэглэгч удирдах, лог харах |
| **Moderator** | Бүх хэрэглэгчийн мэдээг засах/устгах/нийтлэх, баннер удирдах |
| **Editor** | Зөвхөн өөрийн нэмсэн мэдээг засах/устгах (нийтлэх эрхгүй — Moderator/Administrator баталгаажуулна) |

Эрхийн логик: [`src/lib/permissions.ts`](src/lib/permissions.ts). API route бүр
дээр эрхийг давхар шалгадаг ([`src/lib/api-auth.ts`](src/lib/api-auth.ts)).

## Audit log

Доорх үйлдлүүд `AuditLog` хүснэгтэд (хэрэглэгч, IP, цаг хамт) автоматаар
бичигдэнэ ([`src/lib/audit.ts`](src/lib/audit.ts)):
- Нэвтрэх амжилттай/амжилтгүй
- Мэдээ үүсгэх/засах/устгах
- Ангилал, баннер, цэс, тохиргооны өөрчлөлт
- Хэрэглэгч нэмэх/засах/идэвхгүй болгох
- Файл (зураг) хуулах

Лог харах: `/admin/logs` (зөвхөн Administrator).

## Production build

```bash
npm run build
npm start
```

## Deploy — Datacom Node.js hosting (cPanel / Passenger)

1. cPanel → **Setup Node.js App** → шинэ Application үүсгэх:
   - Node.js version: 20.x (эсвэл hosting-д байгаа хамгийн сүүлийн LTS)
   - Application root: repo-г байршуулсан фолдер
   - Application startup file: **`app.js`**
   - Application mode: `production`
2. cPanel-ийн өгсөн "Enter to the virtual environment" командаар орж:
   ```bash
   npm install
   npm run build
   ```
3. `.env` файлыг серверт үүсгэж (эсвэл cPanel-ийн "Environment variables"
   хэсэгт тохируулж) дараах утгуудыг тавих:
   - `DATABASE_URL` — Datacom-ийн MySQL холболтын мэдээлэл
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`-оор үүсгэсэн урт нууц түлхүүр
   - `NEXTAUTH_URL` — сайтын бодит домэйн (жишээ нь `https://setguul.mn`)
   - `UPLOAD_DIR` — `public/uploads` (өөрчлөх шаардлагагүй)
4. Миграц хийх (анх удаа болон schema өөрчлөгдөх бүрт):
   ```bash
   npx prisma migrate deploy
   ```
5. Эхний admin хэрэглэгч, анхны ангилал/цэс/тохиргоо үүсгэх (зөвхөн анх удаа):
   ```bash
   npm run db:seed
   ```
6. cPanel дээрээс Node.js App-аа **Restart** хийх.

`app.js` нь Passenger-ийн `PORT` environment variable-ийг уншиж Next.js
серверийг ажиллуулдаг энгийн Node.js HTTP server wrapper юм.

## Файлын бүтэц

- `src/app/(site)/*` — нийтийн фронт (нүүр, ангилал, мэдээ, хайлт)
- `src/app/admin/(auth)/login` — admin нэвтрэх хуудас (эрхийн шалгалтгүй)
- `src/app/admin/(protected)/*` — эрх шалгадаг admin panel хуудаснууд
- `src/app/api/admin/*` — admin CRUD API-ууд (эрх + audit log-той)
- `src/lib/*` — Prisma client, auth тохиргоо, эрхийн матриц, audit helper
- `prisma/schema.prisma` — DB загвар
- `prisma/seed.ts` — эхний өгөгдөл (admin/pass, ангилал, цэс, тохиргоо)
