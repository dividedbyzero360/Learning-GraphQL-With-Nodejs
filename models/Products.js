//Every product should have a title, price, and inventory_count.
function ProductDatabase(){
    var products=[
        {   productID:1,
            title:"Mobile",
            price:555.0,
            inventory_count:10,
            in_stock:true
        },
        {   productID:2,
            title:"TV",
            price:120.0,
            inventory_count:15,
            in_stock:true
        },
        {
            productID:3,
            title:"Headphone",
            price:35,
            inventory_count:0,
            in_stock:false
        },
        {
            productID:4,
            title:"Laptop",
            price:15,
            inventory_count:3,
            in_stock:true
        }
    ];



    
    /**
     * The method takes an Object with two optional properties.
     * 1. productID ->In case when the user wants the detail of a single product. When "productID" is present
     * "onlyAvailableProducts" has no effect.
     * 2. onlyAvailableProducts->In case when the user want the details of only products currently in stock.
     * 3. If no property is set all products whether in stock or not are sent.
     * @param {Object} data  Object with optional properties of type {productID: Number, onlyAvailableProducts: Boolean}
     * @param {Number} data.productID Optional productID
     * @param {Boolean} data.onlyAvailableProducts  Optional onlyAvailableProducts
     * @returns {[Product]} Returns an array of Product
     */
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
   
    /**
     * Decreases the inventory_count of the products in the database 
     * for the products present in the user cart. It is called when
     * a user can successfully complete his/her cart.s 
     * @param {UserCart} cart The UserCart object
     */
    this.decreaseInventoryCountOfProducts=function(cart){
        var productKeys=Object.keys(cart["products"]);
        for(var product of products ){
            if(productKeys.includes(product["productID"].toString()))
            {
                product["inventory_count"]-=cart["products"][product["productID"]].qty;   
                if(product["inventory_count"]==0){
                    product["in_stock"]=false;
                }
            }
            
        }
    }
}

let products=new ProductDatabase();
module.exports=products;




