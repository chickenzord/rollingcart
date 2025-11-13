namespace :catalog do
  desc "Seed predefined categories and items for a specific account"
  task seed: :environment do
    email = ENV["EMAIL"]

    if email.blank?
      puts "❌ Error: EMAIL environment variable is required"
      puts "Usage: EMAIL=user@example.com bin/rails catalog:seed"
      exit 1
    end

    account = Account.find_by(email: email)

    if account.nil?
      puts "❌ Error: Account with email '#{email}' not found"
      exit 1
    end

    puts "🌱 Seeding catalog for account: #{account.email} (#{account.id})"

    seeder = Catalog::Seeder.new(account)
    result = seeder.seed_default_catalog

    case result[:status]
    when :success
      puts "\n✅ Seeding complete!"
      puts "   Categories created: #{result[:categories_created]}"
      puts "   Items created: #{result[:items_created]}"
    when :skipped
      puts "\n⏭️  Seeding skipped: #{result[:reason]}"
    when :error
      puts "\n❌ Error during seeding: #{result[:message]}"
      exit 1
    end
  end
end
