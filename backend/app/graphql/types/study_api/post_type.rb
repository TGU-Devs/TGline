# frozen_string_literal: true

module Types
  module StudyApi
    class PostType < ApplicationType
      field :id, ID, null: false
      field :title, String
      field :body, String
      field :user, UserType, null: false
      field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    end
  end
end
