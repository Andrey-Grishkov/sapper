startGame(16, 16, 40);

//Вытаскиваем кнопку со смайликом
const smileBtn = document.querySelector('.smile');

//Функция запуска игры
function startGame(WIDTH, HEIGHT, trap) {
  //Создаем поле с ячейками
  const field = document.querySelector('.game__field');
  const cellsCount = WIDTH * HEIGHT;
  field.innerHTML = '<button class="cell"></button>'.repeat(cellsCount);
  const cells = [...field.children];

  //Создаем счетчик закрытых ячеек
  let closedCells = cellsCount;

  //Создаем массив куда будем складывать ячейки отмеченные флагом
  let flagMass = [];

  //Создаем массив куда будем складывать ячейки отмеченные вопросом
  let questMass = [];

//____________________________________________________BOMBS__________________________________________________________
  //Минимальное значение диапазона случайных чисел (первый возможный индекс бомбы)
  const min = 0;

  //Создаем уникальную коллекцию, чтобы номера индексов бомбы не повторялись
  const bombsSet = new Set();

  //Добавляем в коллекцию индексы бомб от min до cellsCount(не включительно, т.к. индексы идут от 0), пока размер
  // коллекции не станет равным trap
  while(bombsSet.size !== trap) {
    bombsSet.add(Math.floor(Math.floor(Math.random() * (cellsCount - min)) + min));
  }

  //Создаем пустой массив для бомб
  let bombs = []

  //Наполняем массив бомбами из коллекции
  bombsSet.forEach(function(value) {
   bombs.push(value);
  })
//_________________________________________________Listener________________________________________________________

//вешаем слушатель на нажатие на элементы поля
  field.addEventListener('click', (event) => {
    //прерываем функцию, если кликаем не на ячейку
    if(event.target.tagName !== 'BUTTON') {
      return
    }
    //Определяем индекс ячейки в которой произошло событие
    const index = cells.indexOf(event.target);
    //Определяем номер колонки, как остаток от деления индекса элемента на ширину таблицы
    const column = (index) % WIDTH;
    //Определяем номер ряда, как округление от деления индекса элемента на ширину таблицы
    const row = Math.floor((index)/WIDTH);

    //Открываем выбранную ячейку
    open(row, column);
  })

  // Обработка правого клика мыши
  field.oncontextmenu = function(e) {
    e.preventDefault();
    if(event.target.tagName !== 'BUTTON') {
      return
    }
    //Определяем индекс ячейки в которой произошло событие
    const index = cells.indexOf(event.target);
    //Определяем номер колонки, как остаток от деления индекса элемента на ширину таблицы
    const column = (index) % WIDTH;
    //Определяем номер ряда, как округление от деления индекса элемента на ширину таблицы
    const row = Math.floor((index)/WIDTH);
    //Создаем метку, что кнопка открыта по правому щелчку мыши
    const flag = 'right';
    //Открываем выбранную ячейку
    open(row, column, flag);
  }

//__________________________________________________OPEN_______________________________________________________

  //Открытие ячейки при нажатии
  function open (row, column, flag) {

    //Проверяем входит ли колонка и ряд в область таблицы, так как при открытии пустых клеток при рекурсии сюда могут
    // прийти несуществующие колонки и ряды и изменить индекс элемента
    if (!isValid(row, column)) {
      return
    }

    //Определям индекс обратным действием: как произведение ряда на длину таблицы и плюс номер колонки
    const index = row * WIDTH + column;

    //Достаем из разметки конкретную кнопку ячейки
    const cell = cells[index];

    //Отрабатывается первое нажатие, когда все клетки закрыты
    if(closedCells===HEIGHT*WIDTH){
      // Вызываем функцию проверки бомбы, если бомба, то заменяем индекс бомбы, чтобы при первом нажатии не было бомбы
      if(bombs.includes(index)){
        let bombIndex = bombs.indexOf(index);
        bombs.splice(bombIndex, 1)
        //Если бомба при первом клике, то сдвигаем бомбу на одну клетку, если там уже есть бомба, то на 2 клетки, если
        // и там есть, то на 3 клетки, если там занято - то бомба просто удаляется
        if(!bombs.includes(index+1)) {
          bombs.push(index+1);
        } else if(!bombs.includes(index+2)){
          bombs.push(index+2);
        } else if(!bombs.includes(index+3)) {
          bombs.push(index+3);
        }
      }
    }

    //Если кнопка открыта правым щелчком мыши, то ставим на ней флаг и добавляем индекс в массив флагов
    if (flag === 'right'){
      //Если на кнопке стоит уже флаг, то ставим вопрос
      if (flagMass.includes(index) || questMass.includes(index)){
        if(questMass.includes(index)){
          //Убираем вопрос из массива вопросов
          let quesIndex = questMass.indexOf(index);
          questMass.splice(quesIndex, 1)
          cell.classList.remove('cell_state_quest', 'cell_state_flag');
          //Делаем ячейку кликабельной
          cell.disabled = false;
          return
        }

        //Убираем флаг из массива флагов и добавляем вопрос в массив вопросов
        let flagIndex = flagMass.indexOf(index);
        flagMass.splice(flagIndex, 1)
        cell.classList.add('cell_state_quest');
        questMass.push(index);
        return
      }

      //Если ячейка уже неактивна - прерываем функцию
      if (cell.disabled === true){
        return;
      }

      cell.classList.add('cell_state_flag');
      flagMass.push(index);
      cell.disabled = true;
      return
    }

    //Если ячейка уже неактивна - прерываем функцию
    if (cell.disabled === true){
      return;
    }

    //Делаем ячейку неактивной после нажатия
    cell.disabled = true;
//____________________________________________________Поражение________________________________________________________
    //Вставляем значение в выбранную ячейку.
    // Вызываем функцию проверки бомбы, если бомба, то вставляем значек бомбы.
    if(isBomb(row, column)){

      //Отображаем ячейку как взорвавшиеся бомба
      cell.classList.add('cell_state_bombed-red');

      //Убираем взорвавшиюся бомбу из массива бомб
      let bombIndex = bombs.indexOf(index);
      bombs.splice(bombIndex, 1)

      //Останавливаем таймер
      clearInterval(TimeInterval);

      //Удаляем слушатель, если попадание в бомбу было с первого раза
      buttonRun.removeEventListener('click', setTimer);

      //Открываем остальные бомбы
      bombs.forEach(bombIndexShow => {
        //Если бомба была отмечена флажком или вопросом, то ставим там значек с зачеркнутой бомбой
        if (flagMass.includes(bombIndexShow) || questMass.includes(bombIndexShow)){
          cells[bombIndexShow].classList.remove('cell_state_quest', 'cell_state_flag');
          cells[bombIndexShow].classList.add('cell_state_bombed-err');
        } else {
          cells[bombIndexShow].classList.add('cell_state_bombed');
        }
        })
      //Блокируем все поле
      flagMass = [];
      questMass = [];
      cells.forEach(cell => cell.disabled = true)
      smileBtn.classList.add('smile_state_lose');
      return
    }
//_____________________________________________________________________________________________________________________

    //Уменьшаем счетчик закрытых ячеек
    closedCells--;

//_____________________________________________ПОБЕДА___________________________________________________________________
    //Если закрытых ячеек меньше или равно количеству бомб, то пользователь выиграл
    if(closedCells<=trap){
      smileBtn.classList.add('smile_state_win');
      console.log('you win')

      //Останавливаем таймер
      clearInterval(TimeInterval);

      //Удаляем слушатель, если выиграли с первого нажатия
      buttonRun.removeEventListener('click', setTimer);

      //Открываем остальные бомбы
      bombs.forEach(bombIndexShow => {
        //Если бомба была отмечена флажком или вопросом, то ставим там значек с зачеркнутой бомбой
        if (flagMass.includes(bombIndexShow) || questMass.includes(bombIndexShow)){
          cells[bombIndexShow].classList.remove('cell_state_quest', 'cell_state_flag');
          cells[bombIndexShow].classList.add('cell_state_bombed-err');
        } else {
          cells[bombIndexShow].classList.add('cell_state_bombed');
        }
      })
      //Блокируем все поле
      cells.forEach(cell => cell.disabled = true)
    }
//______________________________________________________________________________________________________________________


    //если бомбы в ячейке нет, вызываем функцию проверки бомб по соседству от выбранной ячейки, которая возвращаяет
    // кол-во бомб вокруг ячейки.
    const count = getCount(row, column);

    //если вокруг ячейки есть бомбы, то вписываем в ячейку кол-во соседних бомб
    if(count !== 0){
      switch (count){
        case 8: cell.classList.add('cell_state_geted-eight');
          break;
        case 7: cell.classList.add('cell_state_geted-seven');
          break;
        case 6: cell.classList.add('cell_state_geted-six');
          break;
        case 5: cell.classList.add('cell_state_geted-five');
          break;
        case 4: cell.classList.add('cell_state_geted-four');
          break;
        case 3: cell.classList.add('cell_state_geted-three');
          break;
        case 2: cell.classList.add('cell_state_geted-two');
          break;
        case 1: cell.classList.add('cell_state_geted-one');
          break;
        default: cell.classList.add('cell_state_disabled');
      }
      return;
    }

    //если вокруг ячейки нет бомб, то открываем соседние ячейки до ячееек у которых есть по соседству бомбы
    cell.classList.add('cell_state_disabled');

    for (let i = -1; i <= 1; i++)  {
      for (let j = -1; j <= 1; j++) {
        open(row + j, column + i);
      }
    }
  }

//_____________________________________________________isBomb________________________________________________________
  //Функция прверки бомбы
  function isBomb(row, column) {
    //Проверяем входит ли колонка или ряд в область таблицы, так как из getCount могут прилетать ряды и колонки,
    // выходящие за край таблицы
    if(! isValid(row, column)){
      return false;
    }
    //Определям индекс обратным действием: как произведение ряда на длину таблицы и плюс номер колонки
    const index = row * WIDTH + column;
    //Возвращаем true, если индекс ячейки содержиться в массиве бомб, если нет, то false
    return bombs.includes(index);
  }

  //Проверка Валидности: колонки и строки не выходят за пределы поля
  function isValid(row, column){
    return row >=0 &&
      row < HEIGHT &&
      column >=0 &&
      column < WIDTH
  }

//______________________________________________________getCount______________________________________________________
  //Функция проверки соседних ячеек на наличие бомб
  function getCount(row, column) {
    //Задаем счетчик бомб
    let count = 0;
    //Запускаем цикл проверки соседних колонок
    for (let i = column-1; i <= column+1; i++) {
      //Запускаем цикл проверки соседних рядов (перемещаемся по рядам одной колонки, потом по рядам другой и т.д.)
      for (let j = row-1; j <= row+1; j++) {
        //Проверяем, есть ли бомба в соседней ячейке, если есть увеличиваем счетчик бомб
        if (isBomb(j, i)) {
          count++;
        }
      }
    }
    //возвращаем кол-во бомб в соседник клетках от выбранной ячейки
    return count;
  }
}

