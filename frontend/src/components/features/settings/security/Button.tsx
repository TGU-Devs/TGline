type ButtonProps = {
    text: string;
    bg: string;
    hoverBg: string;
};

const Button = ({ text, bg, hoverBg }: ButtonProps) => {
    return (
        <button
            type="submit"
            className={`w-full py-3 ${bg} text-white rounded-md ${hoverBg} transition-colors cursor-pointer`}
        >
            {text}
        </button>
    );
};

export default Button;
