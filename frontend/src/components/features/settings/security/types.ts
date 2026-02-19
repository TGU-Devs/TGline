type ChangePasswordFormValues = {
    current_password: string;
    new_password: string;
    confirm_new_password: string;
};

type DeleteAccountFormValues = {
    current_password: string;
};

type ChangePasswordFormItem = {
    id: keyof ChangePasswordFormValues;
    label: string;
    placeholder: string;
};

type DeleteAccountFormItem = {
    id: keyof DeleteAccountFormValues;
    label: string;
    placeholder: string;
};

type ChangePasswordFormErrors = {
    current_password?: string;
    new_password?: string;
    confirm_new_password?: string;
};

type DeleteAccountFormErrors = {
    current_password?: string;
};

type FormErrors = ChangePasswordFormErrors & DeleteAccountFormErrors;
export type { ChangePasswordFormValues, DeleteAccountFormValues, ChangePasswordFormItem, DeleteAccountFormItem, FormErrors };