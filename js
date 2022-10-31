
getFetch() //функция метода GET //todo вызывай функцию после объявления переменных
let toDoArray = []; //основной массив с задачами
let resultArray = []; //массив для объединения заявок при нажатых чекбоксах
let resultArrayActive = []; //массив, заполняемый активными заявками при нажатии соответсвующего чекбокса
let resultArrayBlock = []; //массив, заполняемый отменёнными заявками при нажатии соответсвующего чекбокса
let resultArrayEnd = []; //массив, заполняемый завершёнными заявками при нажатии соответсвующего чекбокса

function sendNewObjective() { //СОЗДАЁТ НОВЫЙ ОБЪЕКТ ЗАДАЧИ
  let now = new Date().toLocaleString();
  let task = '';
  task = document.getElementById("makeNewTask").value;
  if(task === ''){ // todo пустая строка это всегда false, поэтому лучше сделать проверку if (!task)
    alert("Текст задачи не введён");
  }
  else {
  document.getElementById("makeNewTask").value = ""; // очищаем строку для ввода
  let select = document.getElementById("leftFirstBlock"); // todo select ты нигде не используешь, только дальше берешь его value, можно сразу сделать одну переменную selectValue
  let value = select.value;
  let toDoObject = new Object(); //todo лучше сделать так: let toDoObject = { priority: ...,
                                //                                            text: ...,} 
  toDoObject.priority = value === 'Высокий' ? 1 : value === 'Средний' ? 2 : 3;
  toDoObject.text = task;
  toDoObject.time = now;
  toDoObject.status = 2;
  toDoArray.unshift(toDoObject);
  sortOnline() //сортирует по цвету блоки

    return fetch(' http://127.0.0.1:3000/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(toDoObject)
    }).then(()=> {
      getFetch(); //получение функции метода GET сразу после отправки данных на сервер
    });
}}

function getFetch() { //функция метода GET
  return fetch(' http://127.0.0.1:3000/items', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  }).then(response => response.json())
      .then((data) => {
        toDoArray = data;
        sortDateNewOld() //сортировка заявок по дате: от новых к старым
        sortPriorityNo() //сортировка блоков по цвету
        outHtml(data);
      })
}


function outHtml(array) { //ВЫВОДИТ НОВУЮ ЗАДАЧУ В HTML
  let displayTask = '';
  array.forEach((task) => {
    displayTask += `<div class="${task.status === 3 ? 'greenYes' :  task.status === 1 ? 'redNo' : 2 }">
    <div class="finalBlock" id="finalBlock">
  <div class="categoriesImportant">
    <div class="gradationImportant" id="gradationImportant">${task.priority === 1 ? 'Высокий' : task.priority === 2 ? 'Средний' : 'Низкий'}</div>
  </div>
<div class="toDoBlock" id="colorCondition">
  <div class="toDoText" style="width:800px; height:90px;" id="display1">${task.text}</div>
  <div class="time">
  <p id="display">${task.time}</p>
  </div>
  <div class="rightButtons">
<div class="buttonYes" onclick="changeColorYes(${task.id})">
  <button>&#10004;</button>
</div>
  <div class="buttonNo" onclick="changeColorNo(${task.id})">
    <button>&#10006;</button>
  </div>
    <div class="buttonDelete" onclick="deleteBlock(${task.id})">
      <button>&#x1f5d1;</button>
    </div>
  </div>
</div>
</div>
</div>`});
  document.querySelector('#newBlocks').innerHTML = displayTask;}


function changeColorYes(id){  //ИЗМЕНЯЕТ ЦВЕТ БЛОКА НА ЗЕЛЁНЫЙ И ЗАКИДЫВАЕТ ЕГО ВВЕРХ МАССИВА ОБЪЕКТОВ
  const index = toDoArray.findIndex(function checkNumber(task) {
    return task.id === id
  });
  let oneTask = toDoArray[index];
  oneTask.status = 3;
/* при нажатии на кнопку "галочки" мы получаем index элемента по его id, присваиваем переменной oneTask элемент с соответствующим индексом
* и задаём status переменной равный 3. После данных операций обновляем данные на сервере через метод PUT */
  return fetch('http://127.0.0.1:3000/items/'+id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(oneTask)
  })
      .then((response) => response.json())
      .then((data) => {
        toDoArray[index] = data;
        sortPriorityNo() //сортировка блоков по цвету
      })
}


