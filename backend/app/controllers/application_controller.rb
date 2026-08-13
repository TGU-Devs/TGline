class ApplicationController < ActionController::API
  include Authenticable
  include Authorizable
  include ActionController::Cookies

  rescue_from StandardError do |e|
    notify_discord(e)
    raise e
  end

  private

  def public_backend_url
    ENV.fetch('BACKEND_PUBLIC_URL', request.base_url).delete_suffix('/')
  end

  def avatar_response(user)
    return nil unless user&.avatar&.attached?

    {
      url: "#{public_backend_url}#{rails_blob_path(user.avatar, only_path: true)}",
      content_type: user.avatar.content_type,
      byte_size: user.avatar.byte_size
    }
  end

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
  rescue StandardError => e
    Rails.logger.error("Discord notify failed: #{e.message}")
  end
end
