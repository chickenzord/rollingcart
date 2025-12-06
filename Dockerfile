# syntax=docker/dockerfile:1
# check=error=true

# This Dockerfile is designed for production, not development. Use with Kamal or build'n'run by hand:
# docker build -t rollingcart .
# docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value from config/master.key> --name rollingcart rollingcart

# For a containerized dev environment, see Dev Containers: https://guides.rubyonrails.org/getting_started_with_devcontainer.html

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=3.4.4

# Build arguments for versioning
ARG APP_VERSION=unknown
ARG GIT_COMMIT=unknown

FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

# Rails app lives here
WORKDIR /rails

# Install base packages and update CA certificates
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips sqlite3 ca-certificates && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build gems and Node.js for Vite
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libyaml-dev libssl-dev pkg-config curl && \
    curl -fsSL https://deb.nodesource.com/setup_23.x | bash - && \
    apt-get install --no-install-recommends -y nodejs && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Create rails user and group for build
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R rails:rails /rails

# Switch to rails user for all build operations
USER 1000:1000

# Install application gems
COPY --chown=rails:rails Gemfile Gemfile.lock ./
RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# Install JavaScript dependencies (including dev for build tools)
COPY --chown=rails:rails package.json package-lock.json ./
RUN npm ci && \
    rm -rf ~/.npm

# Copy application code
COPY --chown=rails:rails . .

# Precompile bootsnap code for faster boot times
RUN SECRET_KEY_BASE_DUMMY=1 bundle exec bootsnap precompile app/ lib/

# Build Vite frontend (React app)
RUN SECRET_KEY_BASE_DUMMY=1 bin/vite build




# Final stage for app image
FROM base

# Pass build args to final stage
ARG APP_VERSION=unknown
ARG GIT_COMMIT=unknown

# Set as environment variables (available at runtime)
ENV APP_VERSION=${APP_VERSION} \
    GIT_COMMIT=${GIT_COMMIT}

# Add labels for image metadata
LABEL org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.title="RollingCart" \
      org.opencontainers.image.description="Shopping list app for recurring grocery runs"

# Create rails user and group
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash

# Copy built artifacts: gems, application (already owned by rails:rails from build stage)
COPY --from=build --chown=rails:rails "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build --chown=rails:rails /rails /rails

# Switch to rails user
USER 1000:1000

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start server via Thruster by default, this can be overwritten at runtime
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
