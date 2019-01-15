const productsDatabase=require("../models/Product");

//This method changes the inventory count of the products that are in the user's cart.
//it does not change the inventory count in the real database
// For example->Let there be 10 phones at the beginning. 
//User A puts 1 phone in his cart, but have not completed the order yet.
// User A will see that now there are 9 phones available.
//However another User B who has not put any phone in his cart
//will see 10 phones until user A completes his cart.
let changeInventoryCountForTheUser=function(productsArray, cart){
    let newProductsArray=[];
    for(let product of productsArray){
        newProductsArray.push(JSON.parse(JSON.stringify(product)));
    }
    console.log(newProductsArray);
    var productKeys=Object.keys(cart["products"]);
    for(let i=0; i< newProductsArray.length;i++){
        if(productKeys.includes(newProductsArray[i]["productID"].toString()))
        {
            newProductsArray[i]["inventory_count"]-=cart["products"][newProductsArray[i]["productID"]].qty;
            if(newProductsArray[i]["inventory_count"]<0){
                newProductsArray[i]["inventory_count"]=0;
            }
        }
    }
    //newItemAdded flag is to ensure that this method only runs when a user has added a new item,
    //before viewing the products.
    //To view products the user calls the "getProducts" query which in turn
    //call or does not call this method based on this flag.
    //This flag is set to true in Cart.js "add" method.
    cart.newItemAdded=false;
    return newProductsArray;
}

let verifyCart=function(cart){
    let products=productsDatabase.getProducts({});
    let isCartOk=true;
    var productKeys=Object.keys(cart["products"]);
    for(var product of products ){
        let productID=product["productID"];
        if(productKeys.includes(product["productID"].toString())){
            //if inventory count for the product in the database is already zero 
            //then remove the same product from the cart and also decrease the totalPrice
            //and totalQty of the cart.
            if(product["inventory_count"]==0)
            {
                cart.totalQty-=cart["products"][product["productID"]].qty;
                cart.totalPrice-=cart["products"][product["productID"]].price;
                delete cart["products"][product["productID"]];
                isCartOk=false;
            }
            // If the user has more number of a product then the available stock
            // then remove the extra of the product from the cart and decrease 
            //the totalPrice and totalQty of the cart. 
            let diff=cart["products"][product["productID"]].qty-product["inventory_count"];
            if(diff > 0){
                cart["products"][product["productID"]].qty-=diff;
                cart["products"][product["productID"]].price-=diff*product.price;
                cart.totalQty-=diff;
                cart.totalPrice-=diff*product.price;
                isCartOk=false;
            }
        }
    }
     if(!isCartOk){
        throw new Error(`One or more product are not available any more.
                     Please view the cart to see the changes or checkout to purchase the reamining products`);
     }
}



let util={changeInventoryCountForTheUser,verifyCart};

module.exports=util;



//if some products in a users cart got out of stock then let the user know
            //before the checkout 
            // if(isCartChanged){
            //     throw new Error(`A product with product id ${outOfStockProductID} got out of stock.
            //     Please call viewCart to see and the changes or checkout to confirm order of the remaining products`);
            //  }