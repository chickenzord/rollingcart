# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rollingcart is a self-hostable Rails 8.0.2 + React application with JWT authentication. It's designed for single-user deployment initially (with multi-user database schema ready for future expansion). The application uses Rodauth for authentication, Vite for frontend bundling, and modern Rails features including Solid Cache, Solid Queue, and Solid Cable.

Consult CONCEPT.md for more details on the business design.

## Architecture

### Backend (Rails API)
- **Mode**: Hybrid - serves React app AND provides JSON API endpoints
- **API Version**: v1 (all API endpoints under `/api/v1/`)
- **Authentication**: Rodauth with JWT (token-based, stateless)
- **Database**: SQLite3 (production-ready, supports PostgreSQL for high-traffic)
- **Web server**: Puma
- **CORS**: Configured for `http://localhost:3000` with JWT token exposure

### Frontend (React + Vite)
- **Framework**: React 19.2 with React Router for client-side routing
- **Bundler**: Vite (vite-plugin-ruby integration)
- **Source location**: `app/frontend/` directory
- **Entrypoint**: `app/frontend/entrypoints/application.jsx`
- **Vite dev server**: Port 3036 (development) / 3037 (test)
- **Routing**: React Router handles all frontend routes, Rails serves the app for non-API paths
- **Styling**: Tailwind CSS v4
- **Search**: Fuse.js for fuzzy search in autocomplete

### Authentication Flow
- **JWT-based**: Stateless authentication using Rodauth JWT feature
- **Login**: POST `/auth/login` → Returns JWT in `Authorization` header
- **User data**: GET `/api/v1/me` → Returns user details (id, email, status)
- **Logout**: POST `/auth/logout` → Invalidates JWT refresh token
- **Token storage**: Client-side in localStorage

### Routing Strategy
- `/auth/*` → Rodauth authentication endpoints
- `/api/v1/*` → Versioned API endpoints
- `/up` → Rails health check
- `/vite-dev/*` → Vite assets (development)
- `/*` (all other routes) → React app (catch-all)

### Rails Solid* Stack
- **solid_cache**: Database-backed Rails.cache
- **solid_queue**: Database-backed Active Job adapter
- **solid_cable**: Database-backed Action Cable adapter

## Development Commands

### Starting the Application

```bash
# Start both Rails server and Vite dev server
bin/dev

# Or manually start services:
# Terminal 1: Rails server (port 3000)
bin/rails s

# Terminal 2: Vite dev server (port 3036)
bin/vite dev
```

### User Management (CLI)

Since registration is disabled for single-user setup, use rake tasks:

```bash
# Create first user
rake user:create EMAIL=admin@example.com PASSWORD=yourpassword

# List all users
rake user:list

# Delete a user
rake user:delete EMAIL=admin@example.com
```

### Database Operations

```bash
# Setup database
bin/rails db:setup

# Run migrations
bin/rails db:migrate

# Reset database (WARNING: destroys all data)
bin/rails db:reset
```

### Testing

```bash
# Run all tests
bin/rails test

# Run specific test file
bin/rails test test/models/some_model_test.rb

# Run specific test by line number
bin/rails test test/models/some_model_test.rb:10
```

### Code Quality

**Ruby/Rails:**
```bash
# Run RuboCop linter (Rails Omakase style guide)
bin/rubocop

# Auto-correct RuboCop offenses
bin/rubocop -a

# Run Brakeman security scanner
bin/brakeman
```

**JavaScript/React:**
```bash
# Run ESLint on frontend code
npm run lint

# Auto-fix ESLint issues
npm run lint:fix
```

### Dependency Management

```bash
# Install Ruby dependencies
bundle install

# Install JavaScript dependencies
npm install

# Update gems
bundle update

# Update npm packages
npm update
```

## Important Configuration Details

