# Electronics Inventory Management App

A full-stack inventory management system for an electronics store with PostgreSQL database integration.

## Features

- **Category Management**: Create, read, update, and delete product categories
- **Item Management**: Full CRUD operations for inventory items within categories
- **Database Integration**: PostgreSQL for persistent data storage
- **Form Validation**: Input validation using express-validator
- **Responsive UI**: Clean, modern interface with EJS templating

## Tech Stack

- Node.js
- Express.js
- EJS (Embedded JavaScript templating)
- PostgreSQL (pg library)
- express-validator
- dotenv (environment variables)

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

```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Managing Categories

1. **View All Categories**: Navigate to the home page
2. **Create Category**: Click "New Category" in the navigation
3. **View Category Items**: Click "View Items" on any category
4. **Edit Category**: Click "Edit" on any category
5. **Delete Category**: Click "Delete" (only allowed if category has no items)

### Managing Items

1. **View Items**: Navigate to a category to see all items
2. **Create Item**: Click "Add New Item" within a category
3. **Edit Item**: Click "Edit" on any item
4. **Delete Item**: Click "Delete" on any item

## Database Schema

### Categories Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100) NOT NULL)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

### Items Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(200) NOT NULL)
- `description` (TEXT)
- `price` (DECIMAL(10,2) NOT NULL)
- `quantity` (INTEGER DEFAULT 0)
- `sku` (VARCHAR(50) UNIQUE)
- `brand` (VARCHAR(100))
- `category_id` (INTEGER REFERENCES categories(id))
- `created_at` (TIMESTAMP)

## Project Structure

```
inventory-app/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not in git)
├── .gitignore            # Git ignore rules
├── db/
│   ├── pool.js           # PostgreSQL connection pool
│   ├── queries.js        # Database query functions
│   ├── schema.sql        # Database schema
│   └── populatedb.js     # Seed script
├── controllers/
│   ├── categoriesController.js
│   └── itemsController.js
├── routes/
│   ├── indexRouter.js
│   ├── categoriesRouter.js
│   └── itemsRouter.js
└── views/
    ├── layout.ejs        # Base template
    ├── index.ejs         # Home page
    ├── category.ejs      # Category detail page
    ├── category-form.ejs # Category create/edit form
    ├── item-form.ejs     # Item create/edit form
    └── error.ejs         # Error page
```

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

## License

ISC
