var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
var bodyParser =require("body-parser");
var session =require("express-session");
var productsDatabase=require("./models/Product");
var Cart=require("./models/Cart");
//{products:cart.generateArray(),totalPrice:cart.totalPrice}
var schema = buildSchema(`
    type Query {
        getProducts(productID:Int,onlyAvailableProducts:Boolean): [Product],
        
    },
    type Mutation {
        addToCart(productID:Int!): String
        checkOut: Cart
    },
    type Product {
        productID: Int  
        title: String
        price: Float
        inventory_count: Int
    },
    
    type Cart{
        Products:[Product]
        totalQty:Int
        totalPrice:Float
    }
`);

var addToCart = function({productID},{ req }) {
    try{
        var product=productsDatabase.getProduct(productID);
    }catch(err)
    {
        return err.message;
    }
    var cart= new Cart(req.session.cart ? req.session.cart:{});
    cart.add(product,product.productID);
    req.session.cart=cart;
    console.log(req.session.cart)
    return `Product with ${product.productID} successfull added to cart`;
}

var viewCart=function({ req }){
    var cart=new Cart(req.session.cart);
    return cart.generateCartView();
    
}

var root = {
    getProducts:productsDatabase.getProducts,
    addToCart,
    viewCart
};
// Create an express server and a GraphQL endpoint
var app = express();
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