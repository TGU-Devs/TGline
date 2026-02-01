class ApplicationController < ActionController::API
  # concerns/authenticable.rbにあるモジュールを読み込む
  include Authenticable
  # TODO: 認可のモジュールを追加する
end
