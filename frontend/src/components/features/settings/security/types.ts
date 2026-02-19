type FormValues = {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
};

type FormItem = {
    id: keyof FormValues;
    label: string;
    placeholder: string;
};

type FormErrors = {
    current_password?: string;
    new_password?: string;
    confirm_new_password?: string;
};

export type { FormValues, FormItem, FormErrors };