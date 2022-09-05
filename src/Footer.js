import megaDougBoltLogo from "./images/megadoug_bolt_in_circle_cutout_grey.svg";
import cartIcon from "./images/shop-faster-cart-icon-white.svg";

const Footer = () => {
    return (
        <footer >
            <div className="copyright" style={{display: 'flex', alignItems: 'center'}}>
                ©2022 MegaloMedia,
                <img
                    style={{
                        height: "12px",
                        width: "auto",
                        marginLeft: "0.3em",
                        marginRight: "0.2em",
                    }}
                    className="megaDoug-bolt-img"
                    src={megaDougBoltLogo}
                    alt="megaDoug bolt Logo"
                />
                megaDoug
            </div>
            <div>
            <img style={{width: '10vw', maxWidth: '10vw', textAlign: "right"}} className="cart-icon" src={cartIcon} alt="shopping cart icon" />
            </div>
                
            
        </footer>
    );
};
// comment
export default Footer;
