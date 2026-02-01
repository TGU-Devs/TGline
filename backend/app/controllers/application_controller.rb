class ApplicationController < ActionController::API
  # 認証モジュール（concerns/authenticable.rb）
  include Authenticable
  # 認可モジュール（concerns/authorizable.rb）
  include Authorizable
  # cookie許可
  include ActionController::Cookies
end
