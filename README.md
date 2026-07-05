# Electronics Inventory Management App

A full-stack inventory management system for an electronics store with PostgreSQL database integration.

## Features

- **Category Management**: Create, read, update, and delete product categories
- **Item Management**: Full CRUD operations for inventory items within categories
- **Database Integration**: PostgreSQL for persistent data storage
- **Form Validation**: Input validation using express-validator
- **Responsive UI**: Clean, modern interface with EJS templating
- **Category Deletion Protection**: Deleting a category is only permitted if it contains no items, preventing accidental loss of product data. (The database schema defines `ON DELETE CASCADE` on `items.category_id`, but the controller enforces this validation check before performing the delete.)

## Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5
- **Templating**: EJS with a shared `layout.ejs` wrapper
- **Database**: PostgreSQL via `pg` connection pool
- **Validation**: express-validator
- **Dev tools**: nodemon, Jest
- **Other**: dotenv (environment variables)

## Setup Instructions

### 1. Configure Database Credentials

Edit the `.env` file in the project root with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_app
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 2. Create the Database

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE inventory_app;
```

### 3. Initialize Database Tables

Run the schema.sql file to create the required tables:

```bash
psql -U postgres -d inventory_app -f db/schema.sql
```

Or use psql interactively:

```bash
psql -U postgres -d inventory_app
\i db/schema.sql
```

### 4. Seed Sample Data (Optional)

Populate the database with sample electronics data:

```bash
npm run seed
```

This will create 5 categories (Smartphones, Laptops, Audio, Gaming, Cameras) with 15 sample items.

### 5. Start the Server

**Production mode:**

```bash
npm start
```

**Development mode (with auto-restart):**

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port configured in your `.env` file).

## Usage

### Managing Categories

1. **View All Categories**: Navigate to the home page (`/categories`)
2. **Create Category**: Click "New Category" in the navigation
3. **View Category Items**: Click "View Items" on any category
4. **Edit Category**: Click "Edit" on any category
5. **Delete Category**: Click "Delete" (only allowed if category has no items)

### Managing Items

1. **View Items**: Navigate to a category to see all items
2. **Create Item**: Click "Add New Item" within a category
3. **Edit Item**: Click "Edit" on any item
4. **Delete Item**: Click "Delete" on any item

## Route Map

| Method | Path                     | Description                |
| ------ | ------------------------ | -------------------------- |
| GET    | `/`                      | Redirects to `/categories` |
| GET    | `/categories`            | List all categories        |
| GET    | `/categories/new`        | Show create category form  |
| POST   | `/categories/new`        | Create a new category      |
| GET    | `/categories/:id`        | View category detail       |
| GET    | `/categories/:id/edit`   | Show edit category form    |
| POST   | `/categories/:id/edit`   | Update a category          |
| POST   | `/categories/:id/delete` | Delete a category          |
| GET    | `/items/new/:categoryId` | Show create item form      |
| POST   | `/items/new/:categoryId` | Create a new item          |
| GET    | `/items/:id/edit`        | Show edit item form        |
| POST   | `/items/:id/edit`        | Update an item             |
| POST   | `/items/:id/delete`      | Delete an item             |

## Database Schema

### Categories Table

| Column      | Type         | Constraints   |
| ----------- | ------------ | ------------- |
| id          | SERIAL       | PRIMARY KEY   |
| name        | VARCHAR(100) | NOT NULL      |
| description | TEXT         |               |
| created_at  | TIMESTAMP    | DEFAULT NOW() |

### Items Table

| Column      | Type          | Constraints                                 |
| ----------- | ------------- | ------------------------------------------- |
| id          | SERIAL        | PRIMARY KEY                                 |
| name        | VARCHAR(200)  | NOT NULL                                    |
| description | TEXT          |                                             |
| price       | DECIMAL(10,2) | NOT NULL                                    |
| quantity    | INTEGER       | DEFAULT 0                                   |
| sku         | VARCHAR(50)   | UNIQUE                                      |
| brand       | VARCHAR(100)  |                                             |
| category_id | INTEGER       | REFERENCES categories(id) ON DELETE CASCADE |
| created_at  | TIMESTAMP     | DEFAULT NOW()                               |

An index exists on `items.category_id` for faster lookups.

## Project Structure

```
inventory-app/
├── app.js                 # Entry point, middleware, route mounting
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not in git)
├── .gitignore             # Git ignore rules
├── AGENTS.md              # Agent guide with project conventions
├── db/
│   ├── pool.js            # PostgreSQL connection pool
│   ├── queries.js         # All SQL query functions (parameterized)
│   ├── schema.sql         # Table definitions + indexes
│   └── populatedb.js      # Seed script for sample data
├── controllers/
│   ├── categoriesController.js
│   └── itemsController.js
├── routes/
│   ├── indexRouter.js     # Root redirect, mounts sub-routers
│   ├── categoriesRouter.js
│   └── itemsRouter.js
├── utils/
│   └── renderPage.js      # Wraps res.render with layout + status handling
└── views/
    ├── layout.ejs         # Base HTML shell (shared wrapper)
    ├── index.ejs          # Home page (category list)
    ├── category.ejs       # Category detail + item list
    ├── category-form.ejs  # Category create/edit form
    ├── item-form.ejs      # Item create/edit form
    └── error.ejs          # Error page
```

## Development

### Available Scripts

| Script         | Command                 | Description                        |
| -------------- | ----------------------- | ---------------------------------- |
| `npm start`    | `app.js`                | Start production server            |
| `npm run dev`  | `nodemon app.js`        | Start dev server with auto-restart |
| `npm run seed` | `node db/populatedb.js` | Seed database with sample data     |

### Testing

Jest is installed as a development dependency in `package.json`, but no test suite or `test` script is currently configured.

## Project Conventions

- **Thin routes, fat controllers**: Routes only map to controller exports; all logic lives in controllers.
- **Database layer**: `db/queries.js` exports async query functions used by controllers. Uses parameterized queries (`$1`, `$2`) to prevent SQL injection.
- **Rendering**: `utils/renderPage.js` wraps EJS rendering with a shared `layout.ejs`. Controllers call `renderPage(res, view, locals, statusCode)`.
- **Validation**: express-validator chains in controller files. Post handlers use `validationResult(req)` and `matchedData(req)`.
- **SKU normalization**: Blank SKUs are normalized to `null` to satisfy `UNIQUE` constraints.
- **Category deletion**: Although the database schema defines `ON DELETE CASCADE` for items, the controller (`categoriesController.js`) enforces that a category can only be deleted if it contains zero items to safeguard data.

## Troubleshooting

### Database Connection Error

If you see a connection error, verify:

1. PostgreSQL is running
2. Database `inventory_app` exists
3. Credentials in `.env` are correct
4. PostgreSQL is accepting connections on the configured port

### Port Already in Use

If port 3000 is already in use, you can set a different port:

```bash
PORT=3001 npm start
```

### Unique Constraint Violation (SKU)

A PostgreSQL error code `23505` (unique violation) is returned if a duplicate SKU is submitted. Enter a unique SKU or leave it blank to auto-normalize.

## License

ISC
