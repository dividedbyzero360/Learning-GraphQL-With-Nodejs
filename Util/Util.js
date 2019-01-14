//This method changes the inventory count of the products that are in the user's cart.
//it does not change the inventory count in the real database
// For example->Let there be 10 phones at the beginning. 
//User A puts 1 phone in his cart, but have not completed the order yet.
// User A will see that now there are 9 phones available.
//However another User B who has not put any phone in his cart
//will see 10 phones until user A completes his cart.

var changeInventoryCountForTheUser=function(productsArray, cart){
    var productKeys=Object.keys(cart["products"]);
    for(var product of productsArray ){
        if(productKeys.includes(product["productID"].toString()))
        {
            product["inventory_count"]-=cart["products"][product["productID"]].qty;
        }
    }
    //newItemAdded flag is to ensure that this method only runs when a user has added a new item,
    //before viewing the products.
    //To view products the user calls the "getProducts" query which in turn
    //call or does not call this method based on this flag.
    //This flag is set to true in Cart.js "add" method.
    cart.newItemAdded=false;
return productsArray;
}

let util={changeInventoryCountForTheUser};

module.exports=util;