// init variables
const getVariable = (item)=> document.querySelector(item)
const cartBtn = getVariable('.cart-btn');
const closeCartBtn = getVariable('.close-cart');
const clearCartBtn = getVariable('.clear-cart');
const cartDom = getVariable('.cart');
const cartOverlay = getVariable('.cart-overlay');
const cartItems = getVariable('.cart-items');
const cartTotal = getVariable('.cart-total');
const cartContent = getVariable('.cart-content');
const productsDom = getVariable('.products-center');
let cart = [];
let buttonDom = [];

// getting the products
class Products {
    async getProducts(){
        try{
            let result = await fetch('products.json')
            let data = await result.json()
            let products = data.items
            products = products.map(item =>{
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            })
            return products
        } catch (error) {
            console.log(error)
        }
    }

}
// display the products
class UI {
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            result +=`<article class="product">
                        <div class="img-container">
                            <img src="${product.image}" class="product-img" alt="">
                            <button class="bag-btn" data-id='${product.id}'>
                                <i class="fas fa-shopping-cart"></i>
                                add to bag
                            </button>
                        </div>
                        <h3>${product.title}</h3>
                        <h4>$${product.price}</h4>
                    </article>`;
        });
        productsDom.innerHTML = result;
    }
    getBagButton(){
        let buttons = [...document.querySelectorAll('.bag-btn')];
        buttonDom = buttons;
        buttons.forEach(button=>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerText = 'In Cart';
                button.disabled = true;
            } else {
                button.addEventListener('click', (event)=>{
                    event.target.innerText = 'In Cart';
                    event.target.disabled = true;
                    // get products from localstorge
                    let cartItem = {...storage.getProduct(id), amount: 1};
                    cart = [...cart, cartItem];
                    storage.saveCart(cart);
                    this.setCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart();
                   
                })
            }
        })
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let totalItems =0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            totalItems += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = totalItems;
        
    }
    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src="${item.image}" alt="">
                        <div>
                            <h4>${item.title}</h4>
                            <h5>$${item.price}</h5>
                            <span class="remove-item" data-id=${item.id}>remove</span>
                        </div>
                        <div>
                            <i class="fas fa-chevron-up" data-id=${item.id}></i>
                            <p class="item-amount">${item.amount}</p>
                            <i class="fas fa-chevron-down"  data-id=${item.id}></i>
                        </div>`
        cartContent.appendChild(div);
    }
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDom.classList.add('showCart')
    }
    setupApp(){
        cart = storage.getCart()
        
        this.setCartValues(cart);
        this.populate(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click', ()=>this.closeCart())
    }
    populate(cart) {
        cart.forEach(item => this.addCartItem(item))
    }
    closeCart(){   
        cartOverlay.classList.remove("transparentBcg");
        cartDom.classList.remove('showCart')
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', ()=>this.clearCart());
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id);
            } else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let temItems = cart.find(item => item.id === id);
                temItems.amount = temItems.amount + 1;
                storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = temItems.amount;
                console.log(addAmount);
            } else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let temItems = cart.find(item => item.id === id);
                temItems.amount = temItems.amount - 1;
                if(temItems.amount > 0) {
                    storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = temItems.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeItem(id)
                }
            }
            
        })
    }
    clearCart() {
        let cartItem = cart.map(item => item.id);
        cartItem.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.closeCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        storage.saveCart(cart);
        let button = this.getSinglebutton(id);
        button.disabled = false;
        button.innerHTML = `<i class='fas fa-shopping-cart'></i>add to cart`; 
    };
    getSinglebutton(id){
        return buttonDom.find(button =>button.dataset.id === id);
    }
}
// local storage
class storage {
    static saveProducts(products){
        localStorage.setItem('porducts', JSON.stringify(products))
    } 
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('porducts'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
       localStorage.setItem('cart', JSON.stringify(cart)); 
    }
    static getCart() {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

// preserve the data
document.addEventListener('DOMContentLoaded', ()=>{
    const ui = new UI();
    const products = new Products();
    // get all products
    ui.setupApp();
    products.getProducts().then(products =>{
        ui.displayProducts(products)
        storage.saveProducts(products);  
    }).then(()=>{ 
        ui.getBagButton();
        ui.cartLogic();
    })
})

