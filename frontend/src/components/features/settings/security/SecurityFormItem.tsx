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
    return (
        <div key={item.id} className="flex flex-col">
            <label
                htmlFor={item.id}
                className="text-sm mb-1 font-bold text-muted-foreground"
            >
                {item.label}
            </label>
            <input
                type="password"
                id={item.id}
                placeholder={item.placeholder}
                className={`p-3 border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 ${ringColor} transition-colors`}
                value={formValues[item.id as keyof typeof formValues] ?? ""}
                onChange={onChangeHandler}
                required
            />
            {errors[item.id] && (
                <p className="text-sm text-destructive mt-1">
                    {errors[item.id as keyof typeof errors]}
                </p>
            )}
        </div>
    );
};

export default SecurityFormItem;
