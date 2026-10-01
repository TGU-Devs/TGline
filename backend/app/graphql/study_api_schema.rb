# frozen_string_literal: true

class StudyApiSchema < GraphQL::Schema
  max_depth 10

  query Types::StudyApi::QueryType
  mutation Types::StudyApi::MutationType

  use GraphQL::Dataloader
end
