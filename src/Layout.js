import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
const Layout = ({currentStore}) => {
    return (
        <>
            <Header currentStore={currentStore}/>
            <main id="main">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};
export default Layout;