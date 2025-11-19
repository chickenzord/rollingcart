# Default Catalog Seed Data

This directory contains predefined catalog data organized by store type.

## File Structure

Each YAML file represents a different store type with categories and items:

**Grocery Store (split into 4 files for better token efficiency):**
- `grocery_fresh.yml` - Fresh Produce, Meat and Seafood, Dairy and Eggs, Bakery and Bread
- `grocery_pantry.yml` - Dry Goods and Pasta, Canned and Jarred, Frozen Foods
- `grocery_seasonings.yml` - Condiments and Sauces, Spices and Baking
- `grocery_other.yml` - Beverages, Breakfast and Cereal, Snacks and Sweets, Personal Care, Health and Medicine, Baby and Pet

**Other Stores:**
- `kitchen_household.yml` - Kitchen tools & household supplies (4 categories)
- `hardware_store.yml` - Hardware & home improvement (4 categories)
- `stationery_office.yml` - Office & school supplies (3 categories)

## YAML Format

```yaml
categories:
  - name: Category Name
    description: Optional description of what's in this category
    items:
      - name: Item Name
        description: Optional description (only for disambiguation)
      - name: Another Item
        description: null
```

## Idempotency

The seeding process is **idempotent** - you can run it multiple times safely:

- **Categories**: Uses `find_or_create_by(name)` - won't duplicate existing categories
- **Items**: Uses `find_or_create_by(name, account, category)` - won't duplicate existing items
- Running the seed task multiple times will skip existing records and only create new ones

## Usage

Seed all catalogs for a user:
```bash
EMAIL=user@example.com bin/rails catalog:seed
```

Seed specific catalog files only:
```bash
EMAIL=user@example.com FILES=grocery_fresh.yml bin/rails catalog:seed
EMAIL=user@example.com FILES=grocery_fresh.yml,grocery_seasonings.yml bin/rails catalog:seed
EMAIL=user@example.com FILES=kitchen_household.yml,hardware_store.yml bin/rails catalog:seed
```

## Output

The task will show:
- Categories created (new)
- Categories skipped (already exist)
- Items created (new)
- Items skipped (already exist)

## Adding Items

To add items to a category, edit the YAML file:

```yaml
categories:
  - name: Fresh Produce
    description: Fruits and vegetables
    items:
      - name: Apples
        description: null
      - name: Bananas
        description: null
      - name: Carrots
        description: null
```

## Design Principles

- No item duplication across store types
- Descriptions only for disambiguation (e.g., "AA batteries" vs "AAA batteries")
- Categories have descriptions explaining their scope
- Focus on common, recognizable items
