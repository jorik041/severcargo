const tabsModule = (function() {
  const init = () => { setupListeners() }

  const tabs = document.querySelectorAll('.driver__tabs input');
  const flightsTab = document.querySelector('.driver__flights');
  const carTab = document.querySelector('.driver__car');
  const reviewsTab = document.querySelector('.driver__reviews');

  const setupListeners = function() {
      tabs.forEach( element => {
        
        showTabs(element);
        element.addEventListener('change', function(e) {
          showTabs(e.target);
        });
    
      }); 
  }

  function showTabs(target) {
    
      if ( target.getAttribute('id') === 'flights' && target.checked) {
    
        carTab.style.setProperty('--display', 'none');
        reviewsTab.style.setProperty('--display', 'none');
    
        flightsTab.style.setProperty('--display', 'flex');
      } else if ( target.getAttribute('id') === 'car' && target.checked ) {
    
        reviewsTab.style.setProperty('--display', 'none');
        flightsTab.style.setProperty('--display', 'none');
    
        carTab.style.setProperty('--display', 'flex');
      } else if ( target.getAttribute('id') === 'reviews' && target.checked ) {
        
        flightsTab.style.setProperty('--display', 'none');
        carTab.style.setProperty('--display', 'none');
    
        reviewsTab.style.setProperty('--display', 'flex');
      }
    
    }

  return {
    init
  }
})();
tabsModule.init();

//РЕДАКТИРОВАНИЕ ДААНЫХ ОБ АВТОМОБИЛЕ
const editCarModule = (function() {
  const init = () => { setupListeners() }

  const editBtn = document.querySelector('.js-edit');
  const addCarForm = document.querySelector('.js-add-car');
  const carInfoBlock = document.querySelector('.js-car-info');
  const addCarBtn = document.querySelector('.js-add-car-btn');
  const carImg = document.querySelector('.car-img');//картинка автомобиля
  const numberEl = document.querySelector('.driver__car__number');  //номер авто
  const modelEl = document.querySelector('.driver__car__model'); //модель авто  и тип автомобиля
  const deleteBtn = document.querySelector('.js-del-car');// delete button
  
  
  

  const setupListeners = function () {
    if (editBtn != null) editBtn.addEventListener('click', showEditForm);
    if (addCarForm != null) addCarForm.addEventListener('submit', ajaxCar );
    if (addCarBtn != null) addCarBtn.addEventListener('click', showAddCarForm);
    if ( deleteBtn != null ) deleteBtn.addEventListener('click', deleteCar );
    
  }

  function showEditForm(e) {
    e.preventDefault();
    carInfoBlock.style.display = 'none';
    addCarForm.style.display = 'block';
    requestAnimationFrame(() => addCarForm.style.opacity = 1);
  }

  function showAddCarForm(e) {
    e.preventDefault();
    this.style.display = 'none';
    addCarForm.style.display = 'block';
    requestAnimationFrame(() => addCarForm.style.opacity = 1);
  }

  function showOrHide(elShow, elHide) {
    elShow.style.display = 'flex';
    elHide.style.display = 'none';
    requestAnimationFrame(() => elHide.style.opacity = 0);
    requestAnimationFrame(() => elShow.style.opacity = 1);
    
  }

  //ЗАПРОС  НА ДОБАВЛЕНИЕ ДАННЫХ ОБ АВТО
  function ajaxCar(e) {    
    const inputImg = document.getElementById("images");

    const formData = new FormData( addCarForm );
    const url = this.getAttribute('action');

    // Loop through each of the selected files.
      // for (var i = 0; i < inputImg.files.length; i++) {
      //   var file = files[i];

      //   // Check the file type.
      //   if (!file.type.match('image.*')) {
      //     continue;
      //   }

      //   // Add the file to the request.
      //   formData.append('photo', file, file.name);
      // }
    
    const headers = {
      'Accept': 'application/json, */*',
      'Content-Type': 'multipart/form-data'
    }

    fetch(url, {
      method: 'POST', 
      body: formData,
      credentials: "same-origin"
    }).then(
      response => {
        if (response.status == 200) { 
            
            response.json().then(function(data) {
              console.log( );
              
              modelEl.innerText = `${ data.model }, ${ data.type }`;
              numberEl.innerText = data.number;
              deleteBtn.setAttribute('href', `/delete-car/${data._id}`);
              
              if ( data.photo.length ){
                console.log('photo yest');
                
                carImg.src = `/uploads/${ data.photo }`;
              } 
            });

            showOrHide(carInfoBlock, addCarForm);
          }
        }
      ).catch(err => {  
        console.log('Fetch Error :-S', err);  
      }); 
    
      e.preventDefault();      
  }

  //УДАЛЕНИЕ АВТОМОБИЛЯ
  function deleteCar(e) {
    const url = this.getAttribute('href');
    
    fetch(url, { 
      method: 'DELETE',
      credentials: "same-origin"
    }).then( response => {

      if ( response.status == 200 ) {
        showOrHide( addCarBtn, carInfoBlock);
        addCarForm.setAttribute('action', '/add-car');
      } else {
        
      }
      
    }).catch(function(err) {  
      console.log('Fetch Error :-S', err);  
    });

    e.preventDefault();
  }

  return {
    init
  }
})();
editCarModule.init();

function PreviewImage() {
  
  const inputImg = document.getElementById("images");
  const parentImg = document.querySelector('.preview__list');
  
  if (inputImg.files) {
      const filesAmount = inputImg.files.length;
      for (var i = 0; i < filesAmount; i++) {
          
          const oFReader = new FileReader();
          const li = document.createElement('li');
          const img = document.createElement('img');
          
          parentImg.appendChild(li);
          li.innerHTML = "<button class='preview__img-remove' onClick='this.parentElement.remove()'>&times;</button>";
          li.appendChild(img);

          oFReader.onload = function (oFREvent) {
              
              img.src = oFREvent.target.result;
          };

          oFReader.readAsDataURL(inputImg.files[i]);
      }
  }
};


function PreviewAva() {
  var oFReader = new FileReader();
  console.log('change');
  
  oFReader.readAsDataURL(document.getElementById("add-photo").files[0]);

  oFReader.onload = function (oFREvent) {
    document.querySelectorAll(".ava-preview").forEach( img => {
      img.src = oFREvent.target.result;
    });
  };
};

const menuModule = (() => {
  const init = () => { setupListeners() }

  const header = document.querySelector('.header');
  const headerUserMenuBtn = document.querySelector('.js-show-header-menu');
  const headerUserMenu = document.querySelector('.user__profile-menu');
  const burgerBtn = document.querySelector('.js-burger');
  const overlayNav = document.querySelector('.nav-overlay ');
  const body = document.querySelector('body');
  
  const setupListeners = () => {
    if ( headerUserMenuBtn != null ) headerUserMenuBtn.addEventListener( 'click', showHeaderMenu );
    burgerBtn.addEventListener('click', triggerMenu );
    overlayNav.addEventListener('click', closeMenu);
  }

  function triggerMenu() {    
    header.classList.toggle('open');
    body.classList.toggle('menu-open');
  }

  function showHeaderMenu() {    
    headerUserMenu.classList.toggle('open');
  }

  function closeMenu() {
    console.log('click');
    
    if ( header.classList.contains('open') ) {
      triggerMenu();
    }
  }

  return {
    init
  }

})();

menuModule.init();