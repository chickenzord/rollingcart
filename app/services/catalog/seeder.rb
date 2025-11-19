module Catalog
  class Seeder
    attr_reader :account

    def initialize(account)
      @account = account
    end

    # Seed catalog from one or more YAML files
    # Files should be in db/default_catalog/ directory
    # Pass file names without path, e.g., ['grocery_store.yml', 'kitchen_household.yml']
    def seed_default_catalog(file_names = nil)
      file_names ||= default_catalog_files

      created_categories = 0
      created_items = 0
      skipped_categories = 0
      skipped_items = 0

      file_names.each do |file_name|
        catalog_data = load_catalog_data(file_name)
        categories = catalog_data["categories"] || []

        categories.each do |category_data|
          category = find_or_create_category(category_data)

          if category.previously_new_record?
            created_categories += 1
          else
            skipped_categories += 1
          end

          items_data = category_data["items"] || []
          items_data.each do |item_data|
            item = find_or_create_item(category, item_data)

            if item.previously_new_record?
              created_items += 1
            else
              skipped_items += 1
            end
          end
        end
      end

      {
        status: :success,
        categories_created: created_categories,
        categories_skipped: skipped_categories,
        items_created: created_items,
        items_skipped: skipped_items
      }
    rescue StandardError => e
      {
        status: :error,
        message: e.message
      }
    end

    private

    def default_catalog_files
      [
        "grocery_fresh.yml",
        "grocery_pantry.yml",
        "grocery_seasonings.yml",
        "grocery_other.yml",
        "kitchen_household.yml",
        "hardware_store.yml",
        "stationery_office.yml"
      ]
    end

    def load_catalog_data(file_name)
      file_path = Rails.root.join("db", "default_catalog", file_name)
      YAML.load_file(file_path)
    end

    # Idempotent: find existing or create new category
    def find_or_create_category(category_data)
      account.catalog_categories.find_or_create_by!(
        name: category_data["name"]
      ) do |category|
        category.description = category_data["description"]
      end
    end

    # Idempotent: find existing or create new item
    def find_or_create_item(category, item_data)
      category.items.find_or_create_by!(
        name: item_data["name"],
        account: account
      ) do |item|
        item.description = item_data["description"]
      end
    end
  end
end
