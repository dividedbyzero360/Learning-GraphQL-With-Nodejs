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
                return products;
            }
        }else{
            return products.filter(product => product.productID == productID);
        }
    }
    this.getProduct=function(productID){
        var products=this.getProducts({productID});
        if(products[0]){
            if(products[0].inventory_count==0){
                throw new Error(`Product with product id ${productID} is not left in the stock`);
            }else{
                return products[0];
            }
        }else{
            throw new Error("No product with such a product id "+productID);
        }
        

    }
}

let products=new ProductDatabase();
module.exports=products;

