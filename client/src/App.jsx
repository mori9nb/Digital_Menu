import {useState, useEffect} from 'react';
import axios from 'axios';
import {Container, Row, Col, Card, Spinner, Offcanvas, ListGroup, Button, Badge} from 'react-bootstrap';
import {FaPlus, FaShoppingBag, FaUtensils, FaTrash, FaWhatsapp} from 'react-icons/fa';
import './App.css';

function App() {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]); // سبد خرید ما اینجاست
    const [showCart, setShowCart] = useState(false); // برای باز و بسته کردن منوی پایین
    const [activeCategory, setActiveCategory] = useState(null);
    const [isCartBouncing, setIsCartBouncing] = useState(false);
    // true یعنی اولش دروازه رو نشون بده
    const [showGateway, setShowGateway] = useState(true);
    // استیت جدید برای کنترل انیمیشن خروج
    const [isGatewayClosing, setIsGatewayClosing] = useState(false);
    // پیش‌فرض می‌ذاریم رو رستوران، ولی از تو دروازه عوضش می‌کنیم
    const [activeMenuType, setActiveMenuType] = useState('restaurant');
    // استیت برای نمایش یا مخفی کردن دکمه اسکرول آپ
    const [showTopBtn, setShowTopBtn] = useState(false);

// تابعی که چک میکنه چقدر اومدیم پایین
    const handleScrollPosition = (e) => {
        // اگه بیشتر از 300 پیکسل اومدیم پایین، دکمه رو نشون بده
        if (e.target.scrollTop > 300) {
            setShowTopBtn(true);
        } else {
            setShowTopBtn(false);
        }
    };

