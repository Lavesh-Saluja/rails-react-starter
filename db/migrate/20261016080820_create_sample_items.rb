class CreateSampleItems < ActiveRecord::Migration[8.1]
  def change
    create_table :sample_items do |t|
      t.string :name, null: false, limit: 100
      t.text :description

      t.timestamps
    end
  end
end
