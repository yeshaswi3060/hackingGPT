class AppHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        const basePath = this.getAttribute('base-path') || '';
        this.innerHTML = `
<div class="xs-sidebar-group info-group info-sidebar">
        <div class="xs-overlay xs-bg-black"></div>
        <div class="xs-sidebar-widget">
            <div class="sidebar-widget-container">
                <div class="widget-heading">
                    <a href="#" class="close-side-widget">X</a>
                </div>
                <div class="sidebar-textwidget">
                    <div class="sidebar-info-contents">
                        <div class="content-inner">
                            <div class="logo">
                                <a href="${basePath}index"><img src="${basePath}assets/images/resources/logo-1.png" alt="" style="max-width: 250px; height: auto;" /></a>
                            </div>
                            <div class="content-box">
                                <h4>About Us</h4>
                                <p>Lorem ipsum dolor sit amet, consectetur elit, sed do eiusmod tempor incididunt ut
                                    labore et magna aliqua. Ut enim ad minim veniam laboris.</p>
                            </div>
                            <div class="form-inner">
                                <h4>Get a free quote</h4>
                                <form action="https://scriptfusions.mnsithub.com/html/Mango Tree Technology/main-html/assets/inc/sendemail.php" class="contact-form-validated"
                                    novalidate="novalidate">
                                    <div class="form-group">
                                        <input type="text" name="name" placeholder="Name" required="">
                                    </div>
                                    <div class="form-group">
                                        <input type="email" name="email" placeholder="Email" required="">
                                    </div>
                                    <div class="form-group">
                                        <textarea name="message" placeholder="Message..."></textarea>
                                    </div>
                                    <div class="form-group message-btn">
                                        <button type="submit" class="thm-btn form-inner__btn">Submit Now<span
                                                class="icon-right-arrow"></span></button>
                                    </div>
                                </form>
                                <div class="result"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- End sidebar widget content -->
<header class="main-header-two">
            <nav class="main-menu main-menu-two">
                <div class="main-menu-two__wrapper">
                    <div class="main-menu-two__wrapper-inner">
                        <div class="main-menu-two__left">
                            <div class="main-menu-two__logo">
                                <a href="${basePath}index"><img src="${basePath}assets/images/resources/logo-1.png" alt="" style="max-width: 250px; height: auto;" /></a>
                            </div>
                        </div>
                        <div class="main-menu-two__main-menu-box">
                            <ul class="main-menu__list">
                                <li>
                                    <a href="${basePath}index">Home </a>
                                </li>
                                <li>
                                    <a href="${basePath}about">About</a>
                                </li>
                                <li class="dropdown">
                                    <a href="${basePath}services">Services</a>
                                    <ul class="shadow-box">
                                        <li class="dropdown">
                                            <a href="#">AI & Automation</a>
                                            <ul>
                                                <li><a href="${basePath}services/ai-automation">AI Automation</a></li>
                                                <li><a href="${basePath}services/ai-agents">AI Agents</a></li>
                                                <li><a href="${basePath}services/ai-products-development">AI Products Development</a></li>
                                            </ul>
                                        </li>
                                        <li class="dropdown">
                                            <a href="#">Software Solutions</a>
                                            <ul>
                                                <li><a href="${basePath}services/custom-software-development">Custom Software Development</a></li>
                                                <li><a href="${basePath}services/ui-ux">UI/UX</a></li>
                                                <li><a href="${basePath}services/web-app-development">Web App Development</a></li>
                                                <li><a href="${basePath}services/mobile-app-development">Mobile App Development</a></li>
                                                <li><a href="${basePath}services/cybersecurity">Cybersecurity</a></li>
                                                <li><a href="${basePath}services/qa-testing">QA & Testing</a></li>
                                                <li><a href="${basePath}services/cloud-solutions">Cloud Solutions</a></li>
                                                <li><a href="${basePath}services/data-analytics">Data Analytics</a></li>
                                            </ul>
                                        </li>
                                        <li class="dropdown">
                                            <a href="#">Marketing & Growth</a>
                                            <ul>
                                                <li><a href="${basePath}services/marketing">Marketing</a></li>
                                                <li><a href="${basePath}services/social-media">Social Media</a></li>
                                                <li><a href="${basePath}services/tech-consultancy">Tech Consultancy</a></li>
                                            </ul>
                                        </li>
                                        <li class="dropdown">
                                            <a href="#">Sales & Operations</a>
                                            <ul>
                                                <li><a href="${basePath}services/sales">Sales</a></li>
                                                <li><a href="${basePath}services/tech-support">Tech Support</a></li>
                                                <li><a href="${basePath}services/ecom-integration">Ecom Integration</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li class="dropdown">
                                    <a href="${basePath}portfolio">Portfolio</a>
                                    <ul class="shadow-box">
                                        <li><a href="${basePath}portfolio/malyam">Malyam</a></li>
                                        <li><a href="${basePath}portfolio/occult-sage">Occult Sage</a></li>
                                        <li><a href="${basePath}portfolio/vastu-wheels">Vastu Wheels</a></li>
                                        <li><a href="${basePath}portfolio/globalinch">Global Inch</a></li>
                                        <li><a href="${basePath}portfolio/astrology-app">Astrology App</a></li>
                                        <li><a href="${basePath}portfolio/vastu-consultancy-app">Vastu Consultancy App</a></li>
                                        <li><a href="${basePath}portfolio/vastushikhar">Vastu Shikhar</a></li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="${basePath}blogs">Blog</a>
                                </li>
                                
                            </ul></div><div class="main-menu-two__right">
                            
                            <a href="#" class="mobile-nav__toggler"><i class="fa fa-bars"></i></a>
                            <div class="main-menu-two__btn-box d-none d-md-block">
                                <a href="${basePath}contact" class="thm-btn">Get in Touch<span
                                        class="icon-right-arrow"></span></a>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </nav>
        </header>
<div class="stricky-header stricked-menu main-menu main-menu-two">
            <div class="sticky-header__content"></div><!-- /.sticky-header__content -->
        </div><!-- /.stricky-header -->
`
            ;
    }
}
customElements.define('app-header', AppHeader);

