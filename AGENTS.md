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

## Additional Notes

- Since you might encounter EPERM errors, try to execute commands using powershell.
- When asked to make edits or search for latest versions of packages or libraries, use context7. Search first if context7 exists, then use it.
- Before ending a task, always validate if the solution is working. That means you might have to re-run the solution and check if it works.