//_______________________________________________Timer_________________________________________________________________

//Назначаем кнопку запуска таймера (любая ячейка поля)
let buttonRun = document.querySelector(".game__field");
//Назначаем элементы таймера в которых будут меняться цифры для отображения времени
let secondBeforeTen = document.querySelector(".timer__sec-value_before_ten");
let secondAfterTen = document.querySelector(".timer__sec-value_after_ten");
let minBeforeTen = document.querySelector(".timer__min-value_before_ten");
let minAfterTen = document.querySelector(".timer__min-value_after_ten");


//Назначаем слушатель запуска таймера, который отработает при нажатии на любую ячейку поля
buttonRun.addEventListener('click', setTimer)

// Выносим функцию таймера для последующей остановки таймера
let TimeInterval;

//Функция запуска таймера
function setTimer() {

  //Удаляем слушатель, чтобы не запустить таймер еще раз
  buttonRun.removeEventListener('click', setTimer);

  //Задаем предельное значение таймера
  let timeMinut = 40*60;

  //Запускаем таймер, выполняющийся с интервалом в 1 секунду
    TimeInterval = setInterval(function () {

    //Задаем секунды
    let seconds = timeMinut%60
    //Задаем минуты
    let minutes = timeMinut/60%60

      // Если время закончилось, то удаляем таймер
      if (timeMinut <= 0) {
        clearInterval(TimeInterval);
        return
      } else {
      //Запускаем функцию, где подставляем значки цифр в ячейки под таймер, в зависимости от следующего:
      // Отдельно определена ячейка под секунды до 10 (остаток от деления текущих секунд на 10),
      // отдельно под 10-ки секунд (делим секунды на 10 и отбрасываем дробную часть),
      // также с минутами (только в минутах везде дробная часть отбрасывается)
      setTimerValue(seconds%10, secondBeforeTen);
      setTimerValue(Math.trunc(seconds/10), secondAfterTen);
      setTimerValue(Math.trunc(minutes/10), minAfterTen);
      setTimerValue(Math.trunc(minutes%10), minBeforeTen);

      //Создаем функцию, где проставляем значки цифр в зависимоти от идущего времени
      function setTimerValue(time, timePosition) {
        switch (time) {
          case 0: {
            timePosition.classList.remove('timer__value_set_one');
            timePosition.classList.add('timer__value_set_zero');
          }
            break;
          case 1: {
            timePosition.classList.remove('timer__value_set_two');
            timePosition.classList.add('timer__value_set_one');
          }
            break;
          case 2: {
            timePosition.classList.remove('timer__value_set_three');
            timePosition.classList.add('timer__value_set_two');
          }
            break;
          case 3: {
            timePosition.classList.remove('timer__value_set_four');
            timePosition.classList.add('timer__value_set_three');
          }
            break;
          case 4: {
            timePosition.classList.remove('timer__value_set_five');
            timePosition.classList.add('timer__value_set_four');
          }
            break;
          case 5: {
            timePosition.classList.remove('timer__value_set_six');
            timePosition.classList.add('timer__value_set_five');
          }
            break;
          case 6: {
            timePosition.classList.remove('timer__value_set_seven');
            timePosition.classList.add('timer__value_set_six');
          }
            break;
          case 7: {
            timePosition.classList.remove('timer__value_set_eight');
            timePosition.classList.add('timer__value_set_seven');
          }
            break;
          case 8: {
            timePosition.classList.remove('timer__value_set_nine');
            timePosition.classList.add('timer__value_set_eight');}
            break;
          case 9: {
            timePosition.classList.remove('timer__value_set_zero');
            timePosition.classList.add('timer__value_set_nine');
          }
            break;
          default: {
            timePosition.classList.add('timer__value_set_zero');
          }
            break;
        }
      }

    // Уменьшаем таймер
    --timeMinut;
  }}, 1000);
}

