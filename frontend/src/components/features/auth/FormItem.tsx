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
                className="font-medium text-sm text-foreground mb-1"
            >
                {item.label}
            </label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Icon size={18}/>
                </div>
                <input
                    type={item.type}
                    placeholder={item.label}
                    name={item.id}
                    value={value}
                    onChange={(e) => onchangeHandler(e)}
                    className="border border-input rounded-lg p-2 pl-10 w-full bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
            </div>
            {error && <p className="text-destructive text-sm mt-1">{error}</p>}
        </div>
    );
};

export default FormItem;
