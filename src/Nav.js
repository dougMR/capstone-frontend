import { useNavigate } from "react-router-dom";
const Nav = () => {
    const navigate = useNavigate();
    const navClicked = (evt) => {
        const buttonName = evt.target.innerHTML;
        let view;
        if (buttonName === "SHOP") {
            view = "/shop";
        } else if (buttonName === "LIST") {
            view = "/list";
        } else if (buttonName === "SELECT STORE") {
            view = "/stores";
        } else if (buttonName === "SEARCH") {
            view = "/search";
        } else if (buttonName === "LOG OUT") {
            view = "/login/?logout=true";
        }
        navigate(view);
    };
    return (
        <nav>
            <div id="test-buttons">
                <button onPointerDown={navClicked}>SHOP</button>
                <button onPointerDown={navClicked}>LIST</button>
                <button onPointerDown={navClicked}>SEARCH</button>
                <button onPointerDown={navClicked}>SELECT STORE</button>
                <button onPointerDown={navClicked}>LOG OUT</button>
            </div>
        </nav>
    );
};

export default Nav;
