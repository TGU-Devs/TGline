type ButtonProps = {
    text: string;
    bg: string;
    hoverBg: string;
    disabled?: boolean;
};

const Button = ({ text, bg, hoverBg, disabled = false }: ButtonProps) => {
    return (
        <button
            type="submit"
            disabled={disabled}
            className={`w-full py-3 ${bg} text-white rounded-md ${hoverBg} transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {text}
        </button>
    );
};

export default Button;
