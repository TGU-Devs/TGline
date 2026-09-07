# frozen_string_literal: true

module Types
  module StudyApi
    class QueryType < ApplicationType
      field :post, PostType, null: false do
        argument :id, ID, required: true
      end

      field :posts, [PostType], null: false do
        argument :limit, Integer, required: false, default_value: 20
      end

      def post(id:)
        Post.active.includes(:user).find(id)
      rescue ActiveRecord::RecordNotFound
        GraphQL::ExecutionError.new(
          "Post is not found",
          extensions: { code: "NOT_FOUND" }
        )
      end

      def posts(limit:)
        Post.active
            .includes(:user)
            .order(created_at: :desc)
            .limit(limit.clamp(1, 50))
      end
    end
  end
end
