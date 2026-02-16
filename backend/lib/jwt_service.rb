# JWTトークンの生成・検証を行うサービスクラス
class JwtService
  # シークレットキー（環境ごとにRailsが自動解決: dev=自動生成, prod=credentials or ENV["SECRET_KEY_BASE"]）
  SECRET_KEY = Rails.application.secret_key_base

  # トークンの有効期限（7日）
  # TODO: 今はAccessTokenだけしか実装していないので今後リフレッシュトークンも使う。
  EXPIRATION_TIME = 7.days

  # JWTトークンを生成
  # @param user_id [Integer] ユーザーID
  # @return [String] JWTトークン
  # encodeメソッドはgemが提供している
  def self.encode(user_id)
    payload = {
      user_id: user_id,
      exp: EXPIRATION_TIME.from_now.to_i
    }
    JWT.encode(payload, SECRET_KEY, 'HS256') # JWTはdevise-jwtに標準で使用されているアルゴリズム。公開鍵暗号方式使う
  end

  # JWTトークンをデコードして検証
  # @param token [String] JWTトークン
  # @return [Hash] デコードされたペイロード（user_idを含む）
  # @raise [JWT::DecodeError] トークンが無効な場合
  # @raise [JWT::ExpiredSignature] トークンが期限切れの場合
  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
    decoded[0] # ペイロードを返す
  rescue JWT::ExpiredSignature
    raise JWT::ExpiredSignature, 'Token has expired'
  rescue JWT::DecodeError => e
    raise JWT::DecodeError, 'Invalid token'
  end

  # トークンからユーザーIDを取得
  # @param token [String] JWTトークン
  # @return [Integer, nil] ユーザーID（無効な場合はnil）
  def self.user_id_from_token(token)
    payload = decode(token)
    payload['user_id']
  rescue JWT::ExpiredSignature, JWT::DecodeError
    nil
  end
end
