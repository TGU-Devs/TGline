class ApplicationController < ActionController::API
  # 認証モジュール（concerns/authenticable.rb）
  include Authenticable
  # 認可モジュール（concerns/authorizable.rb）
  include Authorizable
  # cookie許可
  include ActionController::Cookies

  # エラーをDiscordに通知するためのコード
  rescue_from StandardError do |e|
    notify_discord(e)
    raise e
  end

  private

  def university_email?(email)
    email.to_s.strip.downcase.end_with?("@g.tohoku-gakuin.ac.jp")
  end


  def notify_discord(error)
    return unless Rails.env.production?
    
    payload = {
      embeds: [{
        title: "🚨 #{error.class}",
        description: error.message.truncate(200),
        color: 16711680,
        fields: [
          { name: "Path", value: request.path, inline: true },
          { name: "Method", value: request.method, inline: true }
        ],
        timestamp: Time.current.iso8601
      }]
    }

    Net::HTTP.post(
      URI(ENV.fetch('DISCORD_WEBHOOK_URL')),
      payload.to_json,
      'Content-Type' => 'application/json'
    )
  rescue => e
    Rails.logger.error("Discord notify failed: #{e.message}")
  end
end
