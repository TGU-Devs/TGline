class ApplicationMailer < ActionMailer::Base
  DEFAULT_FROM_ADDRESS = ENV["MAILER_FROM_ADDRESS"].presence || "noreply@tgline.example.com"

  default from: "TGline <#{DEFAULT_FROM_ADDRESS}>"
  layout "mailer"

  before_action :set_mailer_branding

  private

  def set_mailer_branding
    frontend_url = ENV.fetch("FRONTEND_URL", "http://localhost:3000").chomp("/")
    @mailer_logo_url = "#{frontend_url}/TGline-nobg2.png"
  end
end
