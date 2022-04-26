import axios from 'axios'
import Noty from 'noty'
import  { initAdmin }  from './admin';
import moment from 'moment'; 

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");

function updateCart(pizza){
    //ajax call to server using axios library
    axios.post('/update-cart', pizza).then(res => {
        cartCounter.innerText=res.data.totalQty;
        new Noty({
            type:'success',
            timeout:1000,
            text:'Pizza added to cart',
            progressBar:false,
        }).show();
    }).catch(err => {
        new Noty({
            type:'error',
            timeout:1000,
            text:'Something went wrong!',
            progressBar:false,
        }).show();
    })
}

addToCart.forEach((btn) =>{
    btn.addEventListener("click",(e) =>{
        let pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
        //console.log(pizza);
    })
})

//remove alert message

const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
    setTimeout(()=>{
        alertMsg.remove();
    },2000);
}



//update order status
let statuses = document.querySelectorAll('.status-line');
let input = document.querySelector("#hiddenInput");
let order = input ? input.value : null;
order=JSON.parse(order);
let time= document.createElement('small');

function updateStatus(order){
    statuses.forEach((status)=>{
        status.classList.remove('step-completed');
        status.classList.remove('current');
    })
    let stepCompleted=true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status;
        if(stepCompleted){
            status.classList.add();
        }

        if(dataProp === order.status){
            stepCompleted=false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);
            if(status.nextElementSibling){
            status.nextElementSibling.classList.add('current');
            }
        }
    })

}

updateStatus(order);

//Socket
let socket = io();
initAdmin(socket);
//Join
if(order){
    socket.emit('join',`order_${order._id}`)
}

//Identify if it's from admin page or not

let adminAreaPath = window.location.pathname;//this will give us the url
if(adminAreaPath.includes('admin')){
    socket.emit('join','adminRoom');
}

socket.on('orderUpdated', (data) =>{
    const updatedOrder={...order };
    updatedOrder.updatedAt=moment().format();
    updatedOrder.status=data.status;
    updateStatus(updatedOrder);
    new Noty({
        type:'success',
        timeout:1000,
        text:'Order updated',
        progressBar:false,
    }).show();

    
})
//
