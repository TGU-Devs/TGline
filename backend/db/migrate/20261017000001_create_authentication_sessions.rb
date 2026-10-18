class CreateAuthenticationSessions < ActiveRecord::Migration[7.2]
  def change
    create_table :authentication_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :refresh_token_digest, null: false
      t.datetime :expires_at, null: false
      t.datetime :revoked_at

      t.timestamps
    end

    add_index :authentication_sessions, :refresh_token_digest, unique: true
    add_index :authentication_sessions, [:user_id, :revoked_at], name: "index_authentication_sessions_on_user_and_revoked_at"
  end
end
