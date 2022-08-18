import megaDougBoltLogo from "./images/megadoug_bolt_in_circle_cutout_grey.svg";

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
