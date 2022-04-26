const { find } = require('laravel-mix/src/File');
const Order=require('../../../models/order');
const moment = require('moment');

function orderController () {
    return {
        
        async index(req, res){
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort:{ 'createdAt':-1 }})
            //setting the header to display the alert of 'successfully placed order' will not display reloading of this page.
            res.header('Cache-control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')  
           // console.log(orders)  
           res.render('customers/orders',{orders: orders, moment:moment});
        },


        store(req,res){
            const {phone, address} = req.body;
          //Validate request
          if(!phone || !address){
              req.flash('error','*All fields are required');
              return res.redirect('/cart');
          }
            const order =  new Order({
                customerId:req.user._id,
                items: req.session.cart.items,
                phone:phone,
                address:address,
            })

            order.save().then(result=>{
                Order.populate(result, { path: 'customerId' }, (err, placedOrder)=>{
                    req.flash('success','Order placed successfully!');
                delete req.session.cart;
                //emit event
                const eventEitter = req.app.get('eventEmitter');
                eventEitter.emit('orderPlaced', placedOrder);
                return res.redirect('/customer/orders');
                })
               }).catch(error =>{
                req.flash('error','Something went wrong');
                return res.redirect('/cart');
            })

        },

        async show(req,res){
            const order = await Order.findById(req.params.id);//Here the 'id' is same as defined in the route for this method, i.e.'app.get('/customer/orders/:id',auth, orderController().show)' line of web.js file.
            //Authourize user
            if(req.user._id.toString() === order.customerId.toString()){
               return res.render('customers/singleOrder', { order: order })
            }
            return res.redirect('/')

             
        }
    }   
}

module.exports= orderController;