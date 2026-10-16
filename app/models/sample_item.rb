class SampleItem < ApplicationRecord
  normalizes :name, with: ->(name) { name.strip }

  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 1000 }
end
