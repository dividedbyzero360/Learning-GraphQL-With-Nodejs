const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
const bodyParser =require("body-parser");
const session =require("express-session");
const productsDatabase=require("./models/Product");
const Cart=require("./models/Cart");
//{products:cart.generateArray(),totalPrice:cart.totalPrice}
var schema = buildSchema(`
    type Query {
        getProducts(productID:Int,onlyAvailableProducts:Boolean): [Product]
        viewCart: Cart
    },
    type Mutation {
        addToCart(productID:Int!): String
        completeCart: Cart
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
        price:String
    },
    type Cart{
        Products:[ProductView]
        totalQty:Int
        totalPrice:Float
    }
`);

let addToCart = function({productID},{ req }) {
    try{
        var product=productsDatabase.getProduct(productID);
    }catch(err)
    {
        return err.message;
    }
    let cart= new Cart(req.session.cart ? req.session.cart:{});
    try{
        cart.add(product,product.productID);
        req.session.cart=cart;
    }
    catch(err){
      return err.message;
    }
    console.log(req.session.cart)
    return `Product with ${product.productID} successfull added to cart`;
}

let viewCart=function(_,{ req }){
    var cart=new Cart(req.session.cart ? req.session.cart:{});
    return cart.generateCartView();
    
}
let completeCart=function(_,{ req }){
    var cart=new Cart(req.session.cart ? req.session.cart:{});
    return cart.generateCartView();
}


let root = {
    getProducts:productsDatabase.getProducts,
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
app.use('/graphql',bodyParser.json(),(req, _, next) => {
    console.log(req.session.cart);
    return next();
  }, express_graphql(req=>({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: { req }
})));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));