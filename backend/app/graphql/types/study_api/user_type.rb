# frozen_string_literal: true

module Types
  module StudyApi
    class UserType < ApplicationType
      field :id, ID, null: false
      field :display_name, String, null: false
    end
  end
end
