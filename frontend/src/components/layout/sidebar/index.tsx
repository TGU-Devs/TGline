import Link from "next/link";

const currentUser = {
    id: "taro_1225",
    name: "たろう",
};

const meneList = [
    { name: "投稿一覧", path: "/" },
    { name: "通知", path: "/notifications" },
    { name: "設定", path: "/settings" },
];

const Sidebar = () => {
    return(
        <aside className="w-64 h-screen bg-gray-300">
            <div className="text-center border-b">
                <div>{currentUser.name.charAt(0)}</div>
                <h2>{currentUser.name}</h2>
                <p>{currentUser.id}</p>
            </div>

            <nav className="border-b">
                <p>メニュー</p>
                <ul>
                    {meneList.map((menu) => (
                        <li key={menu.path}>
                            <Link href={menu.path}>{menu.name}</Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div>
                <button>ログアウト</button>
            </div>
        </aside>
    )
}

export default Sidebar;