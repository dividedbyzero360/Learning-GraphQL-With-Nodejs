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
            //To stop a user from overloading his cart with the same product.
            // The way Amazon does it.
            throw new Error(`Sorry product ${productID} has a limit of ${storedItem.qty}`);
             
        }
        storedItem.qty++;
        storedItem.price=storedItem.item.price*storedItem.qty;
        this.totalQty++;
        this.totalPrice+=storedItem.item.price;
        this.newItemAdded=true;
    }
    this.generateCartView=function(){
        var productsList=[];
        for(var productID in this.products){
            var storedItem=this.products[productID];
            var product={};
            product.productID=storedItem.item.productID;
            product.title=storedItem.item.title;
            //Same product quantity
            product.qty=storedItem.qty;
            //Same product total price
            product.price=storedItem.price;
            productsList.push(product);
        }
        var cartView={};
        cartView.Products=arr;
        //Overall product quantity
        cartView.totalQty=this.totalQty;
        //Overall product total price
        cartView.totalPrice=this.totalPrice;
        return cartView;
    }

}

