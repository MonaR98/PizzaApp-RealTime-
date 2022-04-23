import axios from "axios";
import moment from "moment";


export function initAdmin(){
   const orderTableBody = document.querySelector('#orderTableBody');
   let orders = []
   //markup for table body
   let markup

   axios.get('/admin/orders',{
       headers: {
           "X-Requested-With":"XMLHttpRequest"
        }
   }).then(res =>{
        orders = res.data
        markup = generateMarkup(orders)
        orderTableBody.innerHTML = markup;
   }).catch(err => {
       console.log(err);
   })

   function renderItems(items){
       let parsedItems = Object.values(items)
       return parsedItems.map((menuItem) =>{
           return `
                <p>${ menuItem.item.name } - ${ menuItem.qty } pcs </p> 
           `
       }).join('')
   }


   function generateMarkup(orders){
       return orders.map(order =>{
           return`
            <tr>
                <td class="border px-4 py-2 text-green-900">
                    <p>${ order.id }</p>
                    <div>${ renderItems(order.items) }</div>
                </td>
                <td class="border px-4 py-2"> ${ order.customerId.name }</td>
                <td class="border px-4 py-2"> ${ order.phone }</td>
                <td class="border px-4 py-2"> ${ order.address }</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="POST">
                            <input type="hidden" name="orderId" value="${ order._id }" />
                           

                            <select name="status" onChange="this.form.submit()"
                            class="form-select appearance-none
                            block
                            w-full
                            px-3
                            py-1.5
                            text-base
                            font-normal
                            text-gray-700
                            bg-white bg-clip-padding bg-no-repeat
                            border border-solid border-gray-300
                            rounded
                            transition
                            ease-in-out
                            m-0
                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" aria-label="Default select example">
                            <option value="order_placed"
                            ${ order.status === 'order_placed' ? 'selected' : ''}>Placed</option>
                            <option value="confirmed" ${ order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="prepared" ${ order.status === 'prepared' ? 'selected' : ''}>Prepared</option>
                            <option value="delivered" ${ order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option vlaue="completed" ${ order.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        </form>
                       
                    </div>    
                </td>
                <td class="border px-4 py-2">
                    ${ moment(order.createdAt).format('hh:mm A')}
                </td>
            </tr>
        `
         }).join('')
   }
}

