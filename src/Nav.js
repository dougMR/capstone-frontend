import { useNavigate } from "react-router-dom";
const Nav = () => {
    const navigate = useNavigate();
    const navClicked = (evt) => {
        const buttonName = evt.target.innerHTML;
        const view =
            buttonName === "SHOP"
                ? "/shop"
                : buttonName === "LIST"
                ? "/list"
                : buttonName === "SELECT STORE"
                ? "/stores"
                : "/search";
        navigate(view);
    };
    return (
        <nav>
            <div id="test-buttons">
                <button onPointerDown={navClicked}>SHOP</button>
                <button onPointerDown={navClicked}>LIST</button>
                <button onPointerDown={navClicked}>SEARCH</button>
                <button onPointerDown={navClicked}>SELECT STORE</button>
            </div>
        </nav>
    );
};

export default Nav;
