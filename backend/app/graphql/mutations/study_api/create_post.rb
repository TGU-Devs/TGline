# frozen_string_literal: true

module Mutations
  module StudyApi
    class CreatePost < ApplicationMutation
      argument :body, String, required: true
      argument :title, String, required: true
      argument :user_id, ID, required: true

      field :errors, [String], null: false
      field :post, Types::StudyApi::PostType, null: true

      def resolve(user_id:, title:, body:)
        user = User.active.find_by(id: user_id)
        unless user
          return {
            post: nil,
            errors: ["User is not found"]
          }
        end

        post = user.posts.build(title:, body:)

        if post.save
          { post:, errors: [] }
        else
          { post: nil, errors: post.errors.full_messages }
        end
      end
    end
  end
end
