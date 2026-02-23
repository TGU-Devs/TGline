# frozen_string_literal: true

require 'google-id-token'

# Google IDトークンの検証を行うサービスクラス
class GoogleAuthService
  class InvalidToken < StandardError; end
  # 検証のインスタンスを作成
  def initialize
    @validator = GoogleIDToken::Validator.new
  end

  # Google IDトークンを検証し、ペイロードを返す
  # @param id_token [String] Google IDトークン
  # @return [Hash] { email:, name:, uid: }
  # @raise [InvalidToken] トークンが無効な場合
  def verify(id_token)
    # トークンを検証し、ペイロードを返す。(id_tokenとOAuthのクライアントID(公開鍵)を検証する)
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
