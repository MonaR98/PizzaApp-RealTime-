const Order= require('../../../../app/models/order')

//getting data(order_id and order status) from 'resources/js/afmin.js'
function statusController(){
    return {
        update(req, res){
            Order.updateOne({ _id: req.body.orderId }, {status: req.body.status}, (err, data)=>
            {
                if(err){
                     return res.redirect('/admin/orders');
                }
                //Emit event
                const eventEmitter = req.app.get('eventEitter');
                eventEmitter.emit('orderUpdated',{ id:req.body.orderId, status: req.body.status })
                return res.redirect('/admin/orders');
            } )//this is same as the name attribute of the field from where we are sending this data
        }
    }
}

module.exports=statusController;