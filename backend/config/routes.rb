Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"
  namespace :api do

    # 認証・ユーザー関連
    namespace :users do
      post "sign_up", to: "registrations#create"
      post "sign_in", to: "sessions#create"
      post "google_sign_in", to: "google_sessions#create"
      delete "sign_out", to: "sessions#destroy"
      get "me", to: "me#show"
      patch "me", to: "me#update"
      patch "password", to: "passwords#update"
      post "password_reset", to: "password_resets#create"
      patch "password_reset", to: "password_resets#update"
      post "email_verification", to: "email_verifications#create"
      patch "email_verification", to: "email_verifications#update"
      delete "me", to: "me#destroy"
    end
    resources :users, only: [:index, :show]

    # 管理者用
    namespace :admin do
      get "stats", to: "stats#index"
      resources :courses, only: [:index, :create, :update]
      resources :course_offerings, only: [:index, :create, :update]
    end

    # タグ関連
    resources :tags, only: [:index]

    # 授業評価関連
    resources :courses, only: [:index, :show, :create, :update] do
      resources :course_offerings, only: [:create]
      resources :reviews, controller: "course_reviews", only: [:index, :create]
    end
    resources :course_reviews, only: [:update, :destroy]

    # 投稿関連
    resources :posts, only: [:index, :show, :create, :update, :destroy] do
      resource :likes, only: [:create, :destroy]
      resources :comments, only: [:index, :create, :destroy]
    end
  end
end
