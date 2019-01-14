//Every product should have a title, price, and inventory_count.
function ProductDatabase(){
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



    // Returns an array of products
    this.getProducts=({productID,onlyAvailableProducts})=>{ 
        if(productID==undefined) 
        {
            if(onlyAvailableProducts){
                return products.filter(product => product.inventory_count > 0);
            }
            else{
                return products.filter(product=>true);
            }
        }else{
            return products.filter(product => product.productID == productID);
        }
    }

    //This method is only used when the user wants to add a product to his cart
    //It is different from {this.getProducts} in that it throws an error if there 
    //no inventory of the product that the user wants to add to his cart at the moment.
    //This method is called for Server.js "addToCart" method.
    this.getProduct=function(productID){
        var products=this.getProducts({productID});
        if(products[0]){
            if(products[0].inventory_count==0){
                throw new Error(`Product with product id ${productID} is out of stock`);
            }else{
                return products[0];
            }
        }else{
            throw new Error("No product with such a product id "+productID);
        } 
    }
    this.decreaseInventoryCount=function(productIDCountMap){
        for(let productID in productIDCountMap)
        {
            let numberOfSoldIntentory=productIDCountMap[productID];
            for(let product of products){
                if(product.productID==productID){
                    product.inventory_count-=numberOfSoldIntentory;
                    break;
                }
            }
        }
    }

}

let products=new ProductDatabase();
module.exports=products;

