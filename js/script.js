window.addEventListener('DOMContentLoaded', () => {

   // СОЗДАНИЕ ТАБОВ

   const tabs = document.querySelectorAll(".tabheader__item"),
     tabsContent = document.querySelectorAll(".tabcontent"),
     tabParent = document.querySelector(".tabheader__items");


   function hideTabContent() {
      tabsContent.forEach((item) => {
         item.classList.add('hide');
         item.classList.remove("show", "fade");
      });

      tabs.forEach((item) => {
         item.classList.remove("tabheader__item_active");
      });
   }

   function showTabContent(i = 0) {
      tabsContent[i].classList.add('show', 'fade');
      tabsContent[i].classList.remove("hide");
      tabs[i].classList.add("tabheader__item_active");
   };

   tabParent.addEventListener('click', (e) => {
      const target = e.target;

      if (target && target.classList.contains('tabheader__item')) {
         tabs.forEach((item, i) => {
            if (target == item) {
               hideTabContent();
               showTabContent(i);
            };
         });
      };
   });


   
   hideTabContent();
   showTabContent();

   // СОЗДАНИЕ ТАЙМЕРА ОБРАТНОГО ОТСЧЕТА

   const deadLine = '2023-11-20';

   function getTimeRemaining(endtime) {
      const t = Date.parse(endtime) - Date.parse(new Date()), // получаем разницу во времени от настоящего до дедлайна акции
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor((t / (1000 * 60 * 60)) % 24),
            minutes = Math.floor((t / (1000 * 60)) % 60),
            seconds = Math.floor((t / 1000) % 60);

      return {
         'total': t,
         'days': days,
         'hours': hours,
         'minutes': minutes,
         'seconds': seconds
      };
   };

   function getZero(num) {
      if (num >= 0 && num < 10) {
         return `0${num}`;
      } else {
         return num;
      }
   };

   function setClock(selector, endtime) {
      const timer = document.querySelector(selector),
        days = timer.querySelector("#days"),
        hours = timer.querySelector("#hours"),
        minutes = timer.querySelector("#minutes"),
        seconds = timer.querySelector("#seconds"),
        timeInterval = setInterval(updateClock, 1000)

      updateClock();

      function updateClock() {
         const t = getTimeRemaining(endtime);

         days.innerHTML = getZero(t.days);
         hours.innerHTML = getZero(t.hours);
         minutes.innerHTML = getZero(t.minutes);
         seconds.innerHTML = getZero(t.seconds);

         if (t.total <= 0) {
            clearInterval(timeInterval);
         };
      };
   };

   setClock('.timer', deadLine);

   // СОЗДАНИЕ МОДАЛЬНОГО ОКНА

   const modalTrigger = document.querySelectorAll('[data-modal]'),
         modal = document.querySelector('.modal');
         

   modalTrigger.forEach(btn => {
      btn.addEventListener("click", openModal);
   });

   function openModal() {
      modal.classList.add("show");
      modal.classList.remove("hide");
      document.body.style.overflow = "hidden";
      // clearInterval(modalTimerId);
   };

   function closeModal() {
      modal.classList.remove("show");
      modal.classList.add("hide");
      document.body.style.overflow = "";
   }

   modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.getAttribute('data-close') == '') {
         closeModal();
      }
   });

   document.addEventListener('keydown', (e) => {
      if (e.code === "Escape" && modal.classList.contains('show')) {
         closeModal();
      };
   });

   // const modalTimerId = setTimeout(openModal, 5000);

   function showModalByScroll() {
     if (window.scrollY + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
       openModal();
       window.removeEventListener("scroll", showModalByScroll);
     }
   }

   window.addEventListener('scroll', showModalByScroll);

   // ИСПОЛЬЗОВАНИЕ КЛАССОВ ДЛЯ КАРТОЧЕК

   class MenuCard {
      constructor(src, alt, title, descr, price, parentSelector, ...classes) {
         this.src = src;
         this.alt = alt;
         this.title = title;
         this.descr = descr;
         this.price = price;
         this.classes = classes;
         this.parent = document.querySelector(parentSelector);
         this.transfer = 27;
         this.changeToUAH();
      }

      changeToUAH() {
         this.price = this.price * this.transfer
      }

      render() {
         const element = document.createElement('div');

         if (this.classes.length === 0) {
            this.element = 'menu__item'
            element.classList.add(this.element)
         } else{
            this.classes.forEach((className) => element.classList.add(className));
         }

         

         element.innerHTML = `
            <img src=${this.src} alt=${this.alt}>
            <h3 class="menu__item-subtitle">${this.title}</h3>
            <div class="menu__item-descr">${this.descr}</div>
            <div class="menu__item-divider"></div>
            <div class="menu__item-price">
               <div class="menu__item-cost">Цена:</div>
               <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
            </div>
         `;

         this.parent.append(element); 

      }

   };

   const getResource = async (url) => {
      const res = await fetch(url);

      if(!res.ok) {
         throw new Error(`Couldn't fetch ${url}, status: ${res.status}`);
      }

      return await res.json();
   };

   // getResource("http://localhost:3000/menu")
   //    .then(data => {
         // data.forEach(({img, altimg, title, descr, price}) => {
         //    new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
   //       });
   //    });

   axios.get('http://localhost:3000/menu')
      .then(data => {
         data.data.forEach(({img, altimg, title, descr, price}) => {
            new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
         });
      });

   // ОТПРАВКА ДАННЫХ НА СЕРВЕР

   const forms = document.querySelectorAll('form');
   
   const message = {
      loading: 'img/form/spinner.svg',
      success: 'Спасибо, скоро мы с вами свяжемся',
      failure: 'Что-то пошло не так'
   };

   forms.forEach(item => {
      bindPostData(item);
   })

   const postData = async (url, data) => {
      const res = await fetch(url, {
         method: "POST",
         headers: {
            "Content-type": "application/json",
         },
         body: data
      });

      return await res.json();
   };

   function bindPostData(form) {
      form.addEventListener('submit', (e) => {
         e.preventDefault();

         const statusMessage = document.createElement('img');
         statusMessage.src = message.loading;
         statusMessage.style.cssText = `
            display: block;
            margin: 0 auto;
         `;
         
         form.insertAdjacentElement('afterend', statusMessage);

         const formData = new FormData(form);

         const json = JSON.stringify(Object.fromEntries(formData.entries()));
         postData("http://localhost:3000/requests", json)
           .then((data) => {
             console.log(data);
             showThxModal(message.success);
             form.reset();
             statusMessage.remove();
           })
           .catch(() => {
             showThxModal(message.failure);
           })
           .finally(() => {
             form.reset();
           });
      });
   };
   
   


   function showThxModal(message) {
      const prevModalDialog = document.querySelector('.modal__dialog');

      prevModalDialog.classList.add('hide');
      openModal();

      const thxModal = document.createElement('div');
      thxModal.classList.add('modal__dialog');
      thxModal.innerHTML = `
         <div class="modal__content">
            <div class="modal__close" data-close>×</div>
            <div class="modal__title">${message}</div>
         </div>
      `;

      document.querySelector('.modal').append(thxModal);
      setTimeout(() => {
         thxModal.remove();
         prevModalDialog.classList.add("show");
         prevModalDialog.classList.remove("hide");
         closeModal();
      }, 4000)
   };

   fetch("http://localhost:3000/menu")
     .then((data) => data.json())
     .then((res) => console.log(res));

   // СОЗДАНИЕ СЛАЙДЕРА
   
   const slides = document.querySelectorAll('.offer__slide'),
         nextBtn = document.querySelector(".offer__slider-next"),
         prevBtn = document.querySelector(".offer__slider-prev"),
         current = document.querySelector('#current'),
         slidesWrapper = document.querySelector('.offer__slider-wrapper'),
         slidesField = document.querySelector('.offer__slider-inner'),
         width = window.getComputedStyle(slidesWrapper).width,
         slider = document.querySelector('.offer__slider');

   let slideIndex = 1;
   let offset = 0;

   // showSlide(slideIndex)

   // function showSlide(n) {
   //    if(n > 4) {
   //       slideIndex = 1
   //    }

   //    if(n < 1) {
   //       slideIndex = slides.length
   //    }

   //    slides.forEach((item) => item.style.display = 'none');
   //    slides[slideIndex - 1].style.display = 'block';

   //    current.textContent = `0${slideIndex}`
   // }

   // function plusSlides(n) {
   //    showSlide(slideIndex += n)
   // }

   // nextBtn.addEventListener('click', () => {
   //    plusSlides(1)
   // });
   // prevBtn.addEventListener("click", () => {
   //   plusSlides(-1);
   // });

   // ВТОРОЙ ВАРИАНТ СЛАЙДЕРА (КАРУСЕЛЬ)

   slidesField.style.width = 100 * slides.length + '%';
   slidesField.style.display = 'flex';
   slidesField.style.transition = '0.5s all';

   slidesWrapper.style.overflow = 'hidden';

   

   slides.forEach(slide => {
      slide.style.width = width
   });

   slider.style.position = "relative";

   const indicators = document.createElement("ol"),
         dots = [];

   indicators.classList.add("carousel-indicators");
   slider.append(indicators);

   for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement("li");
      dot.setAttribute("data-slide-to", i + 1);
      dot.classList.add("dot");
      indicators.append(dot);
      if (i == 0) {
         dot.style.opacity = 1;
      }

      dots.push(dot);
   }

   function withoutStr(str) {
      return +str.replace(/\D/g, '')
   }

   nextBtn.addEventListener('click', () => {
      if (offset == withoutStr(width) * (slides.length - 1)) {
         offset = 0;
      } else {
         offset += withoutStr(width);
      }

      // current.textContent = `0${(offset / 650) + 1}`;
      slidesField.style.transform = `translateX(-${offset}px)`

      if (slideIndex == slides.length) {
         slideIndex = 1
      } else {
         slideIndex++
      }

      if (slides.length < 10) {
        current.textContent = `0${slideIndex}`;
      } else {
        current.textContent = slideIndex;
      }

      dots.forEach(d => d.style.opacity = '.5');
      dots[slideIndex - 1].style.opacity = 1;
   });

   prevBtn.addEventListener("click", () => {
      if (offset == 0 ) {
        offset = withoutStr(width) * (slides.length - 1);
      } else {
        offset -= withoutStr(width);
      }

      current.textContent = `0${(offset / 650) + 1}`;
      slidesField.style.transform = `translateX(-${offset}px)`;

      if (slideIndex == 1) {
         slideIndex = slides.length;
      } else {
         slideIndex--;
      }

      if(slides.length < 10) {
         current.textContent = `0${slideIndex}`;
      } else {
         current.textContent = slideIndex;
      }

      dots.forEach((d) => (d.style.opacity = ".5"));
      dots[slideIndex - 1].style.opacity = 1;
   });

   dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
         const slideTo = e.target.getAttribute('data-slide-to');

         slideIndex = slideTo;
         offset = withoutStr(width) * (slideTo - 1);

         slidesField.style.transform = `translateX(-${offset}px)`;

         dots.forEach((d) => (d.style.opacity = ".5"));
         dots[slideIndex - 1].style.opacity = 1;
      })
   });

   // СОЗДАНИЕ КАЛЬКУЛЯТОРА

   const result = document.querySelector('.calculating__result span');

   let sex, height, weight, age, ratio;

   if (localStorage.getItem("sex")) {
      sex = localStorage.getItem("sex");
   } else {
      sex = 'female';
      localStorage.setItem('sex', 'female')
   }

   if (localStorage.getItem("ratio")) {
      ratio = localStorage.getItem("ratio");
   } else {
      ratio = 1.375;
      localStorage.setItem("ratio", 1.375);
   }

   function initLocalSettings(selector, activeClass) {
      const elements = document.querySelectorAll(selector);

      elements.forEach((elem) => {
         elem.classList.remove(activeClass);

         if(elem.getAttribute('id') === localStorage.getItem('sex')) {
            elem.classList.add(activeClass);
         };

         if (elem.getAttribute('data-ratio') === localStorage.getItem('ratio')) {
            elem.classList.add(activeClass);
         };
      });
   };

   initLocalSettings("#gender div", "calculating__choose-item_active");
   initLocalSettings(
     ".calculating__choose_big div",
     "calculating__choose-item_active"
   );

   function calcTotal() {
      if (!sex || ! height || !weight || !age || !ratio) {
         result.textContent = '____';
         return;
      }

      if (sex == 'female') {
         result.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
      } else {
         result.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
      }
   }

   calcTotal();

   function getStaticInfo(selector, activeClass) {
      const elements = document.querySelectorAll(selector);

      elements.forEach(elem => {
         elem.addEventListener('click', (e) => {
            if (e.target.getAttribute('data-ratio')) {
               ratio = +e.target.getAttribute("data-ratio");
               localStorage.setItem(
                 "ratio",
                  +e.target.getAttribute("data-ratio")
               );
            } else {
               sex = e.target.getAttribute('id');
               localStorage.setItem(
                 "sex",
                  e.target.getAttribute("id")
               );
            };

            elements.forEach(elem => {
               elem.classList.remove(activeClass);
            });

            e.target.classList.add(activeClass);

            calcTotal();
         });
      });
   };

   getStaticInfo('#gender div', 'calculating__choose-item_active');
   getStaticInfo(".calculating__choose_big div", "calculating__choose-item_active");

   function getDynamicInfo(selector) {
      const input = document.querySelector(selector);

      input.addEventListener('input', () => {

         if(input.value.match(/\D/g)) {
            input.style.border = '1px solid red'
         } else {
            input.style.border = 'none';
         }

         switch (input.getAttribute("id")) {
           case "height":
             height = +input.value;
             break;
           case "weight":
             weight = +input.value;
             break;
           case "age":
             age = +input.value;
             break;
         }
         calcTotal();   
      });


   };

   getDynamicInfo('#height');
   getDynamicInfo('#weight');
   getDynamicInfo('#age');

});


