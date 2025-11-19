# RollingCart 🛒

A self-hostable shopping list application with session-based workflow and GTD-inspired backlog system. Designed for frictionless capture and flexible shopping workflows.

## Features

- **Smart Shopping Lists**: Add items as you think of them, organize them into shopping trips
- **Session-Based Workflow**: Start a shopping trip to track what you've picked up
- **Rich Catalog**: Pre-seeded with common items across grocery, kitchen, hardware, and stationery categories
- **Fuzzy Search**: Fast autocomplete with Fuse.js finds items even with typos
- **Category Grouping**: Items auto-organize by category for efficient in-store navigation
- **Adaptive UI**: Context-aware placeholders and prompts guide you through the workflow
- **SQLite Database**: Production-ready for single-user deployments

## Tech Stack

### Backend
- **Rails 8.0.2** - API + serves React app
- **Rodauth** - JWT-based authentication
- **SQLite3** - Production-ready database
- **Solid Stack** - Solid Cache, Solid Queue, Solid Cable

### Frontend
- **React 19.2** - UI framework
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Vite** - Fast build tool
- **Tailwind CSS v4** - Styling
- **DaisyUI** - Component library
- **Fuse.js** - Fuzzy search

## Quick Start

### Option 1: Docker Compose (Recommended)

**Prerequisites:**
- Docker
- Docker Compose

**Steps:**

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rollingcart.git
cd rollingcart
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` and set your `RAILS_MASTER_KEY`:
```bash
RAILS_MASTER_KEY=<content-of-config/master.key>
DB_PASSWORD=your-secure-password
```

4. Start the application:
```bash
docker-compose up -d
```

5. Create your first user and seed catalog:
```bash
docker-compose exec app bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword
docker-compose exec app bin/rails catalog:seed EMAIL=you@example.com
```

6. Open http://localhost:3000 and login with your credentials.

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment options.

### Option 2: Local Development

**Prerequisites:**
- Ruby 3.3+
- Node.js 18+
- SQLite 3

**Steps:**

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rollingcart.git
cd rollingcart
```

2. Install dependencies:
```bash
bundle install
npm install
```

3. Setup database:
```bash
bin/rails db:setup
```

4. Create your first user:
```bash
bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword
```

5. Seed catalog items:
```bash
bin/rails catalog:seed EMAIL=you@example.com
```

6. Start the development server:
```bash
bin/dev
```

This starts both Rails (port 3000) and Vite dev server (port 3036).

7. Open http://localhost:3000 and login with your credentials.

## Catalog Seed System

RollingCart comes with a comprehensive catalog of common items organized by store type.

### Rake Tasks

**Seed all catalogs for a user:**
```bash
bin/rails catalog:seed EMAIL=user@example.com
```

**Seed specific catalogs only:**
```bash
bin/rails catalog:seed EMAIL=user@example.com FILES=grocery_fresh.yml,grocery_pantry.yml
```

**List all seed items and find duplicates:**
```bash
bin/rails catalog:seed:list_items
bin/rails catalog:seed:list_items VERBOSE=true  # Show all items
```

**Idempotency**: The seeding process is idempotent - you can run it multiple times safely. It uses `find_or_create_by` to skip existing records.

### Customizing Catalog Data

Catalog files are located in `db/default_catalog/` with YAML format:

```yaml
categories:
  - name: Category Name
    description: Optional description
    items:
      - name: Item Name
        description: Optional description (for disambiguation)
      - name: Another Item
```

**Naming conventions**:
- Use singular form (e.g., "Apple" not "Apples")
- Add Indonesian translations in description field when applicable
- No description needed if name is self-explanatory

## User Management

Since registration is disabled for single-user setup, use rake tasks:

```bash
# Create user
bin/rails user:create EMAIL=you@example.com PASSWORD=yourpassword

# List users
bin/rails user:list

# Delete user
bin/rails user:delete EMAIL=you@example.com
```

## Development

### Running Tests
```bash
bin/rails test                                    # All tests
bin/rails test test/models/some_model_test.rb   # Specific file
```

### Code Quality
```bash
# Ruby linting (Rails Omakase style)
bin/rubocop
bin/rubocop -a  # Auto-fix

# Security scanning
bin/brakeman

# JavaScript linting
npm run lint
npm run lint:fix
```

### Database Operations
```bash
bin/rails db:migrate        # Run migrations
bin/rails db:reset          # Reset database (WARNING: destroys data)
bin/rails db:seed           # Seed default data
```

## API Endpoints

All API endpoints are under `/api/v1/`:

**Authentication** (via Rodauth):
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout
- `POST /auth/jwt-refresh` - Refresh JWT token

**Catalog**:
- `GET /api/v1/catalog/categories` - List categories
- `GET /api/v1/catalog/items?include_category=true` - List all items

**Shopping**:
- `GET /api/v1/shopping/sessions` - List sessions
- `GET /api/v1/shopping/items` - List shopping list items

## Terminology

- **User-facing**: "Shopping List" and "Shopping Trip"
- **Code/API**: "backlog" and "session"
- Shopping List = Unchecked items (no session)
- Shopping Trip = Active or completed session

## Project Status

✅ **MVP Complete** - Core features implemented and tested

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]