//__________________________________________RESTART GAME________________________________________________________________

//При нажатии на кнопку смайлика перезапускаем игру
smileBtn.addEventListener('click', (event) => {
  //Очищаем предыдущие состояния смайлика
  smileBtn.classList.remove('smile_state_lose');
  smileBtn.classList.remove('smile_state_win');
  //Очищаем таймер и приводим состояние цифр в начальное положение
  clearInterval(TimeInterval);
  secondBeforeTen.classList.remove('timer__value_set_nine', 'timer__value_set_eight', 'timer__value_set_seven',
    'timer__value_set_six', 'timer__value_set_five', 'timer__value_set_four', 'timer__value_set_three',
    'timer__value_set_two', 'timer__value_set_one', 'timer__value_set_zero');
  secondAfterTen.classList.remove('timer__value_set_nine', 'timer__value_set_eight', 'timer__value_set_seven',
    'timer__value_set_six', 'timer__value_set_five', 'timer__value_set_four', 'timer__value_set_three',
    'timer__value_set_two', 'timer__value_set_one', 'timer__value_set_zero');
  minBeforeTen.classList.remove('timer__value_set_nine', 'timer__value_set_eight', 'timer__value_set_seven',
    'timer__value_set_six', 'timer__value_set_five', 'timer__value_set_four', 'timer__value_set_three',
    'timer__value_set_two', 'timer__value_set_one', 'timer__value_set_zero');
  minAfterTen.classList.remove('timer__value_set_nine', 'timer__value_set_eight', 'timer__value_set_seven',
    'timer__value_set_six', 'timer__value_set_five', 'timer__value_set_four', 'timer__value_set_three',
    'timer__value_set_two', 'timer__value_set_one', 'timer__value_set_zero');
  secondBeforeTen.classList.add('timer__value_set_zero');
  secondAfterTen.classList.add('timer__value_set_zero');
  minBeforeTen.classList.add('timer__value_set_zero');
  minAfterTen.classList.add('timer__value_set_four');

  //Активируем слушатель таймера
  buttonRun.addEventListener('click', setTimer);
  //Перезапускаем игру
  startGame(16, 16, 40);
})
//_______________________________________________________________________________________________________________________