// تابع رفتن به بالا
    const scrollToTop = () => {
        document.querySelector('.main-scroll-container').scrollTo({ top: 0, behavior: 'smooth' });
    };
    // دریافت منو
    useEffect(() => {
        axios.get('http://10.15.71.227/DigitalMenu/api/index.php')
            .then(res => {
                setMenu(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // تابع افزودن به سبد خرید
    const addToCart = (item) => {
        setCart([...cart, {...item, cartId: Date.now()}]);

        // اجرای افکت پرش
        setIsCartBouncing(true);
        setTimeout(() => setIsCartBouncing(false), 300); // بعد از 0.3 ثانیه افکت رو خاموش کن
    };

    // تابع حذف از سبد خرید
    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    // محاسبه جمع کل
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

    // تابع ارسال سفارش به واتس‌اپ (طلایی!)
    const handleCheckout = () => {
        const phoneNumber = "393331234567"; // شماره واتس‌اپ رستوران (فرضی)
        let message = "Ciao! Vorrei ordinare:\n\n";

        // گروه‌بندی آیتم‌ها برای نمایش تمیزتر
        cart.forEach(item => {
            message += `▫️ ${item.name} - €${item.price}\n`;
        });

        message += `\n💰 Totale: €${totalPrice.toFixed(2)}`;
        message += `\n📍 Tavolo: 5`; // شماره میز (بعداً داینامیک میشه)

        // ساخت لینک واتس‌اپ
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // این تابع رو قبل از return بذار
    const scrollToCategory = (catId) => {
        const element = document.getElementById(`category-${catId}`);
        // مهم: کانتینر اسکرول رو پیدا می‌کنیم
        const container = document.querySelector('.main-scroll-container');

        if (element && container) {
            // محاسبه فاصله آیتم از بالای کانتینر
            // عدد 80 همون فضای خالی برای نوار چسبنده است
            container.scrollTo({
                top: element.offsetTop - 80,
                behavior: "smooth"
            });
            setActiveCategory(catId);
        }
    };

    if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner
        animation="grow" variant="dark"/></div>;

    // todo organize categories for each part of menu
    // دسته‌بندی‌های دیتابیس رو اینجا به ۴ گروه تقسیم می‌کنیم
// ⚠️ نکته مهم: اسم‌های سمت راست رو دقیقاً مثل دیتابیس خودت بنویس!
    const menuMapping = {
        'daily': ['Menu del Giorno', 'Contorni'], // منوی روز
        'cafe': ['Caffè', 'Dolci', 'Tè e Tisane'], // کافه
        'restaurant': ['Pizze Classiche', 'Primi Piatti', 'Secondi', 'Antipasti', 'Insalate','Burger & Grill'], // رستوران
        'cocktail': ['Cocktail', 'Vini', 'Birre', 'Bevande'] // بار و کوکتل
    };

// فیلتر هوشمند منو بر اساس دکمه‌ی انتخاب شده
    const filteredMenu = menu.filter(cat => {
        // میگه برو تو دیکشنری بالا بگرد، ببین کدوما مال این بخش هستن
        const allowedCategories = menuMapping[activeMenuType] || [];
        return allowedCategories.includes(cat.category);
    });

    // تابعی که وقتی روی یکی از نیمه‌های دروازه کلیک میشه اجرا میشه
    // تابع ساده‌تر شده (بدون نیاز به آیدی)
    const handleGatewayClick = (menuType) => {
        setIsGatewayClosing(true);
        setActiveMenuType(menuType);

        setTimeout(() => {
            setShowGateway(false);
            setIsGatewayClosing(false);

            // فقط کافیه اسکرول کنیم به بالاترین نقطه صفحه
            document.querySelector('.main-scroll-container').scrollTo({ top: 0, behavior: 'instant' });

        }, 800);
    };

    // تابع جادویی برای آوردن دکمه کلیک شده به وسط صفحه
    const handleCategoryPillClick = (e, catId) => {
        // ۱. اول صفحه اصلی رو اسکرول می‌کنیم روی اون غذا
        scrollToCategory(catId);

        // ۲. حالا نوار دسته‌بندی‌ها رو حرکت میدیم
        const container = document.querySelector('.scroll-menu');
        const button = e.currentTarget;

        if (container && button) {
            // محاسبه ریاضی: موقعیت دکمه منهای نصف عرض صفحه به علاوه نصف عرض خود دکمه
            const scrollLeftPos = button.offsetLeft - (container.offsetWidth / 2) + (button.offsetWidth / 2);

            container.scrollTo({
                left: scrollLeftPos,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            {/* ========================================== */}
            {/* ۲. دروازه ورودی (فقط وقتی showGateway مساوی true باشه نشون داده میشه) */}
            {showGateway && (
                <div className={`gateway-container ${isGatewayClosing ? 'gateway-closing' : ''}`}>

                    {/* ۱. بالا چپ: منوی روز */}
                    <div className="gateway-quadrant quad-menu" onClick={() => handleGatewayClick('daily')}>
                        <h2 className="gateway-text font-playfair fw-bold">Menu del<br/>Giorno</h2>
                    </div>

                    {/* ۲. بالا راست: کافه */}
                    <div className="gateway-quadrant quad-cafe" onClick={() => handleGatewayClick('cafe')}>
                        <h2 className="gateway-text font-playfair fw-bold">Caffetteria</h2>
                    </div>

                    {/* ۳. پایین چپ: رستوران */}
                    <div className="gateway-quadrant quad-rest" onClick={() => handleGatewayClick('restaurant')}>
                        <h2 className="gateway-text font-playfair fw-bold">Ristorante</h2>
                    </div>

                    {/* ۴. پایین راست: کوکتل */}
                    <div className="gateway-quadrant quad-cocktail" onClick={() => handleGatewayClick('cocktail')}>
                        <h2 className="gateway-text font-playfair fw-bold">Cocktail</h2>
                    </div>



                </div>
            )}

            {/* --- ۲. لوگوی دائمی (بیرون از پرده گذاشتیمش که پاک نشه) --- */}
            {/* شرط طلایی: اگه پرده داره بسته میشه یا کلا بسته شده، کلاس logo-top رو بهش بده */}
            <div
                // ۱. کلاس رو به logo-bottom تغییر دادیم
                className={`gateway-logo ${(isGatewayClosing || !showGateway) ? 'logo-bottom' : ''}`}
                onClick={scrollToTop}
                style={{ cursor: 'pointer' }}
            >
                <img src="/logo.png" alt="Logo" className="logo-image" />

                {/* ۲. نشانگر اسکرول (فلش) که فقط وقتی لوگو پایینه دیده میشه */}
                <div className="scroll-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                    </svg>
                </div>
            </div>

            {/* ========================================== */}
            <div className="main-scroll-container" style={{paddingBottom: '100px'}}>

                {/* 1. Hero Section */}
                <div className="hero-section">
                    {/* ... محتویات هدر همونه ... */}
                    <div className="hero-overlay">
                        <h1 className="display-5 fw-bold font-playfair">Ristorante Milano</h1>
                        <p className="mb-0 text-white-50"><FaUtensils className="me-2"/>Cucina Italiana Autentica</p>
                    </div>
                </div>

                {/* 🌟 تب‌های ۴ گانه جدید (اسکرول افقی) 🌟 */}
                <div className="modern-tabs-container mt-3 mb-2 px-3">
                    {/* ردیف اول: منوی روز (تمام عرض) */}
                    <button
                        className={`tab-btn w-100 mb-2 py-2 fs-6 shadow-sm ${activeMenuType === 'daily' ? 'active' : ''}`}
                        onClick={() => { setActiveMenuType('daily'); setActiveCategory(null); }}
                    >
                        🍽️ Menu del Giorno
                    </button>

                    {/* ردیف دوم: ۳ تای دیگه (تقسیم مساوی عرض) */}
                    <div className="d-flex gap-2 w-100">
                        <button
                            className={`tab-btn flex-fill px-1 shadow-sm ${activeMenuType === 'restaurant' ? 'active' : ''}`}
                            onClick={() => { setActiveMenuType('restaurant'); setActiveCategory(null); }}
                            style={{ fontSize: '0.8rem', whiteSpace: 'normal', lineHeight: '1.2' }}
                        >
                            🍕 Ristorante
                        </button>
                        <button
                            className={`tab-btn flex-fill px-1 shadow-sm ${activeMenuType === 'cafe' ? 'active' : ''}`}
                            onClick={() => { setActiveMenuType('cafe'); setActiveCategory(null); }}
                            style={{ fontSize: '0.8rem', whiteSpace: 'normal', lineHeight: '1.2' }}
                        >
                            ☕ Caffetteria
                        </button>
                        <button
                            className={`tab-btn flex-fill px-1 shadow-sm ${activeMenuType === 'cocktail' ? 'active' : ''}`}
                            onClick={() => { setActiveMenuType('cocktail'); setActiveCategory(null); }}
                            style={{ fontSize: '0.8rem', whiteSpace: 'normal', lineHeight: '1.2' }}
                        >
                            🍸 Cocktail
                        </button>
                    </div>
                </div>

                {/* ... بقیه کدها دقیقاً مثل قبل ... */}
                {/* نوار دسته‌بندی */}
                <div className="glass-nav mb-4">
                    {/* ... */}
                    {/*todo remove the tutti part if its not good*/}
                    <div className="scroll-menu">
                        <button
                            className={`nav-pill ${activeCategory === null ? 'active' : ''}`}
                            onClick={(e) => {
                                document.querySelector('.main-scroll-container').scrollTo({ top: 0, behavior: 'smooth' });
                                setActiveCategory(null);
                                // اینم میاریم اول خط
                                e.currentTarget.parentElement.scrollTo({ left: 0, behavior: 'smooth' });
                            }}
                        >
                            Tutti
                        </button>
                        {/* ... مپ کردن دکمه‌ها ... */}
                        {filteredMenu.map((cat) => (
                            <button
                                key={cat.id}
                                className={`nav-pill ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={(e) => handleCategoryPillClick(e, cat.id)}
                            >
                                {cat.category}
                            </button>
                        ))}
                    </div>
                </div>

                <Container>
                    {/* ... لیست غذاها همونه دست نزن ... */}
                    {filteredMenu.map((category) => (
                        <div key={category.id} id={`category-${category.id}`} className="mb-5 pt-2">
                            {/* ... */}
                            <h3 className="mb-3 fw-bold font-playfair">{category.category}</h3>
                            <Row>
                                {category.items.map((item) => (
                                    <Col md={6} lg={4} key={item.id} className="mb-4">
                                        <Card className="menu-card h-100 border-0 shadow-sm"
                                              style={{borderRadius: '15px', overflow: 'hidden'}}>
                                            <div className="d-flex position-relative">
                                                <div style={{width: '110px', minWidth: '110px', height: '120px'}}>
                                                    <Card.Img src={item.image} style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}/>
                                                </div>
                                                <Card.Body className="p-3 d-flex flex-column justify-content-between"
                                                           style={{minWidth: 0}}>
                                                    <div>
                                                        <div
                                                            className="d-flex justify-content-between align-items-start mb-1">
                                                            <h6 className="fw-bold mb-0 text-truncate me-2"
                                                                style={{fontSize: '1rem'}}>{item.name}</h6>
                                                            <span className="text-success fw-bold"
                                                                  style={{whiteSpace: 'nowrap'}}>€{item.price}</span>
                                                        </div>
                                                        <p className="text-muted small mb-0" style={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            fontSize: '0.85rem',
                                                            lineHeight: '1.3'
                                                        }}>
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                    <div className="d-flex justify-content-end mt-2">
                                                        <button
                                                            className="btn btn-sm btn-dark rounded-pill px-3 py-1 d-flex align-items-center"
                                                            onClick={() => addToCart(item)}
                                                        >
                                                            <FaPlus size={10} className="me-1"/>
                                                            <span style={{fontSize: '0.8rem'}}>Aggiungi</span>
                                                        </button>
                                                    </div>
                                                </Card.Body>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ))}
                </Container>

                {/* ... سبد خرید و واتس‌اپ همونه دست نزن ... */}
                {!showCart && cart.length > 0 && (
                    <div className="fixed-bottom p-3" style={{zIndex: 1040}}>
                        {/* ... */}
                        <div
                            className={`bg-dark text-white rounded-pill p-3 shadow-lg d-flex justify-content-between align-items-center cursor-pointer click-effect ${isCartBouncing ? 'cart-pop' : ''}`}
                            onClick={() => setShowCart(true)}
                        >
                            <div className="d-flex align-items-center">
                        <span
                            className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{width: 30, height: 30, fontWeight: 'bold'}}>
                            {cart.length}
                        </span>
                                <span className="fw-bold">€{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="me-2 small text-uppercase fw-bold">Vedi Ordine</span>
                                <FaShoppingBag/>
                            </div>
                        </div>
                    </div>
                )}

                <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="bottom"
                           style={{height: '70vh', borderRadius: '20px 20px 0 0'}}>
                    {/* ... محتویات سبد خرید همونه ... */}
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title className="fw-bold font-playfair">Il tuo ordine 🛒</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="d-flex flex-column">
                        <ListGroup variant="flush" className="flex-grow-1 overflow-auto mb-3">
                            {cart.map((item) => (
                                <ListGroup.Item key={item.cartId}
                                                className="d-flex justify-content-between align-items-center px-0">
                                    <div>
                                        <div className="fw-bold">{item.name}</div>
                                        <div className="text-muted small">€{item.price}</div>
                                    </div>
                                    <Button variant="outline-danger" size="sm" className="rounded-circle"
                                            onClick={() => removeFromCart(item.cartId)}>
                                        <FaTrash size={12}/>
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <div className="border-top pt-3">
                            <div className="d-flex justify-content-between mb-3 fs-5 fw-bold">
                                <span>Totale:</span>
                                <span>€{totalPrice.toFixed(2)}</span>
                            </div>
                            <Button variant="success" size="lg" className="w-100 rounded-pill fw-bold mb-2"
                                    onClick={handleCheckout}>
                                <FaWhatsapp className="me-2" size={20}/> Invia Ordine su WhatsApp
                            </Button>
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>

            </div>
        </>
    );
}

export default App;