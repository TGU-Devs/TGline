import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FormErrors, ChangePasswordFormItem, ChangePasswordFormValues, DeleteAccountFormItem, DeleteAccountFormValues } from "./types";

type SecurityFormItemProps = {
    item: ChangePasswordFormItem | DeleteAccountFormItem;
    formValues: ChangePasswordFormValues | DeleteAccountFormValues;
    errors: FormErrors;
    ringColor?: string;
    onChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SecurityFormItem = ({
    item,
    formValues,
    errors,
    ringColor = "focus:ring-sky-500",
    onChangeHandler,
}: SecurityFormItemProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div key={item.id} className="flex flex-col">
            <label
                htmlFor={item.id}
                className="text-sm mb-1 font-bold text-muted-foreground"
            >
                {item.label}
            </label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    id={item.id}
                    placeholder={item.placeholder}
                    className={`p-3 pr-10 border border-slate-200 rounded-md bg-slate-50 w-full focus:outline-none focus:ring-2 ${ringColor} transition-colors`}
                    value={formValues[item.id as keyof typeof formValues] ?? ""}
                    onChange={onChangeHandler}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {errors[item.id] && (
                <p className="text-sm text-destructive mt-1">
                    {errors[item.id as keyof typeof errors]}
                </p>
            )}
        </div>
    );
};

export default SecurityFormItem;
