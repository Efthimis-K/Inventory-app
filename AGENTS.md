# Inventory App - Agent Guide

## Project Overview

Electronics inventory management web app built with Express + EJS + PostgreSQL. Provides CRUD for categories (electronics product categories) and items (inventory products within categories).

## Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5
- **Templating**: EJS with a shared `layout.ejs` wrapper
- **Database**: PostgreSQL via `pg` connection pool
- **Validation**: express-validator
- **Dev tools**: nodemon, Jest

## Directory Structure

```
inventory-app/
├── app.js                   # Entry point, middleware, route mounting
├── package.json             # Scripts: start, dev, seed
├── .env                     # DB credentials + PORT
├── db/
│   ├── pool.js              # pg Pool instantiation from env
│   ├── queries.js           # All SQL queries (parameterized)
│   ├── schema.sql           # Table definitions + indexes
│   └── populatedb.js        # Seed script for sample data
├── controllers/
│   ├── categoriesController.js
│   └── itemsController.js
├── routes/
│   ├── indexRouter.js       # Root redirect, mounts sub-routers
│   ├── categoriesRouter.js
│   └── itemsRouter.js
├── utils/
│   └── renderPage.js        # Wraps res.render with layout + status handling
└── views/
    ├── layout.ejs           # Base HTML shell
    ├── index.ejs            # Home (category list)
    ├── category.ejs         # Category detail + item list
    ├── category-form.ejs    # Create/edit category form
    ├── item-form.ejs        # Create/edit item form
    └── error.ejs            # Error page
```

## Key Patterns

1. **Thin routes, fat controllers**: Routes only map to controller exports; all logic lives in controllers.
2. **Database layer**: `db/queries.js` exports async query functions used by controllers. Uses parameterized queries (`$1`, `$2`) to prevent SQL injection.
3. **Rendering**: `utils/renderPage.js` wraps EJS rendering with a shared `layout.ejs`. Controllers call `renderPage(res, view, locals, statusCode)`.
4. **Validation**: express-validator chains in controller files (`validateCategory`, `validateItem`). Post handlers use `validationResult(req)` and `matchedData(req)`.
5. **SKU normalization**: `db/queries.js` normalizes blank SKUs to `null` via `normalizeSku()` to satisfy `UNIQUE` constraints.
6. **Cascade deletes**: `items.category_id` has `ON DELETE CASCADE`, so deleting a category removes its items.
7. **Category delete guard**: Deleting a category is blocked if it still contains items (`getCategoryItemCount`).

## Database Schema

- `categories`: id, name (VARCHAR 100), description (TEXT), created_at
- `items`: id, name (VARCHAR 200), description (TEXT), price (DECIMAL), quantity, sku (UNIQUE), brand, category_id (FK), created_at
- Index on `items.category_id`

## Common Workflows

- **Start dev server**: `npm run dev` (nodemon)
- **Start production**: `npm start`
- **Seed database**: `npm run seed` (requires DB created and schema applied)
- **Setup DB**: Create `inventory_app`, then run `psql -U postgres -d inventory_app -f db/schema.sql`
- **Env vars**: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, optional `PORT`

## Route Map

| Method | Path                     | Controller                 |
| ------ | ------------------------ | -------------------------- |
| GET    | `/`                      | redirects to `/categories` |
| GET    | `/categories`            | categoriesListGet          |
| GET    | `/categories/new`        | categoryCreateGet          |
| POST   | `/categories/new`        | categoryCreatePost         |
| GET    | `/categories/:id`        | categoryDetailGet          |
| GET    | `/categories/:id/edit`   | categoryUpdateGet          |
| POST   | `/categories/:id/edit`   | categoryUpdatePost         |
| POST   | `/categories/:id/delete` | categoryDeletePost         |
| GET    | `/items/new/:categoryId` | itemCreateGet              |
| POST   | `/items/new/:categoryId` | itemCreatePost             |
| GET    | `/items/:id/edit`        | itemUpdateGet              |
| POST   | `/items/:id/edit`        | itemUpdatePost             |
| POST   | `/items/:id/delete`      | itemDeletePost             |

## Conventions

- Views use EJS; layout file wraps all pages.
- Controllers return 404/400 errors via `renderPage(res, "error", {title, message}, status)`.
- Item forms require a `category` (create) or `categories` list (update); controller passes the correct context.
- No client-side JS frameworks; validation is server-side only.
- PostgreSQL error code `23505` (unique violation) is caught for SKU conflicts.

## Testing

- Jest configured in devDependencies. Write tests under project root or a `tests/` directory.
- Database-dependent tests should seed or mock `db/queries.js`.

## Additional Notes

- Since you might encounter EPERM errors, try to execute commands using powershell.
- When asked to make edits or search for latest versions of packages or libraries, use context7. Search first if context7 exists, then use it.
- Before ending a task, always validate if the solution is working. That means you might have to re-run the solution and check if it works.
