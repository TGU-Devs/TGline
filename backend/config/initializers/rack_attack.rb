# frozen_string_literal: true

class Rack::Attack
  throttle("password_reset_request/ip", limit: 5, period: 1.hour) do |req|
    req.ip if req.post? && req.path == "/api/users/password_reset"
  end

  throttle("password_reset_execute/ip", limit: 10, period: 1.hour) do |req|
    req.ip if req.patch? && req.path == "/api/users/password_reset"
  end

  throttle("email_verification_request/ip", limit: 10, period: 1.hour) do |req|
    req.ip if req.post? && req.path == "/api/users/email_verification"
  end

  throttle("email_verification_execute/ip", limit: 20, period: 1.hour) do |req|
    req.ip if req.patch? && req.path == "/api/users/email_verification"
  end

  self.throttled_responder = lambda do |_req|
    [
      429,
      { "Content-Type" => "application/json" },
      [{ error: "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。" }.to_json]
    ]
  end
end
