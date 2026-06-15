# frozen_string_literal: true

# 認可（Authorization）関連のconcern
# ユーザーの権限に基づいてアクセス制御を行う
module Authorizable
  extend ActiveSupport::Concern

  def forbidden_error(message = '権限がありません')
    render json: { error: 'forbidden', message: message }, status: :forbidden
  end


  def authorize_admin!
    return if current_user&.admin?

    forbidden_error('管理者のみアクセス可能です')
  end


  def authorize_owner_or_admin!(resource, owner_attribute: :user_id)
    return if current_user&.admin?
    return if resource.send(owner_attribute) == current_user&.id

    forbidden_error('このリソースへのアクセス権限がありません')
  end

  def authorize_owner!(resource, owner_attribute: :user_id)
    return if resource.send(owner_attribute) == current_user&.id

    forbidden_error('このリソースの所有者のみアクセス可能です')
  end


  def authorize_roles!(*roles)
    return if roles.include?(current_user&.role)

    forbidden_error("許可されたロール: #{roles.join(', ')}")
  end

  # 現在のユーザーが管理者かどうか
  def admin?
    current_user&.admin?
  end

  def owner?(resource, owner_attribute: :user_id)
    resource.send(owner_attribute) == current_user&.id
  end

  def owner_or_admin?(resource, owner_attribute: :user_id)
    admin? || owner?(resource, owner_attribute: owner_attribute)
  end
end
