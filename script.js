// Protect Page
if(localStorage.getItem("logged_in") !== "true"){
  window.location.href="login.html";
}

// Logout
document.getElementById("logoutBtn").onclick = ()=>{
  localStorage.removeItem("logged_in");
  window.location.href="login.html";
};

const list=document.getElementById("list");
const balance=document.getElementById("balance");
const money_plus=document.getElementById("money-plus");
const money_minus=document.getElementById("money-minus");
const form=document.getElementById("form");
const text=document.getElementById("text");
const amount=document.getElementById("amount");
const category=document.getElementById("category");
const search=document.getElementById("search");
const sort=document.getElementById("sort");
const monthFilter=document.getElementById("monthFilter");

let transactions=JSON.parse(localStorage.getItem("transactions"))||[];

let chart;

// Update UI summary
function updateValues(){
  const amounts=transactions.map(item=>item.amount);
  const total=amounts.reduce((acc,item)=>acc+item,0).toFixed(2);
  const income=amounts.filter(item=>item>0).reduce((acc,item)=>acc+item,0).toFixed(2);
  const expense=(amounts.filter(item=>item<0).reduce((acc,item)=>acc+item,0)*-1).toFixed(2);

  balance.innerText=`$${total}`;
  money_plus.innerText=`+$${income}`;
  money_minus.innerText=`-$${expense}`;

  updateChart();
}

// Chart update
function updateChart(){
  if(chart){ chart.destroy(); }

  const totals={Food:0,Travel:0,Shopping:0,Bills:0,General:0,Other:0};

  transactions.forEach(t=>{
    if(t.amount < 0) totals[t.category]+=Math.abs(t.amount);
  });

  chart=new Chart(document.getElementById("expenseChart"),{
    type:"pie",
    data:{
      labels:Object.keys(totals),
      datasets:[{
        data:Object.values(totals),
        backgroundColor:["#ff6b81","#ffa502","#70a1ff","#2ed573","#7bed9f","#ff4d4d"]
      }]
    }
  });
}

// Add transaction element
function addToDOM(transaction){
  const li=document.createElement("li");
  li.style.borderColor=transaction.amount<0?"#ff4d4d":"#2ed573";
  li.innerHTML=`
    ${transaction.text} (${transaction.category})
    <span>${transaction.amount<0?"-":"+"}$${Math.abs(transaction.amount)}</span>
    <button onclick="removeTransaction(${transaction.id})">❌</button>
  `;
  list.appendChild(li);
}

// Remove
function removeTransaction(id){
  transactions=transactions.filter(t=>t.id!==id);
  save();
}

// Save
function save(){
  localStorage.setItem("transactions",JSON.stringify(transactions));
  init();
}

// Init
function init(){
  list.innerHTML="";
  filteredData().forEach(addToDOM);
  updateValues();
}

// Add
form.addEventListener("submit",(e)=>{
  e.preventDefault();

  const t={
    id:Date.now(),
    text:text.value,
    amount:+amount.value,
    category:category.value,
    date:new Date()
  };

  transactions.push(t);
  save();
  form.reset();
});

// Filter logic
function filteredData(){
  let temp=[...transactions];

  // Search
  temp=temp.filter(t=>t.text.toLowerCase().includes(search.value.toLowerCase()));

  // Month
  if(monthFilter.value==="current"){
    const m=new Date().getMonth();
    temp=temp.filter(t=>new Date(t.date).getMonth()===m);
  }

  // Sort
  if(sort.value==="newest") temp.sort((a,b)=>b.id-a.id);
  if(sort.value==="oldest") temp.sort((a,b)=>a.id-b.id);
  if(sort.value==="high") temp.sort((a,b)=>Math.abs(b.amount)-Math.abs(a.amount));
  if(sort.value==="low") temp.sort((a,b)=>Math.abs(a.amount)-Math.abs(b.amount));

  return temp;
}

// Listeners
search.oninput=sort.onchange=monthFilter.onchange=init;

// Export CSV
document.getElementById("exportBtn").onclick=()=>{
  const csv="Text,Amount,Category,Date\n"+transactions.map(t=>`${t.text},${t.amount},${t.category},${t.date}`).join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="transactions.csv";
  a.click();
};

// Clear all
document.getElementById("clearAll").onclick=()=>{
  if(confirm("Are you sure?")){ transactions=[]; save(); }
};

init();
