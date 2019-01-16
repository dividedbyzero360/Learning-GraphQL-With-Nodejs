const productsDatabase=require("../models/Products");


//This method changes the inventory count of the products that are in the user's cart.
//it does not change the inventory count in the real database
// For example->Let there be 10 phones at the beginning. 
//User A puts 1 phone in his cart, but have not completed the order yet.
// User A will see that now there are 9 phones available.
//However another User B who has not put any phone in his cart
//will see 10 phones until user A completes his cart.

//Please note that the call to this method is commented,
//initially did it this way, but now decided not to show the user
//the inventory_count and instead use "in_stock" flag, as this
//method is unneccessarily slow as it involves copying the 
//whole Products table.  
let changeInventoryCountForTheUser=function(productsArray, cart){
    let newProductsArray=[];
    // The below code is written to create a copy of the database.
    // Since the database is in memory, change for displaying
    // to the user would impact all users. So had to create a copy of it. 
    for(let product of productsArray){
        newProductsArray.push(JSON.parse(JSON.stringify(product)));
    }
    var productKeys=Object.keys(cart["products"]);
    for(let i=0; i< newProductsArray.length;i++){
        if(productKeys.includes(newProductsArray[i]["productID"].toString()))
        {
            newProductsArray[i]["inventory_count"]-=cart["products"][newProductsArray[i]["productID"]].qty;
            if(newProductsArray[i]["inventory_count"]<=0){
                
                newProductsArray[i]["inventory_count"]=0;
                newProductsArray[i]["in_stock"]=false;
            }
            
        }
    }
    
    return newProductsArray;
}


/**
 * Verifies whether the cart is same as the user expected 
 * i.e. checks if any product got out of stock, or is present in the cart in more quantity
 * than what is available in the stock at the moment.The method will remove a product completely if it is out of stock 
 * or remove some quantity of it depending on the inventory_count of the product.
 * If it modifies the cart in any way it throws an Error at the end to notify the caller methods "completeCart" and 
 * "viewCart".     
 * @param {UserCart} cart The UserCart object
 */
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
                cart.totalQty-=cart["products"][productID].qty;
                cart.totalPrice-=cart["products"][productID].price;
                delete cart["products"][productID];
                isCartOk=false;
            }
            // If the user has more number of a product than the available stock
            // then remove the extra of the product from the cart and decrease 
            // the totalPrice and totalQty of the cart. 
            let diff=cart["products"][productID].qty-product["inventory_count"];
            if(diff > 0){
                cart["products"][productID].qty-=diff;
                cart["products"][productID].price-=diff*product.price;
                cart.totalQty-=diff;
                cart.totalPrice-=diff*product.price;
                isCartOk=false;
            }
        }
    }
     if(!isCartOk){
        throw new Error(`One or more product is not available anymore or available in less quantity.
        Please view the cart to see the change or checkout to purchase the remaining products.`);
     }
}



let util={changeInventoryCountForTheUser,verifyCart};

module.exports=util;


    