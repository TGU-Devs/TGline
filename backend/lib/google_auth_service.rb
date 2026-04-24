# frozen_string_literal: true

require 'google-id-token'

class GoogleAuthService
  class InvalidToken < StandardError; end

  def initialize
    @validator = GoogleIDToken::Validator.new
  end

  def verify(id_token)
    payload = @validator.check(id_token, ENV['GOOGLE_CLIENT_ID'])

    {
      email: payload['email'],
      name: payload['name'],
      uid: payload['sub']
    }
  rescue GoogleIDToken::ValidationError => e
    raise InvalidToken, "Google IDトークンの検証に失敗しました: #{e.message}"
  end
end
