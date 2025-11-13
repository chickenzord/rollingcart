namespace :user do
  desc "Create a new user account (Usage: rake user:create EMAIL=user@example.com PASSWORD=yourpassword)"
  task create: :environment do
    email = ENV["EMAIL"]
    password = ENV["PASSWORD"]

    if email.blank? || password.blank?
      puts "Error: EMAIL and PASSWORD are required"
      puts "Usage: rake user:create EMAIL=user@example.com PASSWORD=yourpassword"
      exit 1
    end

    require "bcrypt"

    account = Account.new(
      email: email,
      status: "verified", # Skip email verification for single-user setup
      password_hash: BCrypt::Password.create(password, cost: BCrypt::Engine::DEFAULT_COST)
    )

    if account.save
      puts "✓ User created successfully!"
      puts "  Email: #{account.email}"
      puts "  ID: #{account.id}"
    else
      puts "✗ Failed to create user:"
      account.errors.full_messages.each do |message|
        puts "  - #{message}"
      end
      exit 1
    end
  end

  desc "List all user accounts"
  task list: :environment do
    accounts = Account.all

    if accounts.empty?
      puts "No user accounts found."
      puts "\nTo create your first user:"
      puts "  rake user:create EMAIL=user@example.com PASSWORD=yourpassword"
    else
      puts "User Accounts:"
      puts "-" * 60
      accounts.each do |account|
        puts "ID: #{account.id}"
        puts "Email: #{account.email}"
        puts "Status: #{account.status}"
        puts "Created: #{account.created_at}"
        puts "-" * 60
      end
      puts "\nTotal: #{accounts.count} user(s)"
    end
  end

  desc "Delete a user account (Usage: rake user:delete EMAIL=user@example.com)"
  task delete: :environment do
    email = ENV["EMAIL"]

    if email.blank?
      puts "Error: EMAIL is required"
      puts "Usage: rake user:delete EMAIL=user@example.com"
      exit 1
    end

    account = Account.find_by(email: email)

    if account.nil?
      puts "✗ User not found: #{email}"
      exit 1
    end

    account.destroy
    puts "✓ User deleted successfully: #{email}"
  end
end
