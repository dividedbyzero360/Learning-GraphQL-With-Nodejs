const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const bodyParser = require("body-parser");
const session = require("express-session");
const productsDatabase = require("./models/Product");
const Cart = require("./models/Cart");
const util = require("./Util/Util");
require("./playground")
var schema = buildSchema(`
    type Query {
        getProducts(productID:Int,onlyAvailableProducts:Boolean): [Product]
        viewCart: UserCart
    },
    type Mutation {
        addToCart(productID:Int!): Info
        completeCart: Info
    },
    type Product {
        productID: Int  
        title: String
        price: Float
        #inventory_count: Int
        in_stock: Boolean

    },
    type ProductInCart {
        productID:Int
        title: String
        qty:Int
        price:Float
    },
    type UserCart{
        Products:[ProductInCart]
        totalQty:Int
        totalPrice:Float
    },
    type Info{
        isSuccess:Boolean,
        message: String
    }
`);



/**
 *Adds an available product (inventory_count > 0) to the cart. If an user attempts to add an out of stock product,
 *tries to add a product more than what is available or if the product id is invalid,  he/she gets an error message
 *else a succees message.
 * @param {Object} data An object containing the product id of the product the user wants to add to the cart. Example {productID:1}
 * @param {Number} data.productID   The product id of the product the user wants to add to the cart.
 * @param {Object} req The request object, sent internally by express. Use to track user session 
 * @returns {Info}  Returns an Object of type {isSuccess:Boolean,message:String}
 */
let addToCart = function ({ productID }, { req }) {
    var product = productsDatabase.getProducts({ productID })[0];
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        //Adds product to the cart.
        //Throws error if either the product is out of stock
        //or product id is invalid.
        cart.add(product, productID);
    }
    catch (err) {
        return { isSuccess: false, message: err.message }
    }
    //The first time a user successfully enters a product to his cart
    //a session is created for that user to keep track of his cart.
    req.session.cart = cart;
    return { isSuccess: true, message: `Product with product id ${product.productID} successfully added to cart` };
}


/**
 * Returns an object containing  products list in the user's cart, along with total price and total quantity.
 * Each item in the products list contains information about the product and the count of that product in the cart and
 * also the cummalative total of the product. This method will remove products from the cart if not available.       
 *   
 * @param {*} _  Empty object that gets sent with graphql requests. Ignored in this case
 * @param {Object} req The request object, sent internally by express. Use to track user session  
 * @returns {UserCart} UserCart
 */
let viewCart = function (_, { req }) {
    //If a user has atleast one product in his cart.
    if(req.session.cart){
        try{
            //Make neccessary changes to the cart according to the availability of the products.
            util.verifyCart(req.session.cart);
        }catch(err){

        }
    }
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    return cart.generateCartView();
}
/**
 * Either charges the user the total amount and decreases the inventory_count of the products  
 * or notifies the user of any changes in the product(s) stock in the cart.
 * This method, like viewCart, will remove products from the cart if not available. 
 * @param {*} _ Empty object that gets sent with graphql requests. Ignored in this case
 * @param {Object} req The request object, sent internally by express. Use to track user session
 * @returns {Info} Info
 */
let completeCart = function (_, { req }) {
    if (req.session.cart) {
        try {
            // Verfies whether the cart is same as the user expected
            // i.e. checks if any product got out of stock, or is present in the cart in more quantity
            //than what is available in the stock. Throws error if that is the case.
            // Changes the user cart to represent the exact status,i.e. removes product(s) from the cart
            // that are out of stock or decrease the products according to what is available. 
            util.verifyCart(req.session.cart);
        } catch (err) {
            // One or more product in the cart is either out of stock or is present in the cart in more quantity
            //then what is available in the stock. It lets the user know before billing him/her.
            return { isSuccess: false, message: err.message }
        }
        //Decrease the inventory_count of the products present in the user's cart.
        productsDatabase.decreaseInventoryCountOfProducts(req.session.cart);
        let tempCart=req.session.cart;
        //Successfully checkouts. User's cart is not tracked any more now. 
        //Until she/he put products in his cart again. 
        req.session.cart = null;
        return { isSuccess: true, message: `You are billed $${tempCart.totalPrice}. Thank you for shopping with us.` };
    }
    // When a user has no product in his cart.
    else {
        return { isSuccess: false, message: "Please add product to your cart before purchasing" };
    }
}


let getProducts = function ({ productID, onlyAvailableProducts }, { req }) {
    let products = productsDatabase.getProducts({ productID, onlyAvailableProducts });

    // Uncomment the below code if you want to see different inventory_count per user.
    // Working code, commented it as it is unneccessarily expensive.
    // To give user the idea of whether a product is available or not
    // decided to use the boolean flag "in_stock" instead. 

  //*******************************************************//  
    // if (req.session.cart != undefined) {
    //     return util.changeInventoryCountForTheUser(products, req.session.cart);
    // }
  //********************************************************//
    return products;
}


let root = {
    getProducts,
    addToCart,
    viewCart,
    completeCart
};
// Create an express server and a GraphQL endpoint
let app = express();
const SESSION_SECRET = "secret";
app.use(
    session({
        name: "qid",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        }
    })
);
app.use('/graphql', bodyParser.json(), (req, _, next) => {
    return next();
}, express_graphql(req => ({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: { req }
})));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));