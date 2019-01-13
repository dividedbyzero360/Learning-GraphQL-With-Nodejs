module.exports=function Cart(oldCart){
    this.products=oldCart.products || {};
    this.totalQty=oldCart.totalQty || 0;
    this.totalPrice=oldCart.totalPrice || 0;
    this.add=function(item,productID){
        var storedItem=this.products[productID];
        if(!storedItem){
            storedItem=this.products[productID]={item:item,qty:0,price:0};
    
        }
        storedItem.qty++;
        storedItem.price=storedItem.item.price*storedItem.qty;
        this.totalQty++;
        this.totalPrice+=storedItem.item.price;
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
        var myCart={};
        myCart.Products=arr;
        myCart.totalQty=this.totalQty;
        myCart.totalPrice=this.totalPrice;
        return myCart;
    }

}