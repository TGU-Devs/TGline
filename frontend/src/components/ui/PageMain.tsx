type MainProps = {
    children: React.ReactNode;
    padding?: string;
};

const Main = ({ children, padding = "p-8 md:p-12" }: MainProps) => {
    return (
        <main className={`min-h-screen bg-background duration-300 ${padding}`}>
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
    );
}

export default Main;