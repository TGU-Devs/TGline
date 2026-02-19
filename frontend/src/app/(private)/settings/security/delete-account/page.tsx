"use client";

import { useState } from "react";

import DeleteAccountModal from "@/components/features/settings/security/DeleteAccountModal";
import ReturnSettingsBtn from "@/components/features/settings/ReturnSettingsBtn";
import SettingSection from "@/components/features/settings/SettingSection";
import SecurityFormItem from "@/components/features/settings/security/SecurityFormItem";
import Button from "@/components/features/settings/security/Button";

import { Trash2, TriangleAlert } from "lucide-react";

import {
    DeleteAccountFormValues,
    FormErrors,
    DeleteAccountFormItem,
} from "@/components/features/settings/security/types";

const initFormValues: DeleteAccountFormValues = {
    current_password: "",
};

const formItems: DeleteAccountFormItem[] = [
    {
        id: "current_password",
        label: "現在のパスワード",
        placeholder: "現在のパスワードを入力してください",
    },
];

const DeleteAccountPage = () => {
    const [formValues, setFormValues] = useState(initFormValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormValues((formValues) => ({
            ...formValues,
            [id]: value,
        }));
    };

    const onSubmitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateForm(formValues);
        setErrors(errors);
        if (Object.keys(errors).length === 0) {
            setIsModalOpen(true);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            // ★ ここでAPIを呼び出す
            // const res = await fetch('/api/account/delete', { ... });
            
            console.log("アカウント削除処理を実行中...");
            
            // 処理完了後のリダイレクト等はここで行う
            // router.push("/"); 
            
        } catch (error) {
            console.error("削除エラー:", error);
            // エラー時はモーダルを閉じるか、エラー表示をする
            setIsDeleting(false); 
        }
    };

    const validateForm = (values: DeleteAccountFormValues): FormErrors => {
        const errors: FormErrors = {};

        if (!values.current_password) {
            errors.current_password = "現在のパスワードを入力してください";
        }

        return errors;
    };

    return (
        <main className="min-h-screen p-6 max-w-3xl mx-auto">
            <DeleteAccountModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDelete={handleDeleteConfirm}
                isDeleting={isDeleting}
            />
            <ReturnSettingsBtn />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SettingSection
                    title="アカウント削除"
                    icon={Trash2}
                    iconColor="text-red-600"
                    iconBgColor="bg-red-50"
                    textcolor="text-red-800"
                >
                    <div className="flex items-center gap-3 mb-7 text-red-600 bg-red-50 p-4 rounded-md">
                        <TriangleAlert className="w-10 h-10" />
                        <div>
                            <h2 className="font-bold">
                                警告：この操作は取り消せません
                            </h2>
                            <p className="text-sm mt-1">
                                アカウントを削除すると、すべてのデータが完全に削除されます。この操作は元に戻すことができません。
                            </p>
                        </div>
                    </div>
                    <form
                        className="space-y-7"
                        onSubmit={onSubmitHandler}
                        noValidate
                    >
                        {formItems.map((item) => {
                            return (
                                <SecurityFormItem
                                    key={item.id}
                                    item={item}
                                    formValues={formValues}
                                    errors={errors}
                                    ringColor="focus:ring-red-500"
                                    onChangeHandler={onChangeHandler}
                                />
                            );
                        })}
                        <Button
                            text="アカウントを削除"
                            Bg="bg-red-600"
                            hoverBg="hover:bg-red-700"
                        />
                    </form>
                </SettingSection>
            </div>
        </main>
    );
};

export default DeleteAccountPage;