class AppFooter extends HTMLElement {
    connectedCallback() {
        const basePath = this.getAttribute('base-path') || '';
        this.innerHTML = `
<!--Site Footer Two Start-->
        <footer class="site-footer-two">
            <div class="site-footer-two__shape-1"></div>
            <div class="site-footer-two__shape-2"></div>
            <div class="site-footer-two__shape-3"></div>
            <div class="site-footer-two__top">
                <div class="container">
                    <div class="row">
                        <div class="col-xl-4 col-lg-6 col-md-6">
                            <div class="site-footer-two__about">
                                <div class="site-footer-two__logo">
                                    <a href="${basePath}index"><img src="${basePath}assets/images/resources/footer-logo.png" alt="" style="max-width: 250px; height: auto;" /></a>
                                </div>
                                <ul class="list-unstyled site-footer-two__contact-list">
                                    <li>
                                        <div class="site-footer-two__contact-icon">
                                            <span class="icon-contact"></span>
                                        </div>
                                        <div class="site-footer-two__contact-content">
                                            <h5 class="site-footer-two__contact-title">Contact Info</h5>
                                            <p class="site-footer-two__contact-info">
                                                <a href="mailto:info@mangotreetechnology.com"
                                                    class="site-footer-two__contact-mail">info@mangotreetechnology.com</a>
                                                <a href="tel:9220607577" class="site-footer-two__contact-phone">+91-9220607577</a>
                                            </p>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="site-footer-two__contact-icon">
                                            <span class="icon-pin"></span>
                                        </div>
                                        <div class="site-footer-two__contact-content">
                                            <h5 class="site-footer-two__contact-title">Location</h5>
                                            <p class="site-footer-two__contact-info">
                                                3rd Floor, Plot No. 3, Sector-12 <br> Dwarka, New Delhi, 110078 IN
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <style>
                            .footer-services-tags { display: flex; flex-wrap: wrap; gap: 8px; }
                            .footer-tag-link { 
                                display: inline-block; 
                                font-size: 13px; 
                                color: var(--techguru-gray); 
                                font-weight: 500; 
                                padding: 6px 14px; 
                                border: 1px solid rgba(var(--techguru-white-rgb), 0.1); 
                                border-radius: 6px; 
                                background-color: rgba(var(--techguru-white-rgb), 0.03);
                                transition: all 300ms ease; 
                            }
                            .footer-tag-link:hover { 
                                color: var(--techguru-white); 
                                background-color: var(--techguru-base); 
                                border-color: var(--techguru-base); 
                            }
                        </style>
                        <div class="col-xl-3 col-lg-6 col-md-6">
                            <div class="footer-widget-two__quick-links">
                                <h4 class="footer-widget-two__title">Quick Links</h4>
                                <div class="footer-services-tags">
                                    <a href="${basePath}index" class="footer-tag-link">Home</a>
                                    <a href="${basePath}about" class="footer-tag-link">About Us</a>
                                    <a href="${basePath}team" class="footer-tag-link">Team</a>
                                    <a href="${basePath}services" class="footer-tag-link">Services</a>
                                    <a href="${basePath}portfolio" class="footer-tag-link">Portfolio</a>
                                    <a href="${basePath}blogs" class="footer-tag-link">Blogs</a>
                                    <a href="${basePath}contact" class="footer-tag-link">Contact Us</a>
                                    <a href="${basePath}terms-and-conditions" class="footer-tag-link">Terms & Conditions</a>
                                    <a href="${basePath}privacy-policy" class="footer-tag-link">Privacy Policy</a>
                                    <a href="${basePath}faq" class="footer-tag-link">FAQs</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-5 col-lg-12 col-md-12">
                            <div class="footer-widget-two__services">
                                <h4 class="footer-widget-two__title">Our Services</h4>
                                <div class="footer-services-tags">
                                    <a href="${basePath}services/ai-agents" class="footer-tag-link">AI Agents</a>
                                    <a href="${basePath}services/ai-automation" class="footer-tag-link">AI Automation</a>
                                    <a href="${basePath}services/ai-products-development" class="footer-tag-link">AI Products Dev</a>
                                    <a href="${basePath}services/cloud-solutions" class="footer-tag-link">Cloud Solutions</a>
                                    <a href="${basePath}services/custom-software-development" class="footer-tag-link">Custom Software</a>
                                    <a href="${basePath}services/cybersecurity" class="footer-tag-link">Cybersecurity</a>
                                    <a href="${basePath}services/data-analytics" class="footer-tag-link">Data Analytics</a>
                                    <a href="${basePath}services/ecom-integration" class="footer-tag-link">Ecom Integration</a>
                                    <a href="${basePath}services/marketing" class="footer-tag-link">Marketing</a>
                                    <a href="${basePath}services/mobile-app-development" class="footer-tag-link">Mobile Apps</a>
                                    <a href="${basePath}services/qa-testing" class="footer-tag-link">QA & Testing</a>
                                    <a href="${basePath}services/sales" class="footer-tag-link">Sales</a>
                                    <a href="${basePath}services/social-media" class="footer-tag-link">Social Media</a>
                                    <a href="${basePath}services/tech-consultancy" class="footer-tag-link">Tech Consultancy</a>
                                    <a href="${basePath}services/tech-support" class="footer-tag-link">Tech Support</a>
                                    <a href="${basePath}services/ui-ux" class="footer-tag-link">UI/UX Design</a>
                                    <a href="${basePath}services/web-app-development" class="footer-tag-link">Web App Dev</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="site-footer-two__bottom">
                <div class="container">
                    <div class="row">
                        <div class="col-xl-12">
                            <div class="site-footer-two__bottom-inner">
                                <div class="site-footer-two__copyright">
                                    <p class="site-footer-two__copyright-text">
                                        â Copyright 2026 <a href="#" style="color: yellow;">Mango Tree Technology</a> All rights reserved
                                    </p>
                                </div>
                                <div class="site-footer-two__social-box">
                                    <h4 class="site-footer-two__social-title">Follow Us:</h4>
                                    <div class="site-footer-two__social-box-inner">
                                        <a href="https://www.facebook.com/mangotree.technology"><span class="icon-facebook"></span></a>
                                        <a href="https://www.instagram.com/mangotree.technology"><span class="fab fa-instagram"></span></a>
                                       <a href="https://www.linkedin.com/company/mangotreetechnology" target="_blank">
                                        <span class="icon-linkedin"></span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        <!--Site Footer Two End-->
<div class="mobile-nav__wrapper">
        <div class="mobile-nav__overlay mobile-nav__toggler"></div>
        <!-- /.mobile-nav__overlay -->
        <div class="mobile-nav__content">
            <span class="mobile-nav__close mobile-nav__toggler"><i class="fa fa-times"></i></span>

            <div class="logo-box">
                <a href="${basePath}index" aria-label="logo image"><img src="${basePath}assets/images/resources/logo-2.png" width="150"
                        alt="" style="max-width: 200px; height: auto;" /></a>
            </div>
            <!-- /.logo-box -->
            <div class="mobile-nav__container"></div>
            <!-- /.mobile-nav__container -->

            <ul class="mobile-nav__contact list-unstyled">
                <li>
                    <i class="fa fa-envelope"></i>
                    <a href="mailto:info@mangotreetechnology.com">info@mangotreetechnology.com</a>
                </li>
                <li>
                    <i class="fas fa-phone"></i>
                    <a href="tel:9220607577">+91 9220607577</a>
                </li>
            </ul><!-- /.mobile-nav__contact -->
            <div class="mobile-nav__top">
                <div class="mobile-nav__social">
                    <a href="#" class="fab fa-twitter"></a>
                    <a href="#" class="fab fa-facebook-square"></a>
                    <a href="#" class="fab fa-pinterest-p"></a>
                    <a href="#" class="fab fa-instagram"></a>
                </div><!-- /.mobile-nav__social -->
            </div><!-- /.mobile-nav__top -->



        </div>
        <!-- /.mobile-nav__content -->
    </div>
    <!-- /.mobile-nav__wrapper -->
<!-- Search Popup -->
    <div class="search-popup">
        <div class="color-layer"></div>
        <button class="close-search"><span class="far fa-times fa-fw"></span></button>
        <form method="post" action="https://scriptfusions.mnsithub.com/html/Mango Tree Technology/main-html/blogs">
            <div class="form-group">
                <input type="search" name="search-field" value="" placeholder="Search Here" required="">
                <button type="submit"><i class="fas fa-search"></i></button>
            </div>
        </form>
    </div>
    <!-- End Search Popup -->
`
            ;
    }
}
customElements.define('app-footer', AppFooter);


