# frozen_string_literal: true

class Rack::Attack
  # パスワードリセット要求（POST）: 同一IPから5回/1時間
  throttle("password_reset_request/ip", limit: 5, period: 1.hour) do |req|
    req.ip if req.post? && req.path == "/api/users/password_reset"
  end

  # パスワードリセット実行（PATCH）: 同一IPから10回/1時間（トークンブルートフォース防止）
  throttle("password_reset_execute/ip", limit: 10, period: 1.hour) do |req|
    req.ip if req.patch? && req.path == "/api/users/password_reset"
  end

  # レートリミット超過時のレスポンス
  self.throttled_responder = lambda do |_req|
    [
      429,
      { "Content-Type" => "application/json" },
      [{ error: "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。" }.to_json]
    ]
  end
end
