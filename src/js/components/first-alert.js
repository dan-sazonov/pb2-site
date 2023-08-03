document.getElementById("firstAlertBtn").onclick = function () {
  document.getElementById("firstAlertCont").classList.add("d-none");
};

document.getElementById("firstAlertBtn2").onclick = function () {

  document.getElementById("noScripts").classList.add("d-none");
  alert("Да нифига ты не разработчик!");
};
