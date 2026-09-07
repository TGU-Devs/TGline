# frozen_string_literal: true

namespace :graphql do
  namespace :study_api do
    desc "Dump the study GraphQL schema as SDL"
    task schema_generate: :environment do
      output_path = Rails.root.join("graphql/study_api/schema.graphql")
      FileUtils.mkdir_p(output_path.dirname)
      output_path.write(StudyApiSchema.to_definition)

      puts "Generated #{output_path}"
    end
  end
end
