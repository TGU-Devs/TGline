import { FormItemType } from "./AuthForm";

type FormItemProps = {
    item: FormItemType;
    value: string;
    onchangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
};

const FormItem = ({ item, value, onchangeHandler, error }: FormItemProps) => {
    return (
        <div>
            <label htmlFor={item.id}>{item.label}</label>
            <input
                type={item.type}
                placeholder={item.label}
                name={item.id}
                value={value}
                onChange={(e) => onchangeHandler(e)}
            />
            {error && <p>{error}</p>}
        </div>
    );
};

export default FormItem;