### Rodauth Authentication
- **Config**: `app/misc/rodauth_main.rb`
- **Enabled features**: login, logout, jwt, jwt_refresh, json, reset_password, change_password, change_login, close_account
- **Disabled features**: create_account (use CLI), verify_account (not needed for single-user)
- **JWT secret**: Uses `Rails.application.credentials.secret_key_base`
- **Routes prefix**: `/auth`
- **JSON only**: `only_json? true` - no HTML responses

### API Versioning
- **Current version**: v1
- **Base path**: `/api/v1/`
- **Available endpoints**:
  - `GET /api/v1/me` - Get current user details (requires JWT)
  - `/api/v1/catalog/categories` - Catalog category management
  - `/api/v1/catalog/items` - Catalog item management
  - `/api/v1/shopping/sessions` - Shopping session management
  - `/api/v1/shopping/items` - Shopping backlog item management

### CORS Configuration
- **Config**: `config/initializers/cors.rb`
- **Allowed origin**: `http://localhost:3000` (update for production)
- **Exposed headers**: `Authorization` (for JWT token)
- **Credentials**: Enabled

### Vite Configuration
- Frontend source files in `app/frontend/` directory
- Components in `app/frontend/components/`
- Contexts (like AuthContext) in `app/frontend/contexts/`
- Vite config in `vite.config.ts` and `config/vite.json`
- React plugin enabled for JSX support

### Frontend Features
- **Smart Autocomplete**: Fuzzy search with Fuse.js, starts at first character, catalog caching
- **Visual Feedback**: 2-second glow animation for newly added items (CSS-based, no state management)
- **Accessibility**: Keyboard navigation support, proper ARIA roles, form label associations
- **UX Optimizations**:
  - "Create new item" only shows when query is 3+ chars and no 95%+ similarity matches
  - Items grouped by category when multiple categories present
  - Session-based shopping workflow

### ESLint Configuration
- **Config**: `eslint.config.js` (modern flat config format)
- **Plugins**: React, React Hooks, JSX Accessibility
- **Rules**: Modern React patterns (no React import needed), hooks best practices, accessibility warnings
- **Status**: All files pass linting with 0 errors and 0 warnings
- **VSCode Integration**: Auto-fix on save enabled (see `.vscode/README.md`)
- **Required VSCode extensions**:
  - ESLint (`dbaeumer.vscode-eslint`) - Linting and auto-fix
  - Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`) - Autocomplete for Tailwind classes

### React Router Setup
- **Routes**:
  - `/` → Dashboard (protected)
  - `/login` → Login page (public, redirects if authenticated)
- **Protected routes**: Use `<ProtectedRoute>` wrapper component
- **Auth context**: `useAuth()` hook provides user, token, login, logout, isAuthenticated

### Database Schema
- **accounts**: Main user table (id, email, password_hash, status)
- **account_password_reset_keys**: Password reset tokens
- **account_login_change_keys**: Email change verification
- **account_jwt_refresh_keys**: JWT refresh tokens

## Self-Hosting Considerations

### Single-User Mode
- Registration disabled by default (enable by uncommenting `:create_account` in rodauth_main.rb)
- Users created via CLI rake tasks
- Database schema supports multiple users (ready for expansion)

### Deployment Options
- **SQLite**: Suitable for single-user or low-traffic deployments
- **PostgreSQL**: Recommended for high-traffic or multi-user deployments
- **Kamal**: Available for containerized deployment (`bin/kamal`)
- **Thruster**: Available for Puma acceleration (`bin/thrust`)

### Environment Variables
- `RAILS_ENV`: Set to `production` for production deployment
- `SECRET_KEY_BASE`: Required for production (generates JWT secret)

## Future Expansion

### Enabling Multi-User Registration
1. Uncomment `:create_account` in `app/misc/rodauth_main.rb:8`
2. Optionally enable `:verify_account` for email verification
3. Create signup UI in React
4. Update routes to include `/api/v1/accounts` endpoint for registration

### Adding Features
- All API endpoints should be versioned under `/api/v1/`
- New React routes go in `app/frontend/components/App.jsx`
- Protected API endpoints should use `rodauth.require_authentication`
- New Rodauth features can be enabled in `app/misc/rodauth_main.rb`
