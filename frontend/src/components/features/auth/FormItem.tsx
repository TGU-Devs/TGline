import { FormItemType } from "./AuthForm";

type FormItemProps = {
    item: FormItemType;
    value: string;
    onchangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
};

const FormItem = ({ item, value, onchangeHandler, error }: FormItemProps) => {
    return (
        <div className="flex flex-col">
            <label htmlFor={item.id} className="font-medium text-sm text-slate-700 mb-1">{item.label}</label>
            <input
                type={item.type}
                placeholder={item.label}
                name={item.id}
                value={value}
                onChange={(e) => onchangeHandler(e)}
                className="border-solid border-2 border-gray-100 rounded-md p-1 placeholder:text-slate-400"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default FormItem;
