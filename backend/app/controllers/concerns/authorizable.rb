# frozen_string_literal: true

# 認可（Authorization）関連のconcern
# ユーザーの権限に基づいてアクセス制御を行う
module Authorizable
  extend ActiveSupport::Concern

  # 403 Forbidden エラーを返す
  # 認証は通っているが、権限がない場合に使用
  def forbidden_error(message = '権限がありません')
    render json: { error: 'forbidden', message: message }, status: :forbidden
  end

  # 管理者のみアクセス可能（管理画面）
  # before_actionで使用
  def authorize_admin!
    return if current_user&.admin?

    forbidden_error('管理者のみアクセス可能です')
  end

  # リソースの所有者または管理者のみアクセス可能
  # @param resource [ApplicationRecord] チェック対象のリソース
  # @param owner_attribute [Symbol] 所有者を示す属性名（デフォルト: :user_id）
  def authorize_owner_or_admin!(resource, owner_attribute: :user_id)
    return if current_user&.admin?
    return if resource.send(owner_attribute) == current_user&.id

    forbidden_error('このリソースへのアクセス権限がありません')
  end

  # リソースの所有者のみアクセス可能（管理者でも不可）
  # @param resource [ApplicationRecord] チェック対象のリソース
  # @param owner_attribute [Symbol] 所有者を示す属性名（デフォルト: :user_id）
  def authorize_owner!(resource, owner_attribute: :user_id)
    return if resource.send(owner_attribute) == current_user&.id

    forbidden_error('このリソースの所有者のみアクセス可能です')
  end

  # 複数のロールのいずれかを持っているかチェック
  # @param roles [Array<String>] 許可するロールの配列
  def authorize_roles!(*roles)
    return if roles.include?(current_user&.role)

    forbidden_error("許可されたロール: #{roles.join(', ')}")
  end

  # 現在のユーザーが管理者かどうか
  def admin?
    current_user&.admin?
  end

  # 現在のユーザーがリソースの所有者かどうか
  # @param resource [ApplicationRecord] チェック対象のリソース
  # @param owner_attribute [Symbol] 所有者を示す属性名（デフォルト: :user_id）
  def owner?(resource, owner_attribute: :user_id)
    resource.send(owner_attribute) == current_user&.id
  end

  # 現在のユーザーがリソースの所有者または管理者かどうか
  # @param resource [ApplicationRecord] チェック対象のリソース
  # @param owner_attribute [Symbol] 所有者を示す属性名（デフォルト: :user_id）
  def owner_or_admin?(resource, owner_attribute: :user_id)
    admin? || owner?(resource, owner_attribute: owner_attribute)
  end
end
