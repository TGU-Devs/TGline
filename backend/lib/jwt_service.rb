class JwtService
  SECRET_KEY = Rails.application.secret_key_base

  # TODO: 今はAccessTokenだけしか実装していないので今後リフレッシュトークンも使う。

  EXPIRATION_TIME = 7.days

  def self.encode(user_id)
    payload = {
      user_id: user_id,
      exp: EXPIRATION_TIME.from_now.to_i
    }

    JWT.encode(payload, SECRET_KEY, 'HS256')
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })
    decoded[0]
  rescue JWT::ExpiredSignature
    raise JWT::ExpiredSignature, 'Token has expired'
  rescue JWT::DecodeError
    raise JWT::DecodeError, 'Invalid token'
  end

  def self.user_id_from_token(token)
    payload = decode(token)
    payload['user_id']
  rescue JWT::ExpiredSignature, JWT::DecodeError
    nil
  end
end
