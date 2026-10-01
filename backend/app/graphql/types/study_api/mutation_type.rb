# frozen_string_literal: true

module Types
  module StudyApi
    class MutationType < ApplicationType
      field :create_post, mutation: Mutations::StudyApi::CreatePost
    end
  end
end