function changeColorNo(id) { //ИЗМЕНЯЕТ ЦВЕТ БЛОКА НА КРАСНЫЙ И ОПУСКАЕТ ЕГО ВНИЗ МАССИВА ОБЪЕКТОВ
//todo функция делает практически то же самое, что и changeColorYes, отличается одной строчкой, где ты меняешь статус.
//todo Соедини две функции в одну и передавай какой-нибудь параметр, чтобы в нужном месте отрабатывала нужная функция
  const index = toDoArray.findIndex(function checkNumber(task) {
    return task.id === id
  });
  let oneTask = toDoArray[index];
  oneTask.status = 1;
  /* при нажатии на кнопку "крестика" мы получаем index элемента по его id, присваиваем переменной oneTask элемент с соответствующим индексом
  * и задаём status переменной равный 1. После данных операций обновляем данные на сервере через метод PUT */
  return fetch('http://127.0.0.1:3000/items/'+id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(oneTask)
  })
      .then((response) => response.json())
      .then((data) => {
        toDoArray[index] = data;
        sortPriorityNo() //сортировка блоков по цвету
      })
}

function deleteBlock(id) { //УДАЛЯЕТ БЛОК ПО НАЖАТИЮ НА КНОПКУ "МУСОР"
  const index = toDoArray.findIndex(function checkNumber(task) {return task.id === id});
  return fetch('http://127.0.0.1:3000/items/' +id, { //todo лучше сразу привыкать писать код красиво, перед id добавь пробел)
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(toDoArray[index])
  })

      .then((response) => response.json())
      .then((data) => {
        toDoArray.splice(index, 1); //удаление элемента по его индексу
        outHtml(toDoArray); //вывод массива после удаления
//todo лишню пустоту тоже убирай)
      })
}

function filterActiveStatusCheck (task) {  //ПРИ НАЖАТИИ НА ЧЕКБОКС ВЫВОДИТ ТОЛЬКО АКТИВНЫЕ ЗАЯВКИ
  const checkboxEnd = document.getElementById('activeStatus');  //рассматривает только чекбокс с id activeStatus
  checkboxEnd.addEventListener('change', (event) => { //задаёт определённый нижеописанный алгоритм для checkboxEnd
      if (event.currentTarget.checked) {                                  //если чекбокс нажат
       resultArrayActive = toDoArray.filter(function (item) {
        return item.status === 2;      //возвращаем только элементы, статус которых равняется 2, и добавляет их в массив resultArrayActive
      })
      resultArray = [].concat(resultArrayActive, resultArrayBlock, resultArrayEnd); //объединяем все 3 ранее заданных массива в resultArray

      filterNo() //  СОРТИРУЕТ БЛОКИ ПО ЦВЕТУ ДЛЯ resultArray
    } else { //если галочка с чекбокса убрана
          resultArray = [].concat(resultArrayEnd, resultArrayBlock); //объединяем в resultArray два других массива
          filterNo() //сортируем блоки по цвету
        resultArrayActive = []; //обнуляем длину массива resultArrayActive
        if(resultArray.length === 0) { //если итоговая длина resultArray равна 0 (это возможно только когда все чекбоксы отжаты), то выводим изначальный массив toDoArray
          outHtml(toDoArray);
        }
      }
  })}

  function filterNo(){ //СОРТИРУЕТ БЛОКИ ПО ЦВЕТУ ДЛЯ resultArray
    resultArray.sort(function (a, b) {
      if (a.status > b.status) {
        return -1;
      }
      else {
        return 1;
      }
    })
    outHtml(resultArray);
}

function filterBlockStatusCheck (id) {  //ПРИ НАЖАТИИ НА ЧЕКБОКС ВЫВОДИТ ТОЛЬКО ОТМЕНЁННЫЕ ЗАЯВКИ
  const checkboxEnd = document.getElementById('blockStatus');  //рассматривает только чекбокс с id blockStatus
  checkboxEnd.addEventListener('change', (event) => { //задаёт определённый нижеописанный алгоритм для checkboxEnd
    if (event.currentTarget.checked) {                                  //если чекбокс нажат
       resultArrayBlock = toDoArray.filter(function (item) {
        return item.status === 1;}) //возвращаем только элементы, статус которых равняется 1, и добавляет их в массив resultArrayBlock
         resultArray = [].concat(resultArrayActive, resultArrayBlock, resultArrayEnd); //объединяем все 3 ранее заданных массива в resultArray

      filterNo() //  СОРТИРУЕТ БЛОКИ ПО ЦВЕТУ ДЛЯ resultArray
       } else { //если галочка с чекбокса убрана
      resultArray = [].concat(resultArrayEnd, resultArrayActive); //объединяем в resultArray два других массива
      filterNo() //сортируем блоки по цвету
      resultArrayBlock = []; //обнуляем длину массива resultArrayBlock
      if(resultArray.length === 0) { //если итоговая длина resultArray равна 0 (это возможно только когда все чекбоксы отжаты), то выводим изначальный массив toDoArray
      //todo здесь лучше проверить так: (!resultArray.length)
       outHtml(toDoArray);
      }
    }
  })}


