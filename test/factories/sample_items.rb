FactoryBot.define do
  factory :sample_item do
    name { Faker::Commerce.product_name }
    description { Faker::Lorem.sentence }

    trait :without_description do
      description { nil }
    end
  end
end
