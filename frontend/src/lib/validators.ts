/**
 * パスワードバリデーション
 * 8文字以上、大文字・小文字・数字を各1文字以上含む
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "パスワードを入力してください";
  }
  if (password.length < 8) {
    return "8文字以上のパスワードを入力してください";
  }
  if (!/[A-Z]/.test(password)) {
    return "パスワードには大文字を含めてください";
  }
  if (!/[a-z]/.test(password)) {
    return "パスワードには小文字を含めてください";
  }
  if (!/[0-9]/.test(password)) {
    return "パスワードには数字を含めてください";
  }
  return null;
}

/**
 * パスワード確認バリデーション
 */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): string | null {
  if (!confirmation) {
    return "パスワード（確認）を入力してください";
  }
  if (password !== confirmation) {
    return "パスワードが一致しません";
  }
  return null;
}
