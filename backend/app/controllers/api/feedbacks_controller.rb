class Api::FeedbacksController < ApplicationController
  before_action :authenticate_user!
  #before_action :authorize_admin!, only: [:index, :show, :update]

  # POST /api/feedbacks
  # ユーザーがフィードバックを送信
  def create
    feedback = current_user.feedbacks.build(feedback_params)
    
    if feedback.save
      render json: {
        message: "フィードバックを送信しました",
        feedback: feedback_response(feedback)
      }, status: :created
    else
      render json: { errors: feedback.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # === 以下は将来の管理画面用(v0では未使用)===

  # GET /api/feedbacks
  # 管理者がフィードバック一覧を取得
  # def index
  #   feedbacks = Feedback.active.order(created_at: :desc)
  #   feedbacks = feedbacks.by_status(params[:status]) if params[:status].present?
  #   feedbacks = feedbacks.by_category(params[:category]) if params[:category].present?
  #   
  #   render json: {
  #     feedbacks: feedbacks.map { |f| feedback_response(f) },
  #     total: feedbacks.count
  #   }
  # end

  # GET /api/feedbacks/:id
  # 管理者がフィードバック詳細を取得
  # def show
  #   feedback = Feedback.active.find(params[:id])
  #   render json: feedback_response(feedback, detail: true)
  # end

  # PATCH /api/feedbacks/:id
  # 管理者がステータス更新・メモ追加
  # def update
  #   feedback = Feedback.active.find(params[:id])
  #   feedback.assign_attributes(admin_update_params)
  #   feedback.reviewed_at = Time.current
  #   feedback.reviewed_by = current_user.id
  #   
  #   if feedback.save
  #     render json: {
  #       message: "フィードバックを更新しました",
  #       feedback: feedback_response(feedback, detail: true)
  #     }
  #   else
  #     render json: { errors: feedback.errors.full_messages }, status: :unprocessable_entity
  #   end
  # end

  private

  def feedback_params
    params.require(:feedback).permit(:category, :subject, :body)
  end

  # def admin_update_params
  #   params.require(:feedback).permit(:status, :admin_notes)
  # end

  def feedback_response(feedback, detail: false)
    response = {
      id: feedback.id,
      category: feedback.category,
      subject: feedback.subject,
      status: feedback.status,
      created_at: feedback.created_at
    }

    if detail
      response.merge!(
        body: feedback.body,
        admin_notes: feedback.admin_notes,
        reviewed_at: feedback.reviewed_at,
        user: {
          id: feedback.user.id,
          display_name: feedback.user.display_name,
          email: feedback.user.email
        }
      )
    end

    response
  end
end
