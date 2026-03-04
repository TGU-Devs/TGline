class CreateTags < ActiveRecord::Migration[7.2]
  def change
    create_table :tags do |t|
      t.string :name
      t.integer :category, null: false

      t.timestamps
    end
    # タグのマスターデータは db:seed (find_or_create_by!) で投入する
    # タグを増やしたい時は Tag::DEFINITIONS を編集するだけでOK
  end
end
