type HeaderProps = {
    title: string;
    description?: string;
};

const Header = ({ title, description }: HeaderProps) => {
    return (
        <header className="max-w-4xl max-auto">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="mt-2 text-chart-3">{description}</p>
        </header>
    );
};

export default Header;