class AppTestimonials extends HTMLElement {
    connectedCallback() {
        const basePath = this.getAttribute('base-path') || '';
        this.innerHTML = `
<!-- Testimonial Two Start -->
        <section class="testimonial-two">
            <div class="testimonial-two__shape-1"></div>
            <div class="testimonial-two__shape-2"></div>
            <div class="container">
                <div class="section-title text-center sec-title-animation animation-style1">
                    <div class="section-title__tagline-box">
                        <div class="section-title__tagline-shape-1"></div>
                        <span class="section-title__tagline">Testimonials</span>
                        <div class="section-title__tagline-shape-2"></div>
                    </div>
                    <h2 class="section-title__title title-animation">Customer Experiences <br> That <span>Speak
                            Volumes</span></h2>
                </div>
                <div class="testimonial-two__carousel owl-theme owl-carousel">
                    <!-- Testimonial Two Single Start -->
                    <div class="item">
                        <div class="testimonial-two__single">
                            <div class="testimonial-two__single-inner">
                                <div class="testimonial-two__star">
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                </div>
                                <p class="testimonial-two__text">"Partnering with Mango Tree Technology completely transformed our digital infrastructure. Their team engineered a scalable web application that handled our peak traffic flawlessly. Exceptional technical expertise and support!"</p>
                            </div>
                            <div class="testimonial-two__client-info">
                                <div class="testimonial-two__client-img">
                                    <img src="${basePath}assets/images/testimonial/testimonial-2-1.jpg" alt="">
                                </div>
                                <div class="testimonial-two__client-content">
                                    <h4 class="testimonial-two__client-name"><a href="${basePath}testimonials">Rajesh Patel</a></h4>
                                    <p class="testimonial-two__sub-title">CTO, Mumbai</p>
                                </div>
                            </div>
                            <div class="testimonial-two__quote">
                                <span class="icon-right-quote"></span>
                            </div>
                        </div>
                    </div>
                    <!-- Testimonial Two Single End -->
                    <!-- Testimonial Two Single Start -->
                    <div class="item">
                        <div class="testimonial-two__single">
                            <div class="testimonial-two__single-inner">
                                <div class="testimonial-two__star">
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                </div>
                                <p class="testimonial-two__text">"We outsourced our cybersecurity and cloud management to Mango Tree Technology and couldn't be happier. They are proactive, highly secure, and truly understand the demands of a modern global enterprise."</p>
                            </div>
                            <div class="testimonial-two__client-info">
                                <div class="testimonial-two__client-img">
                                    <img src="${basePath}assets/images/testimonial/testimonial-2-2.jpg" alt="">
                                </div>
                                <div class="testimonial-two__client-content">
                                    <h4 class="testimonial-two__client-name"><a href="${basePath}testimonials">Sarah Jenkins</a></h4>
                                    <p class="testimonial-two__sub-title">Operations Director, London</p>
                                </div>
                            </div>
                            <div class="testimonial-two__quote">
                                <span class="icon-right-quote"></span>
                            </div>
                        </div>
                    </div>
                    <!-- Testimonial Two Single End -->
                    <!-- Testimonial Two Single Start -->
                    <div class="item">
                        <div class="testimonial-two__single">
                            <div class="testimonial-two__single-inner">
                                <div class="testimonial-two__star">
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                </div>
                                <p class="testimonial-two__text">"The AI automation solutions provided by Mango Tree Technology reduced our operational overhead by 40%. They don't just write code; they design systems that drive enormous real-world business value."</p>
                            </div>
                            <div class="testimonial-two__client-info">
                                <div class="testimonial-two__client-img">
                                    <img src="${basePath}assets/images/testimonial/testimonial-2-3.png" alt="">
                                </div>
                                <div class="testimonial-two__client-content">
                                    <h4 class="testimonial-two__client-name"><a href="${basePath}testimonials">Marcus Chen</a></h4>
                                    <p class="testimonial-two__sub-title">CEO, Singapore</p>
                                </div>
                            </div>
                            <div class="testimonial-two__quote">
                                <span class="icon-right-quote"></span>
                            </div>
                        </div>
                    </div>
                    <!-- Testimonial Two Single End -->
                    <!-- Testimonial Two Single Start -->
                    <div class="item">
                        <div class="testimonial-two__single">
                            <div class="testimonial-two__single-inner">
                                <div class="testimonial-two__star">
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                </div>
                                <p class="testimonial-two__text">"Their UI/UX design team is world-class. They revamped our flagship product with a modern, intuitive interface that our mobile users absolutely love. Conversion rates have doubled since the redesign!"</p>
                            </div>
                            <div class="testimonial-two__client-info">
                                <div class="testimonial-two__client-img">
                                    <img src="${basePath}assets/images/testimonial/testimonial-2-1.jpg" alt="">
                                </div>
                                <div class="testimonial-two__client-content">
                                    <h4 class="testimonial-two__client-name"><a href="${basePath}testimonials">Elena Rodriguez</a></h4>
                                    <p class="testimonial-two__sub-title">Head of Product, Madrid</p>
                                </div>
                            </div>
                            <div class="testimonial-two__quote">
                                <span class="icon-right-quote"></span>
                            </div>
                        </div>
                    </div>
                    <!-- Testimonial Two Single End -->
                    <!-- Testimonial Two Single Start -->
                    <div class="item">
                        <div class="testimonial-two__single">
                            <div class="testimonial-two__single-inner">
                                <div class="testimonial-two__star">
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                </div>
                                <p class="testimonial-two__text">"Developing our complex e-commerce platform seemed daunting, but the team at Mango Tree made it seamless. From payment gateway integration to custom CMS, everything was delivered on time and bug-free."</p>
                            </div>
                            <div class="testimonial-two__client-info">
                                <div class="testimonial-two__client-img">
                                    <img src="${basePath}assets/images/testimonial/testimonial-2-2.jpg" alt="">
                                </div>
                                <div class="testimonial-two__client-content">
                                    <h4 class="testimonial-two__client-name"><a href="${basePath}testimonials">David Smith</a></h4>
                                    <p class="testimonial-two__sub-title">E-commerce Founder, Sydney</p>
                                </div>
                            </div>
                            <div class="testimonial-two__quote">
                                <span class="icon-right-quote"></span>
                            </div>
                        </div>
                    </div>
                    <!-- Testimonial Two Single End -->
                    <!-- Testimonial Two Single Start -->
                    <div class="item">
                        <div class="testimonial-two__single">
                            <div class="testimonial-two__single-inner">
                                <div class="testimonial-two__star">
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                    <span class="icon-pointed-star"></span>
                                </div>
                                <p class="testimonial-two__text">"Mango Tree Technology's IT consulting services provided us with the strategic roadmap we desperately needed. Their experts were knowledgeable, transparent, and incredibly easy to work with over the past year."</p>
                            </div>
                            <div class="testimonial-two__client-info">
                                <div class="testimonial-two__client-img">
                                    <img src="${basePath}assets/images/testimonial/testimonial-2-3.png" alt="">
                                </div>
                                <div class="testimonial-two__client-content">
                                    <h4 class="testimonial-two__client-name"><a href="${basePath}testimonials">Aisha Johnson</a></h4>
                                    <p class="testimonial-two__sub-title">IT Director, Toronto</p>
                                </div>
                            </div>
                            <div class="testimonial-two__quote">
                                <span class="icon-right-quote"></span>
                            </div>
                        </div>
                    </div>
                    <!-- Testimonial Two Single End -->
                    <!-- Testimonial Two Single End -->
                </div>
            </div>
        </section>
        <!-- Testimonial Two End -->
`
            ;

        // We have to wait for jQuery to load
        const initOwl = () => {
            if (typeof jQuery === 'undefined') {
                setTimeout(initOwl, 50);
                return;
            }
            if (jQuery('.testimonial-two__carousel').length) {
                jQuery('.testimonial-two__carousel').owlCarousel({
                    loop: true,
                    margin: 30,
                    nav: false,
                    smartSpeed: 500,
                    autoHeight: false,
                    autoplay: true,
                    dots: true,
                    autoplayTimeout: 10000,
                    navText: ['<span class="icon-left-arrow"></span>', '<span class="icon-right-arrow"></span>'],
                    responsive: {
                        0: { items: 1 },
                        600: { items: 1 },
                        800: { items: 2 },
                        1024: { items: 2 },
                        1200: { items: 3 }
                    }
                });
            }
        };
        initOwl();
    }
}
customElements.define('app-testimonials', AppTestimonials);

