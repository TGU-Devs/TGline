# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_06_16_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "comments", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "deleted_at"
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id", "created_at"], name: "index_comments_on_post_id_and_created_at"
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "course_offerings", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.integer "academic_year"
    t.integer "semester", null: false
    t.string "teacher_name", null: false
    t.integer "day_of_week"
    t.integer "period"
    t.string "campus", null: false
    t.string "classroom"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "delivery_method", default: 0, null: false
    t.integer "target_grade", default: 0, null: false
    t.index ["academic_year"], name: "index_course_offerings_on_academic_year"
    t.index ["course_id", "academic_year", "semester", "teacher_name", "day_of_week", "delivery_method", "target_grade", "period"], name: "index_course_offerings_on_unique_schedule", unique: true
    t.index ["course_id"], name: "index_course_offerings_on_course_id"
    t.index ["delivery_method"], name: "index_course_offerings_on_delivery_method"
    t.index ["semester"], name: "index_course_offerings_on_semester"
    t.index ["target_grade"], name: "index_course_offerings_on_target_grade"
  end

  create_table "course_reviews", force: :cascade do |t|
    t.bigint "course_id", null: false
    t.bigint "course_offering_id"
    t.bigint "user_id", null: false
    t.integer "rating", null: false
    t.integer "difficulty", null: false
    t.integer "workload", null: false
    t.integer "attendance", null: false
    t.integer "grading", null: false
    t.integer "exam_presence", default: 0, null: false
    t.integer "attendance_check", default: 0, null: false
    t.boolean "textbook_required", default: false, null: false
    t.text "comment"
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["attendance_check"], name: "index_course_reviews_on_attendance_check"
    t.index ["course_id"], name: "index_course_reviews_on_course_id"
    t.index ["course_offering_id"], name: "index_course_reviews_on_course_offering_id"
    t.index ["deleted_at"], name: "index_course_reviews_on_deleted_at"
    t.index ["exam_presence"], name: "index_course_reviews_on_exam_presence"
    t.index ["user_id", "course_id"], name: "index_active_course_reviews_on_user_id_and_course_id", unique: true, where: "(deleted_at IS NULL)"
    t.index ["user_id"], name: "index_course_reviews_on_user_id"
  end

  create_table "courses", force: :cascade do |t|
    t.string "name", null: false
    t.string "faculty", null: false
    t.string "department", null: false
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "created_by_id"
    t.index ["created_by_id"], name: "index_courses_on_created_by_id"
    t.index ["department"], name: "index_courses_on_department"
    t.index ["faculty"], name: "index_courses_on_faculty"
    t.index ["name", "faculty", "department", "category"], name: "index_courses_on_name_and_faculty_and_department_and_category"
    t.index ["name"], name: "index_courses_on_name"
  end

  create_table "likes", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_likes_on_post_id"
    t.index ["user_id", "post_id"], name: "index_likes_on_user_id_and_post_id", unique: true
    t.index ["user_id"], name: "index_likes_on_user_id"
  end

  create_table "post_tags", force: :cascade do |t|
    t.bigint "post_id", null: false
    t.bigint "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id", "tag_id"], name: "index_post_tags_on_post_id_and_tag_id", unique: true
    t.index ["post_id"], name: "index_post_tags_on_post_id"
    t.index ["tag_id"], name: "index_post_tags_on_tag_id"
  end

  create_table "posts", force: :cascade do |t|
    t.string "title"
    t.text "body"
    t.datetime "deleted_at"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name"
    t.integer "category", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "display_name", null: false
    t.string "role", default: "user", null: false
    t.datetime "deleted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "description"
    t.string "provider"
    t.string "uid"
    t.string "email_verification_token"
    t.datetime "email_verification_sent_at"
    t.datetime "email_verified_at"
    t.index ["deleted_at"], name: "index_users_on_deleted_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["email_verification_token"], name: "index_users_on_email_verification_token", unique: true
    t.index ["email_verified_at"], name: "index_users_on_email_verified_at"
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "course_offerings", "courses"
  add_foreign_key "course_reviews", "course_offerings"
  add_foreign_key "course_reviews", "courses"
  add_foreign_key "course_reviews", "users"
  add_foreign_key "courses", "users", column: "created_by_id"
  add_foreign_key "likes", "posts"
  add_foreign_key "likes", "users"
  add_foreign_key "post_tags", "posts"
  add_foreign_key "post_tags", "tags"
  add_foreign_key "posts", "users"
end
