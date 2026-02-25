class CreateTags < ActiveRecord::Migration[7.2]
  def change
    create_table :tags do |t|
      t.string :name
      t.integer :category, null: false

      t.timestamps
    end
    # マスターデータなのでマイグレーションに入れる
    # タグを増やしたい時は Tag::DEFINITIONS を編集 + 新しいマイグレーションで追加INSERT、という流れ
    reversible do |dir|
      dir.up do
        Tag::DEFINITIONS.each do |category, names|
          names.each do |name|
            execute <<~SQL
              INSERT INTO tags (name, category, created_at, updated_at)
              VALUES ('#{name}', #{Tag.categories[category]}, NOW(), NOW())
            SQL
          end
        end
      end
    end
  end
end
