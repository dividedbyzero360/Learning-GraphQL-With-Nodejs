const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const bodyParser = require("body-parser");
const session = require("express-session");
const productsDatabase = require("./models/Product");
const Cart = require("./models/Cart");
const util = require("./Util/Util");
var schema = buildSchema(`
    type Query {
        getProducts(productID:Int,onlyAvailableProducts:Boolean): [Product]
        viewCart: Cart
    },
    type Mutation {
        addToCart(productID:Int!): Info
        completeCart: Info
    },
    type Product {
        productID: Int  
        title: String
        price: Float
        inventory_count: Int
    },
    type ProductView {
        productID:Int
        title: String
        qty:Int
        price:Int
    },
    type Cart{
        Products:[ProductView]
        totalQty:Int
        totalPrice:Float
    },
    type Info{
        isSuccess:Boolean,
        message: String
    }
`);



/**
 * Adds an available product (inventory_count > 0) to the cart.
 * @param {Object} productID The product id of the product the user wants to add to the cart. Example {productID:1}  
 * @param {Object} req The request object, sent internally by express. Use to track user session 
 * @returns {Object} Returns Object of type {isSuccess:Boolean,message:String}
 * 
 */
let addToCart = function ({ productID }, { req }) {
    var product = productsDatabase.getProducts({ productID })[0];
    let cart = new Cart(req.session.cart ? req.session.cart : {});
    try {
        //Add product to the cart.
        //Throws error if either the product is out of stock
        //or product id is invalid.
        cart.add(product, productID);
    }
    catch (err) {
        return { isSuccess: false, message: err.message }
    }
    //The first time a user successfuly enters a product to his cart
    //a session is created for that user to keep track of his cart
    req.session.cart = cart;
    return { isSuccess: true, message: `Product with product id ${product.productID} successfully added to cart` };
}



let viewCart = function (_, { req }) {
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    return cart.generateCartView();

}
let completeCart = function (_, { req }) {
    if (req.session.cart) {
        var cart = new Cart(req.session.cart);
        try {
            util.verifyCart(cart)
        } catch (err) {
            // One or more product in the cart is either out of stock or is present in more quantity
            //then what is available in the stock.
            return { isSuccess: false, message: err.message }
        }
        //Decrease the product(s) inventory_count that that is/are present in the users cart.
        productsDatabase.decreaseInventoryCountOfProducts(req.session.cart);

        //Successfully checkouts. User's cart is not tracked any more now. Until he puts product in his cart again. 
        req.session.cart = null;
        return { isSuccess: true, message: `You are billed $${cart.totalPrice}. Thank you for shopping with us.` };
    }
    // When a user has no product in his cart.
    else {
        return { isSuccess: false, message: "Please add product to your cart before purchasing" };
    }
}

let getProducts = function ({ productID, onlyAvailableProducts }, { req }) {
    let products = productsDatabase.getProducts({ productID, onlyAvailableProducts });
    if (req.session.cart != undefined) {
        return util.changeInventoryCountForTheUser(products, req.session.cart);
    }
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