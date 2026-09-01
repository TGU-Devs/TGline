require "test_helper"
require "stringio"

class PostTest < ActiveSupport::TestCase
  setup do
    @user = create_test_user
  end

  test "accepts up to four supported images within the size limit" do
    post = build_post
    [
      ["image.jpg", "image/jpeg"],
      ["image.png", "image/png"],
      ["image.webp", "image/webp"],
      ["image.gif", "image/gif"]
    ].each do |filename, content_type|
      attach_image(post, filename: filename, content_type: content_type)
    end

    assert post.valid?
  end

  test "rejects more than four images" do
    post = build_post
    5.times { |index| attach_image(post, filename: "image-#{index}.jpg") }

    assert_not post.valid?
    assert post.errors[:images].any? { |message| message.include?("最大4枚") }
  end

  test "rejects an unsupported image content type" do
    post = build_post
    attach_image(post, filename: "document.pdf", content_type: "application/pdf")

    assert_not post.valid?
    assert post.errors[:images].any? { |message| message.include?("JPEG") }
  end

  test "rejects an image larger than five megabytes" do
    post = build_post
    attach_image(
      post,
      filename: "large.jpg",
      content: "a" * (Post::MAX_IMAGE_SIZE + 1)
    )

    assert_not post.valid?
    assert post.errors[:images].any? { |message| message.include?("5MB以下") }
  end

  test "rejects more than one faculty tag" do
    post = build_post
    post.tags = [
      Tag.create!(name: "情報学部", category: "faculty"),
      Tag.create!(name: "工学部", category: "faculty")
    ]

    assert_not post.valid?
    assert post.errors[:tags].any? { |message| message.include?("最大1つ") }
  end

  test "accepts one faculty tag" do
    post = build_post
    post.tags = [Tag.create!(name: "情報学部", category: "faculty")]

    assert post.valid?
  end

  test "soft delete marks the post and updates active and deleted scopes" do
    post = build_post
    post.save!

    assert_includes Post.active, post
    assert_not post.deleted?

    assert post.soft_delete
    assert post.deleted?
    assert_not_includes Post.active, post
    assert_includes Post.deleted, post
  end

  private

  def build_post
    Post.new(user: @user, title: "Test Post", body: "Test body")
  end

  def attach_image(post, filename:, content_type: "image/jpeg", content: "image-data")
    post.images.attach(
      io: StringIO.new(content),
      filename: filename,
      content_type: content_type,
      identify: false
    )
  end
end
