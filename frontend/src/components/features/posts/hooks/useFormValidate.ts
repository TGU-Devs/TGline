import { useState } from "react";

import { Errors } from "../types";

export const useFormValidate = () => {
    const [FormErrors, setFormErrors] = useState<Errors>({});

    const validateForm = (title: string, body: string) => {
        const errors: Errors = {};
        if (!title.trim()) {
            errors.title = "タイトルを入力してください";
        }
        if (!body.trim()) {
            errors.body = "本文を入力してください";
        }
        setFormErrors(errors);
        
        return Object.keys(errors).length === 0;
    };

    const clearErrors = () => setFormErrors({});


    return { FormErrors, validateForm, clearErrors }
    ;
};
