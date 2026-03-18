# Fondos App (Angular)

Frontend application to manage investment funds subscriptions/cancellations with a mocked backend layer.

## 1) Tech Stack

- **Angular** (standalone components + modern control flow like `@for`)
- **TypeScript**
- **RxJS**
- **Angular HttpClient + Http Interceptor**
- **SCSS/CSS** (depending on project setup)

---

## 2) Runtime Requirements

> This project uses modern Angular syntax (`@for`), so Angular 17+ is required.

### Required versions

- **Node.js**: `>= 20.x` (LTS recommended)
- **npm**: `>= 10.x`
- **Angular CLI**: `>= 17.x`

### Check your local versions

```bash
node -v
npm -v
ng version
```

### Install Angular CLI globally (if needed)

```bash
npm install -g @angular/cli
```

---

## 3) Run the Project

```bash
npm install
ng serve
```

Open:

- `http://localhost:4200`

### Build for production

```bash
ng build
```

### Run unit tests

```bash
ng test
```

---

## 4) Architecture and Design Decisions

## 4.1 Atomic Design Pattern

The UI structure follows **Atomic Design** to keep components reusable and scalable:

- **Atoms**: smallest reusable UI elements (buttons, tags, labels, inputs).
- **Molecules**: combinations of atoms with a single responsibility (e.g., `card-fund`).
- **Organisms**: larger sections composed of molecules/atoms.
- **Templates/Pages**: full screen compositions and routing views.

### Why this matters

- Better component reuse
- Clear separation of UI responsibilities
- Easier testing and maintenance
- Scales cleanly as features grow

---

## 4.2 Services and Models by Domain

The codebase separates concerns by domain (based on technical requirements), for example:

- **Funds domain**: fund listing, subscription/cancel operations
- **User domain**: current balance and related operations
- **Transactions domain**: transaction history and actions

Each domain uses:

- **Model(s)** for strong typing (`Fund`, `User`, `Transaction`, etc.)
- **Service(s)** for API communication and business orchestration
- Optional presentation mapping (example: internal fund code -> display name)

### Why this matters

- Domain boundaries are explicit
- Strong typing reduces runtime errors
- Easier onboarding for new developers
- Better maintainability for enterprise teams

---

## 4.3 Mock API via Interceptor

A dedicated **HTTP Interceptor** (`mock-api.interceptor.ts`) simulates backend endpoints in-memory:

- `GET /api/funds`
- `GET /api/user`
- `PATCH /api/user`
- `GET /api/transactions`
- `POST /api/transactions`
- `DELETE /api/transactions`
- `POST /api/funds/:id/subscribe`
- `POST /api/funds/:id/cancel`

It also handles:

- Network delay simulation
- Validation and business rules
- Error responses (`400`, `404`) with user-friendly messages
- Stateful behavior (balance updates, subscription amounts, transaction history)

### Why this matters

- Frontend can be developed/tested without a real backend
- Enables realistic demo scenarios
- Reduces integration blockers during early development
- Keeps API contract stable for future real backend replacement

---

## 5) UX/Data Notes

- Fund data keeps a technical `name` code.
- Display labels are resolved in frontend through a mapping layer (no need to change backend/mock contract).
- Currency formatting is locale-ready via Angular pipes.

---

## 6) Project Quality Signals (for Recruiters / Architect Leads)

- Clear component composition strategy (**Atomic Design**)
- Typed domain modeling (**TypeScript-first**)
- Separation of concerns (**UI vs domain services vs data access**)
- Backend abstraction via interceptor (**replaceable infra layer**)
- Explicit error handling and validation paths
- Ready for CI usage with standard Angular commands (`build`, `test`)

---

## 7) Suggested Next Improvements

- Add unit tests for:
  - domain services
  - interceptor validation rules
  - mapping functions (fund code -> display name)
- Add e2e tests for critical user journeys
- Add lint/format checks in CI pipeline
- Add environment-based switch (mock API vs real API)
- Add i18n strategy if multi-language support is needed

---

## 8) Folder Intent (High Level)

- `src/app/components`: UI components (atomic structure)
- `src/app/models`: domain types/interfaces
- `src/app/services`: domain services
- `src/app/core/interceptors`: cross-cutting HTTP concerns (mock backend)
- `src/app/shared`: reusable constants/helpers/mappers

---

## 9) Notes

If your team wants strict version pinning, add `engines` to `package.json` (Node/npm) and lock Angular CLI in devDependencies.
