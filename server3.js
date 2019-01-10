var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
var schema = buildSchema(`
    type Query {
        getProducts(productID:Int,onlyAvailableProducts:Boolean): [Product],
        purchaseProduct(productID:Int!): 
    },
    type Product {
        productID: Int  
        title: String
        price: Float
        inventory_count: Int
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

var cart=[];

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


var root = {
    getProducts
};
// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));