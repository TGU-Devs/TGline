import { FormItemType } from "./AuthForm";

type FormItemProps = {
    item: FormItemType;
    value: string;
    icon: React.ComponentType<{ size?: number }>;
    onchangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
};

const FormItem = ({
    item,
    value,
    icon: Icon,
    onchangeHandler,
    error,
}: FormItemProps) => {
    return (
        <div className="flex flex-col">
            <label
                htmlFor={item.id}
                className="font-medium text-sm text-slate-700 mb-1"
            >
                {item.label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon size={18}/>
                </div>
                <input
                    type={item.type}
                    placeholder={item.label}
                    name={item.id}
                    value={value}
                    onChange={(e) => onchangeHandler(e)}
                    className="border-solid border-2 border-gray-100 rounded-md p-1 pl-10 w-full placeholder:text-slate-400"
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default FormItem;
