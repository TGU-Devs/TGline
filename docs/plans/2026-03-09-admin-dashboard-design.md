# Admin Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an admin-only dashboard at `/admin` showing platform metrics (counts, trends, recent activity).

**Architecture:** Single API endpoint `GET /api/admin/stats` returns all metrics. Next.js proxies the request and renders a dashboard page with stat cards and activity lists. Sidebar gets an admin-only link.

**Tech Stack:** Rails 7.2 API, Next.js 15, shadcn/ui, Tailwind CSS, lucide-react

---

### Task 1: Rails — Admin Stats Controller

**Files:**
- Create: `backend/app/controllers/api/admin/stats_controller.rb`
- Modify: `backend/config/routes.rb`

**Step 1: Create the controller**

```ruby
# backend/app/controllers/api/admin/stats_controller.rb
module Api
  module Admin
    class StatsController < ApplicationController
      before_action :authorize_admin!

      def index
        today = Time.current.beginning_of_day..Time.current
        this_week = Time.current.beginning_of_week..Time.current

        render json: {
          counts: {
            users: User.active.count,
            posts: Post.active.count,
            comments: Comment.active.count
          },
          trends: {
            users_today: User.active.where(created_at: today).count,
            users_this_week: User.active.where(created_at: this_week).count,
            posts_today: Post.active.where(created_at: today).count,
            posts_this_week: Post.active.where(created_at: this_week).count,
            comments_today: Comment.active.where(created_at: today).count,
            comments_this_week: Comment.active.where(created_at: this_week).count
          },
          recent_activity: {
            posts: Post.active.includes(:user).order(created_at: :desc).limit(5).map { |p|
              {
                id: p.id,
                title: p.title,
                user_display_name: p.user&.display_name || "匿名",
                created_at: p.created_at.iso8601
              }
            },
            comments: Comment.active.includes(:user, :post).order(created_at: :desc).limit(5).map { |c|
              {
                id: c.id,
                body: c.body.truncate(50),
                user_display_name: c.user&.display_name || "匿名",
                post_title: c.post&.title&.truncate(30) || "削除された投稿",
                post_id: c.post_id,
                created_at: c.created_at.iso8601
              }
            }
          }
        }
      end
    end
  end
end
```

**Step 2: Add routes**

In `backend/config/routes.rb`, inside the `namespace :api` block, add:

```ruby
namespace :admin do
  get "stats", to: "stats#index"
end
```

**Step 3: Commit**

```bash
git add backend/app/controllers/api/admin/stats_controller.rb backend/config/routes.rb
git commit -m "feat: add admin stats API endpoint"
```

---

### Task 2: Next.js — API Route Handler (Proxy)

**Files:**
- Create: `frontend/src/app/api/admin/stats/route.ts`

**Step 1: Create the proxy route**

```typescript
// frontend/src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:3000";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/api/admin/stats`, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add frontend/src/app/api/admin/stats/route.ts
git commit -m "feat: add admin stats API proxy route"
```

---

### Task 3: Next.js — Admin Dashboard Page

**Files:**
- Create: `frontend/src/app/(private)/admin/page.tsx`

**Step 1: Create the dashboard page**

Build a "use client" page that:
1. Fetches `/api/admin/stats` on mount
2. Checks `useUser()` — redirects non-admin to `/posts`
3. Renders 3 stat cards (Users/Posts/Comments) with totals + trend subtext
4. Renders recent activity lists (posts + comments)

UI details:
- Stat cards: shadcn `Card` or plain div with rounded-3xl, shadow-sm (matching existing post card style)
- Icons: `Users`, `FileText`, `MessageCircle` from lucide-react
- Trend text: "+N today / +N this week" in muted-foreground
- Recent posts: title links to `/posts/:id`, show user + timestamp
- Recent comments: truncated body, post title, user + timestamp
- Loading state: spinner (same pattern as posts page)
- Error state: error message + retry button

**Step 2: Commit**

```bash
git add frontend/src/app/\(private\)/admin/page.tsx
git commit -m "feat: add admin dashboard page"
```

---

### Task 4: Sidebar — Add Admin Link

**Files:**
- Modify: `frontend/src/components/layout/sidebar/index.tsx`

**Step 1: Add conditional admin menu item**

In `frontend/src/components/layout/sidebar/index.tsx`:

1. Import `Shield` from lucide-react
2. Change the static `menuList` to be computed inside the component using `useMemo`
3. If `currentUser?.role === "admin"`, append `{ name: "管理", path: "/admin", icon: Shield }` to the menu list

The admin item should appear after "設定" (Settings).

**Step 2: Commit**

```bash
git add frontend/src/components/layout/sidebar/index.tsx
git commit -m "feat: add admin link to sidebar for admin users"
```

---

### Task 5: Verify & Final Commit

**Step 1: Test manually**

- Visit `/admin` as admin user → see dashboard with stats
- Visit `/admin` as regular user → redirect to `/posts`
- Check sidebar: admin link visible only for admin users
- Check mobile nav: admin link visible only for admin users

**Step 2: Final commit if any fixes needed**