function filterEndStatusCheck (id) {  //ПРИ НАЖАТИИ НА ЧЕКБОКС ВЫВОДИТ ТОЛЬКО ЗАВЕРШЕННЫЕ ЗАЯВКИ
  const checkboxEnd = document.getElementById('endStatus');  //рассматривает только чекбокс с id endStatus
  checkboxEnd.addEventListener('change', (event) => { //задаёт определённый нижеописанный алгоритм для checkboxEnd
    if (event.currentTarget.checked) {                                  //если чекбокс нажат
       resultArrayEnd = toDoArray.filter(function (item) {
        return item.status === 3; //возвращаем только элементы, статус которых равняется 3, и добавляет их в массив resultArrayEnd
      })
      resultArray = [].concat(resultArrayActive, resultArrayBlock, resultArrayEnd); //объединяем все 3 ранее заданных массива в resultArray
      filterNo() //  СОРТИРУЕТ БЛОКИ ПО ЦВЕТУ ДЛЯ resultArray

    } else { //если галочка с чекбокса убрана
      resultArray = [].concat(resultArrayActive, resultArrayBlock); //объединяем в resultArray два других массива
      filterNo() //сортируем блоки по цвету
      resultArrayEnd = []; //обнуляем длину массива resultArrayEnd
      if(resultArray.length === 0) { //если итоговая длина resultArray равна 0 (это возможно только когда все чекбоксы отжаты), то выводим изначальный массив toDoArray
        outHtml(toDoArray);
      }
    }
  })}
  
  //todo функции filterActiveStatusCheck, filterBlockStatusCheck, filterEndStatusCheck тоже можно объединить в одну) Можешь передавать в нее массив и статус как ты делал в outHtml()

function sortOnline(){ // ПРИ ДОБАВЛЕНИИ НОВОЙ ЗАДАЧИ НОВЫЙ БЛОК ДОБАВИТСЯ ПОД "ЗЕЛЁНЫЕ" (ВЫПОЛНЕННЫЕ) БЛОКИ ЗАДАЧ
  toDoArray.sort(function (a, b) {
    if (a.status > b.status) {
      return -1;
    }
    else {
      return 1;
    }
  })
  outHtml(toDoArray);
}

function sortPriority() { //ОБЩАЯ ФУНКЦИЯ ФУНКЦИЙ С СОРТИРОВКАМИ ПО ПРИОРИТЕТУ ИЗ ВЫПАДАЮЩЕГО СПИСКА
let sortPriority = document.getElementById("sortPriority"); //получает данные о нажатии на выпадающий список
let selectedValue = sortPriority.options[sortPriority.selectedIndex].value; //присваиваем значение выбранного текста в выпадающем списке переменной selectedValue

if(selectedValue === 'Приоритет UP') {
  sortPriorityUp(); //СОРТИРОВКА ПРИОРИТЕТА ПО УБЫВАНИЮ ЧЕРЕЗ ВЫПАДАЮЩИЙ СПИСОК
}
else if(selectedValue === 'Нет'){
  sortPriorityNo();  //ФУНКЦИЯ НА СЛУЧАЙ ОТСУТСТВИЯ СОРТИРОВКИ ПО ПРИОРИТЕТУ ЧЕРЕЗ ВЫПАДАЮЩИЙ СПИСОК
}
 else {
   sortPriorityDown(); //СОРТИРОВКА ПРИОРИТЕТА ПО ВОЗРАСТАНИЮ ЧЕРЕЗ ВЫПАДАЮЩИЙ СПИСОК
}}


function sortPriorityUp(priority) { //СОРТИРОВКА ПРИОРИТЕТА ПО УБЫВАНИЮ ЧЕРЕЗ ВЫПАДАЮЩИЙ СПИСОК
toDoArray.sort(function (a, b) {
  if (a.priority > b.priority) {
    return 1;
  }
  else if (a.priority < b.priority) {
    return -1;
  }
  else {
    return 0;
  }
})
outHtml(toDoArray);
}


function sortPriorityDown(){ //СОРТИРОВКА ПРИОРИТЕТА ПО ВОЗРАСТАНИЮ ЧЕРЕЗ ВЫПАДАЮЩИЙ СПИСОК
  toDoArray.sort(function (a, b) {
  if (a.priority > b.priority) {
    return -1;
  }
  else if (a.priority < b.priority) {
    return 1;
  }
  else {
    return 0;
  }
})
outHtml(toDoArray);
}


function sortPriorityNo(){ //ФУНКЦИЯ НА СЛУЧАЙ ОТСУТСТВИЯ СОРТИРОВКИ ПО ПРИОРИТЕТУ ЧЕРЕЗ ВЫПАДАЮЩИЙ СПИСОК
  sortDateNewOld() //сортировка даты от новых к старым
    toDoArray.sort(function (a, b) {
      if (a.status > b.status) {
        return -1;
      }
      else {
        return 1;
      }
    })
    outHtml(toDoArray);
}


