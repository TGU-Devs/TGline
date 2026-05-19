type CategoriesButtonProps = {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
};

const categories = ["すべて", "部活動", "サークル・同好会", "インカレ"];

const CategoriesButton = ({ activeCategory, setActiveCategory }: CategoriesButtonProps) => {
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
                <button
                    key={category}
                    type="button"
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer mt-8 ${
                        activeCategory === category
                            ? "bg-primary text-sidebar-primary-foreground shadow-sm"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setActiveCategory(category)}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default CategoriesButton;
