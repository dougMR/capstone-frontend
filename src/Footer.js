import megaDougBoltLogo from "./images/shopfaster-logo.svg";

const Footer = () => {
    return (
        <footer>
            ©2022 MegaloMedia,<img
                        className="megaDoug-bolt-img"
                        src={megaDougBoltLogo}
                        alt="megaDoug bolt Logo"
                    />megaDoug
        </footer>
    );
};
export default Footer;
