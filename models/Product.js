//Every product should have a title, price, and inventory_count.
function ProductDatabase(){
    var products=[
        {   productID:1,
            title:"Mobile",
            price:555.0,
            inventory_count:10
        },
        {   productID:2,
            title:"TV",
            price:120.0,
            inventory_count:15
        },
        {
            productID:3,
            title:"Headphone",
            price:35,
            inventory_count:0
        },
        {
            productID:4,
            title:"Laptop",
            price:15,
            inventory_count:3
        }
    ];



    //This method takes two optional parameters 
    //1. productID ->In case the user wants the detail of a single product.
    // However if the user sends the productID, then onlyAvailableProducts has no effect.
    //2. onlyAvailableProducts->When it is set to true, only products in stock are shown to the user
    //3. If no parameter is sent all products whether in stock or not are sent.
    this.getProducts=({productID,onlyAvailableProducts})=>{ 
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

    

    //Decreases the inventory count of the products present in the database.
    //It is called when a user completes his cart.   
    this.decreaseInventoryCountOfProducts=function(cart){
        var productKeys=Object.keys(cart["products"]);
        for(var product of products ){
            if(productKeys.includes(product["productID"].toString()))
            {
                product["inventory_count"]-=cart["products"][product["productID"]].qty;   
            }
            
        }
    }
}

let products=new ProductDatabase();
module.exports=products;




