# Idempotent demo data for local development. Run with: bin/rails db:seed
# Development only: `db:prepare` seeds automatically when it creates a new database,
# and seed rows in the test database would break tests that count records.
return unless Rails.env.development?

[
  { name: "First sample item", description: "Created by db/seeds.rb" },
  { name: "Second sample item" }
].each do |attributes|
  SampleItem.find_or_create_by!(name: attributes[:name]) do |item|
    item.description = attributes[:description]
  end
end