function sortDate() { //ОБЩАЯ ФУНКЦИЯ СОРТИРОВКИ ПО ДАТЕ ЧЕРЕЗ ВЫПАДАЮЩИЙ СПИСОК
  let sortDate = document.getElementById("sortDate"); //получает данные о нажатии на выпадающий список
  let selectedValue = sortDate.options[sortDate.selectedIndex].value; //присваиваем значение выбранного текста в выпадающем списке переменной selectedValue
  if(selectedValue === 'От новых к старым') {
    sortDateNewOld(); //СОРТИРОВКА ДАТЫ СОЗДАНИЯ ОТ НОВЫХ К СТАРЫМ
  }
  else if(selectedValue === 'От старых к новым'){
    sortDateOldNew(); //СОРТИРОВКА ДАТЫ СОЗДАНИЯ ОТ СТАРЫХ К НОВЫМ
}
else{
    dateNo(); //сортировка по дате отсутствует
  }}

function sortDateOldNew() { //СОРТИРОВКА ДАТЫ СОЗДАНИЯ ОТ СТАРЫХ К НОВЫМ
  toDoArray.sort(function (a, b) {
    if (a.time > b.time) {
      return 1;
    }
    else if (a.time < b.time) {
      return -1;
    }
    else {
      return 0;
    }
  })
  outHtml(toDoArray);
}

function sortDateNewOld() {  //СОРТИРОВКА ДАТЫ СОЗДАНИЯ ОТ НОВЫХ К СТАРЫМ
  toDoArray.sort(function (a, b) {
    if (a.time > b.time) {
      return -1;
    }
    else if (a.time < b.time) {
      return 1;
    }
    else {
      return 0;
    }
  })
  outHtml(toDoArray);
}

function dateNo() { //сортировка по дате отсутствует
  sortPriorityNo() //сортирует дату от новых к старым и блоки по цвету
}

function filterPriority() { // ФУНКЦИЯ, ОБЪЕДИНЯЮЩАЯ ФУНКЦИИ ФИЛЬТРОВ ПО ПРИОРИТЕТУ
  let filterPriority = document.getElementById("filterPriority"); //получает данные о нажатии на выпадающий список
  let selectedValue = filterPriority.options[filterPriority.selectedIndex].value; //присваиваем значение выбранного текста в выпадающем списке переменной selectedValue
//todo можно сделать через switch case
  if(selectedValue === 'Высокий') {
    filterPriorityUp() //ФИЛЬТР ПО ВЫСОКОМУ ПРИОРИТЕТУ

  }
  else if (selectedValue === 'Средний') {
    filterPriorityMiddle() //ФИЛЬТР ПО СРЕДНЕМУ ПРИОРИТЕТУ

  }
  else if (selectedValue === 'Низкий') {
    filterPriorityDown() //ФИЛЬТР ПО НИЗКОМУ ПРИОРИТЕТУ

  }
  else {
    filterPriorityEvery()

  }
}

function filterPriorityUp() { //ФИЛЬТР ПО ВЫСОКОМУ ПРИОРИТЕТУ
let filterPriorityUp = toDoArray.filter(function (item) {
  return item.priority === 1;
})

  outHtml(filterPriorityUp);
}


function filterPriorityMiddle() { //ФИЛЬТР ПО СРЕДНЕМУ ПРИОРИТЕТУ
  let filterPriorityMiddle = toDoArray.filter(function (item) {
    return item.priority === 2;
  })

  outHtml(filterPriorityMiddle);
}

function filterPriorityDown() { //ФИЛЬТР ПО НИЗКОМУ ПРИОРИТЕТУ
  let filterPriorityDown = toDoArray.filter(function (item) {
    return item.priority === 3;
  })

  outHtml(filterPriorityDown);
}

//todo filterPriorityUp, filterPriorityMiddle, filterPriorityDown тоже объедини в одну

function filterPriorityEvery() { //ФИЛЬТР БЕЗ ПРИОРИТЕТА
outHtml(toDoArray)
}


window.onload = () => { // ДИНАМИЧЕСКИЙ ПОИСК ЗАДАЧ ПО ТЕКСТУ
  let input = document.querySelector('#searchTaskWithText'); //получает текст из строки с id searchTaskWithText

   input.oninput = function () {
  let val = this.value.trim(); //Значение из строки "Поиск задачи по тексту" в онлайн режиме

  const filteredTD = toDoArray.filter(plan => {
    return plan.text.toLowerCase().includes(val.toLowerCase()) //проверяет, есть ли совпадения между введённым и уже имеющимся текстом
  })
outHtml(filteredTD);
}}

//todo общие комментарии по оформлению кода: В конце строки не забывай ; Убирай лишние пробелы и enterы, и где надо, не забывай их ставить)
