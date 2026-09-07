# frozen_string_literal: true

module StudyApi
  class GraphqlController < ApplicationController
    skip_before_action :authenticate_user!

    def execute
      result = StudyApiSchema.execute(
        params[:query],
        variables: variables,
        context: { current_user: current_user },
        operation_name: params[:operationName]
      )

      render json: result
    end

    private

    def variables
      value = params[:variables]

      case value
      when String
        value.present? ? JSON.parse(value) : {}
      when Hash, ActionController::Parameters
        value
      when nil
        {}
      else
        raise ArgumentError, "Unexpected variables parameter: #{value.class}"
      end
    end
  end
end
