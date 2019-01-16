// Write logic here to stop a user from overloading his cart with the same product
module.exports=function Cart(oldCart){
    this.products=oldCart.products || {};
    this.totalQty=oldCart.totalQty || 0;
    this.totalPrice=oldCart.totalPrice || 0;
    this.add=function(item,productID){
        if(!item){
            throw new Error("No such product with the product id "+productID);
        }
        var storedItem=this.products[productID];
        if(!storedItem){
            storedItem=this.products[productID]={item:item,qty:0,price:0};
        }
        if(storedItem.qty==item.inventory_count){
            if(item.inventory_count==0){
                delete this.products[productID]; 
                throw new Error(`Sorry product ${productID} is out of stock`);
            }
            throw new Error(`Sorry product ${productID} is out of stock`);
             
        }
        storedItem.qty++;
        storedItem.price=storedItem.item.price*storedItem.qty;
        this.totalQty++;
        this.totalPrice+=storedItem.item.price;
        this.newItemAdded=true;
    }
    this.generateCartView=function(){
        var arr=[];
        for(var productID in this.products){
            var storedItem=this.products[productID];
            var product={};
            product.productID=storedItem.item.productID;
            product.title=storedItem.item.title;
            product.qty=storedItem.qty;
            product.price=storedItem.price;
            arr.push(product);
        }
        var cartView={};
        cartView.Products=arr;
        cartView.totalQty=this.totalQty;
        cartView.totalPrice=this.totalPrice;
        return cartView;
    }

}

//Working code

// this.add=function(item,productID){
//     var storedItem=this.products[productID];
//     if(!storedItem){
//         storedItem=this.products[productID]={item:item,qty:0,price:0};

//     }
//     if(storedItem.qty==item.inventory_count){
//         throw new Error(`Sorry you cannot add more products with product id ${productID} as you have reached the maximum limit available at the moment`);
         
//     }
//     storedItem.qty++;
//     storedItem.price=storedItem.item.price*storedItem.qty;
//     this.totalQty++;
//     this.totalPrice+=storedItem.item.price;
//     this.newItemAdded=true;
// }