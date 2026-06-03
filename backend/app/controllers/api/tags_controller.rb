module Api
  class TagsController < ApplicationController
    skip_before_action :authenticate_user!, only: [:index]

    def index
      tags = Tag.all
      tags = tags.where(category: Tag.categories[params[:category]]) if params[:category].present?

      ordered = tags.sort_by do |tag|
        names = Tag::DEFINITIONS[tag.category.to_sym] || []
        names.index(tag.name) || names.size
      end

      render json: ordered.map { |tag| tag_response(tag) }, status: :ok
    end

    private

    def tag_response(tag)
      {
        id: tag.id,
        name: tag.name,
        category: tag.category
      }
    end
  end
end
