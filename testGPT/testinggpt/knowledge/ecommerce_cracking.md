# E-Commerce Domination Playbook

When an E-commerce platform (Shopify, Magento, WooCommerce) is detected, execute these attack chains:

## 1. Shopify Exploitation
- **Information Disclosure**: Access `/cart.json`, `/products.json`, or `/meta.json` to find internal IDs and hidden product details.
- **Theme Manipulation**: Look for leaked API keys in `theme.js` or `app.js` that might allow modified checkout flows.
- **App Audit**: Identify installed third-party apps and check for known vulnerabilities in common Shopify apps (e.g., reviews, wishlists).

## 2. Magento (Adobe Commerce)
- **Admin Panel**: Check for `/admin`, `/admin_123`, or custom admin URIs.
- **RCE Vulnerabilities**: Check for `CVE-2022-24086` (Template Injection) or `CVE-2016-4010`.
- **Config Access**: Attempt to read `app/etc/local.xml` or `env.php` for database credentials.

## 3. WooCommerce (WordPress)
- **Plugin Audit**: Check for `vulnerable plugins` like "File Manager", "Contact Form 7", or outdated versions of WooCommerce itself.
- **Checkout Overrides**: Test for logic flaws in the discount/coupon system.
- **User Enumeration**: Use `/wp-json/wp/v2/users` to find store owner accounts.

## 4. Payment Gateway Interception
- **Client-Side Keys**: Identify Stripe `pk_live_...`, PayPal `ClientID`, or Razorpay `key_id` in the frontend code.
- **Price Manipulation**: Attempt to modify the price of items in the cart before checkout (if handled client-side).
- **Callback Testing**: Intercept and replay webhooks if the signature verification is weak.
