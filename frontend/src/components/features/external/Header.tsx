const Header = ({ title }: { title: string }) => {
    return (
        <header className="max-w-4xl max-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    {title}
                </h1>
            </div>
        </header>
    );
};

export default Header;
