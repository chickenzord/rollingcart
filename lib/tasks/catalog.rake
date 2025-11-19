namespace :catalog do
  namespace :seed do
    desc "List all seed items and find duplicates"
    task list_items: :environment do
    catalog_dir = Rails.root.join("db", "default_catalog")
    all_files = Dir.glob(catalog_dir.join("*.yml"))

    # Hash to store items by name with their locations
    items_map = Hash.new { |h, k| h[k] = [] }
    total_items = 0

    all_files.sort.each do |file_path|
      filename = File.basename(file_path)
      next if filename == "README.md"

      data = YAML.load_file(file_path)
      categories = data["categories"] || []

      categories.each do |category_data|
        category_name = category_data["name"]
        items = category_data["items"] || []

        items.each do |item_data|
          item_name = item_data["name"]
          items_map[item_name] << {
            file: filename,
            category: category_name,
            description: item_data["description"]
          }
          total_items += 1
        end
      end
    end

    # Sort items alphabetically
    sorted_items = items_map.keys.sort

    puts "📋 Total items: #{total_items}"
    puts "📋 Unique items: #{sorted_items.length}"
    puts ""

    # Find exact duplicates
    duplicates = items_map.select { |name, locations| locations.length > 1 }

    if duplicates.any?
      puts "⚠️  Found #{duplicates.length} duplicate item names:"
      puts ""
      duplicates.sort.each do |item_name, locations|
        puts "   ❌ #{item_name} (#{locations.length} times):"
        locations.each do |loc|
          desc = loc[:description] ? " - #{loc[:description]}" : ""
          puts "      • #{loc[:file]}: #{loc[:category]}#{desc}"
        end
        puts ""
      end
    else
      puts "✅ No exact duplicates found!"
      puts ""
    end

    # List all items if requested
    if ENV["VERBOSE"] == "true"
      puts "📝 All items:"
      puts ""
      sorted_items.each do |item_name|
        locations = items_map[item_name]
        location = locations.first
        desc = location[:description] ? " (#{location[:description]})" : ""
        puts "   • #{item_name}#{desc} - #{location[:file]}: #{location[:category]}"
      end
    else
      puts "💡 Run with VERBOSE=true to see all items:"
      puts "   bin/rails catalog:seed:list_items VERBOSE=true"
    end
    end
  end

  desc "Seed predefined categories and items for a specific account"
  task seed: :environment do
    email = ENV["EMAIL"]
    files = ENV["FILES"]&.split(",")

    if email.blank?
      puts "❌ Error: EMAIL environment variable is required"
      puts ""
      puts "Usage:"
      puts "  EMAIL=user@example.com bin/rails catalog:seed"
      puts "  EMAIL=user@example.com FILES=grocery_fresh.yml,grocery_pantry.yml bin/rails catalog:seed"
      puts ""
      puts "Available files:"
      puts "  - grocery_fresh.yml (Fresh Produce, Meat, Dairy, Bakery)"
      puts "  - grocery_pantry.yml (Dry Goods, Canned, Frozen)"
      puts "  - grocery_seasonings.yml (Condiments, Spices)"
      puts "  - grocery_other.yml (Beverages, Breakfast, Snacks, Personal Care, Health, Baby & Pet)"
      puts "  - kitchen_household.yml"
      puts "  - hardware_store.yml"
      puts "  - stationery_office.yml"
      exit 1
    end

    account = Account.find_by(email: email)

    if account.nil?
      puts "❌ Error: Account with email '#{email}' not found"
      exit 1
    end

    puts "🌱 Seeding catalog for account: #{account.email} (#{account.id})"
    if files
      puts "   Files: #{files.join(', ')}"
    else
      puts "   Files: All default catalogs"
    end

    seeder = Catalog::Seeder.new(account)
    result = seeder.seed_default_catalog(files)

    case result[:status]
    when :success
      puts "\n✅ Seeding complete!"
      puts "   Categories created: #{result[:categories_created]}"
      puts "   Categories skipped: #{result[:categories_skipped]} (already exist)"
      puts "   Items created: #{result[:items_created]}"
      puts "   Items skipped: #{result[:items_skipped]} (already exist)"
    when :error
      puts "\n❌ Error during seeding: #{result[:message]}"
      exit 1
    end
  end
end
