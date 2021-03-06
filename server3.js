//Fit these product purchases into the context of a simple shopping cart. 
// That means purchasing a product requires first creating a cart, 
//adding products to the cart, and then "completing" the cart.
// The cart should contain a list of all included products,
// a total dollar amount (the total value of all products), 
//and product inventory shouldn't reduce until after a cart has been completed.
var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
var bodyParser =require("body-parser");
var schema = buildSchema(`
    type Query {
        getProducts(productID:Int,onlyAvailableProducts:Boolean): [Product],
    },
    type Mutation {
        addToCart(productID:Int!): Cart
        checkOut: Cart
    },
    type Product {
        productID: Int  
        title: String
        price: Float
        inventory_count: Int
    }
    type Cart{
        Products:[Product]
        Message:String
        TotalPrice: Float
    }
`);


//Every product should have a title, price, and inventory_count.
var products=[
    {   productID:1,
        title:"Mobile",
        price:5.0,
        inventory_count:10
    },
    {   productID:2,
        title:"TV",
        price:11.0,
        inventory_count:15
    },
    {
        productID:3,
        title:"Headphones",
        price:15,
        inventory_count:0
    }
];

var cart={
    Products:[],
    Message:"",
    TotalPrice:0
}

var userPersonalCart={

}

var getProducts=({productID,onlyAvailableProducts})=>{ 
    if(productID==undefined)
    {
        if(onlyAvailableProducts){
            return products.filter(product => product.inventory_count > 0);
        }
        else{
            return products;
        }
    }else{
        return products.filter(product => product.productID == productID);
    }
}

var addToCart = function({productID}) {
    var product=getProducts({productID})[0];
    if(product.inventory_count == 0 )
    {
       cart.Message=`Sorry, product ${product.title} is not avialable at the moment.`;
    }else{
        cart.Products.push(product);
        cart.TotalPrice+=product.price;
        cart.Message="Product successfully added.";
    }
    return cart;
}

var root = {
    getProducts,
    addToCart
};
// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql',bodyParser.json(),(req, _, next) => {
    console.log(req);
    return next();
  }, express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));