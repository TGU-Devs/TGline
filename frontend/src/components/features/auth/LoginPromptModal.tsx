"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

type LoginPromptModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ログインが必要です</DialogTitle>
          <DialogDescription>
            この機能を使うにはログインが必要です。アカウントをお持ちでない方は新規登録してください。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => router.push("/login")}
            className="w-full sm:w-auto"
          >
            <LogIn className="h-4 w-4 mr-2" />
            ログイン
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/register")}
            className="w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            新規登録
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
