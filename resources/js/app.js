import axios from 'axios'
import Noty from 'noty'
import  { initAdmin }  from './admin';
//const initAdmin = require('./admin');

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

initAdmin();