document.addEventListener("DOMContentLoaded", () => {
    // We have to wait for jQuery to load
    const initMobileNav = () => {
        if (typeof jQuery === 'undefined') {
            setTimeout(initMobileNav, 50);
            return;
        }

        // Event delegation for togglers since they are rendered inside Web Components
        jQuery(document).on("click", ".mobile-nav__toggler", function (e) {
            e.preventDefault();
            jQuery(".mobile-nav__wrapper").toggleClass("expanded");
            jQuery("body").toggleClass("locked");
        });

        jQuery(document).on("click", ".mobile-nav__overlay", function (e) {
            e.preventDefault();
            jQuery(".mobile-nav__wrapper").removeClass("expanded");
            jQuery("body").removeClass("locked");
        });

        // Initialize mobile menu content
        if (jQuery(".main-menu__list").length && jQuery(".mobile-nav__container").length) {
            let navContent = document.querySelector(".main-menu__list").outerHTML;
            let mobileNavContainer = document.querySelector(".mobile-nav__container");
            mobileNavContainer.innerHTML = navContent;

            // Binding dropdowns within the mobile menu
            let dropdownAnchor = jQuery(".mobile-nav__container .main-menu__list .dropdown > a");
            dropdownAnchor.each(function () {
                let self = jQuery(this);
                if (!self.find("button").length) {
                    let toggleBtn = document.createElement("BUTTON");
                    toggleBtn.setAttribute("aria-label", "dropdown toggler");
                    toggleBtn.innerHTML = "<i class='fa fa-angle-down'></i>";
                    self.append(toggleBtn);
                    self.find("button").on("click", function (e) {
                        e.preventDefault();
                        let btn = jQuery(this);
                        btn.toggleClass("expanded");
                        btn.parent().toggleClass("expanded");
                        btn.parent().parent().children("ul").slideToggle();
                    });
                }
            });
        }
    };
    initMobileNav();
});

















