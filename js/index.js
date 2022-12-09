const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');


//初始化
function init(){
    getProductList();
    getCartList();
}
init();

let productData=[]; //產品資料
let cartData=[]; //購物車資料


//產品資料API get
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products
    `)
    .then(function(response){
     productData=response.data.products;
     renderProductList()
     })
     .catch(function (error) {
        alert("資料傳輸失敗");
        console.log(error);
     }) 
}

//商品渲染器
function renderProductList(){
    let str='';
    productData.forEach((item)=>{
        str+=mergeProductHTML(item);
    })
    productList.innerHTML = str;
}

function mergeProductHTML(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)
    }</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`
}

//監聽select
productSelect.addEventListener("change",(e)=>{
 const category = e.target.value;
 if(category==='全部'){
    renderProductList();
    return;
 }
 let str = ""; 
 productData.forEach((item)=>{
    if(item.category===category){
        str+=mergeProductHTML(item);
    }
 })
 productList.innerHTML=str;
})

//商品列表監聽 API post
productList.addEventListener("click",(e)=>{
    e.preventDefault();
    let addToCart = e.target.getAttribute("class");
    if(addToCart!=="addCardBtn"){
        return;
    }
    let productId = e.target.getAttribute("data-id");
    let numClick = 1;
    cartData.forEach((item)=>{
        if(productId===item.product.id){
            numClick+=item.quantity;
        } 
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
          "productId": productId,
          "quantity": numClick
        }
      }
    )
    .then(function(response){
        alert("已成功加入購物車");
        renderCartList(); //若使用renderCartList()，post商品後購物車不會更新數量
     })
     .catch(function (error) {
        alert("資料傳輸失敗");
        console.log(error);
     }) 
})

//購物車資料
const cartList = document.querySelector(".shoppingCart-table-list")
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts
    `)
    .then(function(response){
        //補總金額變化
     document.querySelector(".js-total").textContent=toThousands(response.data.finalTotal);
     cartData=response.data.carts;
     renderCartList();
   }) 
   .catch(function (error) {
    alert("資料傳輸失敗");
    console.log(error);
 }) 
}


//購物車渲染器
function renderCartList(){
    let str ="";
     cartData.forEach((item)=>{
        str+=`<tr>
        <td>
            <div class="cardItem-title">
                <img src="${item.product.images}">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${toThousands(item.product.price)}</td>
        <td>${toThousands(item.quantity)}
        </td>
        <td>NT$${toThousands(item.product.price*item.quantity)}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id=${item.id}>
                clear
            </a>
        </td>
        </tr>`;
    })
    cartList.innerHTML=str;
}

//購物車監聽 API delete(id)
cartList.addEventListener("click",(e)=>{
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id")
    if(cartId===null){
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
        alert("已成功刪除");
        getCartList();
    }) 
    .catch(function (error) {
        alert("資料傳輸失敗");
        console.log(error);
    })
})


//全數清空Carts
const discardAllBtn=document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        alert("購物車已全數清空");
        getCartList();
    })     
    .catch(function (error) {
        alert("資料傳輸失敗");
        console.log(error);
     }) 
})

//訂單資料post
const orderInfoBtn = document.querySelector(".orderInfo-btn")
orderInfoBtn.addEventListener("click",(e)=>{
    e.preventDefault();
    if(cartData.length===0){
        alert("您的購物車沒有商品");
        return;
    }
const customerName = document.querySelector("#customerName").value;
const customerPhone = document.querySelector("#customerPhone").value;
const customerEmail = document.querySelector("#customerEmail").value;
const customerAddress = document.querySelector("#customerAddress").value;
const customerTradeWay = document.querySelector("#tradeWay").value;

//表單驗證
if(customerName==""||customerPhone==""||customerEmail==""||customerAddress==""||customerTradeWay==""){
    alert("請確認訂單資訊皆已填妥")
    return;
}else if(validatePhone(customerPhone)==false){
    document.querySelector(`[data-message="電話"]`).textContent="請填寫正確手機格式";
    return;
}else if(validateEmail(customerEmail)==false){
    document.querySelector(`[data-message="Email"]`).textContent="請填寫正確e-mail格式";
    return;
}

axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name":customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  }
    )
    .then(function(response){
       alert("訂單已成功送出");
       document.querySelector("#customerName").value="";
        document.querySelector("#customerPhone").value="";
        document.querySelector("#customerEmail").value="";
        document.querySelector("#customerAddress").value="";
        document.querySelector("#tradeWay").value="ATM";
        getCartList();
     })
     .catch(function (error) {
        alert("資料傳輸失敗");
        console.log(error);
     }) 

})



//util js 

function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

function validateEmail(mail) {
   if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
      return true
    }else{
      return false
    }
  }
  
function validatePhone(phone) {
    if (/^09[0-9]{8}$/.test(phone)){
       return true
     }else{
       return false
     }
   }
   
