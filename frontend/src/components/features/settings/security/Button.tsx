type ButtonProps = {
    text: string;
    Bg: string;
    hoverBg: string;
};

const Button = ({ text, Bg, hoverBg }: ButtonProps) => {
    return (
        <button
            type="submit"
            className={`w-full py-3 ${Bg} text-white rounded-md ${hoverBg} transition-colors cursor-pointer`}
        >
            {text}
        </button>
    );
};

export default Button;
