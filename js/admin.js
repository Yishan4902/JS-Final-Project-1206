//初始
init();
function init(){
    getOrderList();
}

let orderData=[];
const orderList = document.querySelector(".js-orderList")
//為什麼const config在這裡為失敗？放到config.js會成功？

// 訂單渲染
function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,config)
    .then(function (response) {
      orderData=response.data.orders;
      let str="";
      orderData.forEach((item)=>{
        //組時間字串
        let timeStamp = new Date(item.createdAt*1000);
        let orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
        //組產品字串
        let productStr ="";
        item.products.forEach((productsItem)=>{
            productStr+=`<p>${productsItem.title}x${productsItem.quantity}</p>`
        })
        //判斷訂單處理狀態
        let orderStatus ="";
        if(item.paid===true){
            orderStatus="已完成"
        }else{
            orderStatus="未處理"
        }
        //選染訂單
        str+=`<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <p>${productStr}</p>
        </td>
        <td>${orderTime}</td>
        <td class="orderStatus">
          <a href="#" class="js-orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
        </td>
    </tr>`
      })
      orderList.innerHTML=str;
      renderC3();
    })
    .catch(function (error) {
        console.log(error);
    })
}

// 圖表渲染器
function renderC3(){
  //資料整理
  let total = {};
  orderData.forEach((item)=>{
    item.products.forEach((productsItem)=>{
      if(total[productsItem.category]===undefined){
        total[productsItem.category]=productsItem.price * productsItem.quantity;
      }else{
        total[productsItem.category]+=productsItem.price * productsItem.quantity;
      }
    })
  })
  //資料關聯整合
  let categoryAry = Object.keys(total);
  let newData =[];
  categoryAry.forEach((item)=>{
    let ary=[];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary)
  });
  // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            colors:{
                "收納":"#737CA1",
                "床架":"#837E7C",
                "窗簾":"#BCC6CC",
            }
        },
    });
}

// 訂單狀態變更＋訂單刪除
orderList.addEventListener("click",(e)=>{
    e.preventDefault();
    const targetClass = e.target.getAttribute("class")
    let id = e.target.getAttribute("data-id");
    if(targetClass==="js-orderStatus"){
      let status = e.target.getAttribute("data-status");
      changeOrderStatus(status,id);
      return
  };
    if(targetClass==="delSingleOrder-Btn js-orderDelete"){
      deleteOrder(id);
      return
  };
})

function changeOrderStatus(status,id){
  let newStatus;
  if(status=="true"){
    newStatus=false
  }else{
    newStatus=true
  };
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    "data": {
      "id": id,
      "paid": newStatus
    }
  },config)
.then(function(response){
    alert("訂單已處理完成");
    getOrderList();
  })
  
}

function deleteOrder(id){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,config)
    .then(function (response) {
      alert("該筆訂單刪除成功")
      getOrderList();
})
}

// 訂單全數刪除
const discardAllBtn = document.querySelector(".discardAllBtn")
discardAllBtn.addEventListener("click",(e)=>{
  e.preventDefault();
  let deleteClass = e.target.getAttribute("class")
  if(deleteClass=="discardAllBtn"){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,config)
    .then(function (response) {
      alert("訂單已全數刪除")
      getOrderList();
})
  }
})

