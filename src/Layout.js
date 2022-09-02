import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
const Layout = ({currentStore, loggedIn, user}) => {
    return (
        <>
            <Header currentStore={currentStore}
            user={user} loggedIn={loggedIn}/>
            <main id="main">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};
export default Layout;