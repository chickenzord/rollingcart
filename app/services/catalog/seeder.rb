module Catalog
  class Seeder
    attr_reader :account

    def initialize(account)
      @account = account
    end

    def seed_default_catalog
      return { status: :skipped, reason: "Account already has catalog data" } unless needs_seeding?

      catalog_data = load_catalog_data
      created_categories = 0
      created_items = 0

      catalog_data.each do |category_name, items_data|
        category = account.catalog_categories.create!(name: category_name)
        created_categories += 1

        items_data.each do |item_data|
          category.items.create!(
            name: item_data["name"],
            description: item_data["description"],
            account: account
          )
          created_items += 1
        end
      end

      {
        status: :success,
        categories_created: created_categories,
        items_created: created_items
      }
    rescue StandardError => e
      {
        status: :error,
        message: e.message
      }
    end

    private

    def needs_seeding?
      account.catalog_categories.empty?
    end

    def load_catalog_data(file_path = nil)
      file_path ||= Rails.root.join("db", "default_catalog_data.yml")
      YAML.load_file(file_path)
    end
  end
end
