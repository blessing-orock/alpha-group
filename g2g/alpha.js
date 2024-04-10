const wrapper = document.querySelector(".wrapper");
const carousel = document.querySelector(".carousel");
const firstCardWidth = carousel.querySelector(".card").offsetWidth;
const arrowBtns = document.querySelectorAll(".wrapper i");
const carouselChildrens = [...carousel.children];

let isDragging = false,
	isAutoPlay = true,
	startX,
	startScrollLeft,
	timeoutId;

// Get the number of cards that can fit in the carousel at once
let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

// Insert copies of the last few cards to beginning of carousel for infinite scrolling
carouselChildrens
	.slice(-cardPerView)
	.reverse()
	.forEach((card) => {
		carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
	});

// Insert copies of the first few cards to end of carousel for infinite scrolling
carouselChildrens.slice(0, cardPerView).forEach((card) => {
	carousel.insertAdjacentHTML("beforeend", card.outerHTML);
});

// Scroll the carousel at appropriate postition to hide first few duplicate cards on Firefox
carousel.classList.add("no-transition");
carousel.scrollLeft = carousel.offsetWidth;
carousel.classList.remove("no-transition");

// Add event listeners for the arrow buttons to scroll the carousel left and right
arrowBtns.forEach((btn) => {
	btn.addEventListener("click", () => {
		carousel.scrollLeft += btn.id == "left" ? -firstCardWidth : firstCardWidth;
	});
});

const dragStart = (e) => {
	isDragging = true;
	carousel.classList.add("dragging");
	// Records the initial cursor and scroll position of the carousel
	startX = e.pageX;
	startScrollLeft = carousel.scrollLeft;
};

const dragging = (e) => {
	if (!isDragging) return; // if isDragging is false return from here
	// Updates the scroll position of the carousel based on the cursor movement
	carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
};

const dragStop = () => {
	isDragging = false;
	carousel.classList.remove("dragging");
};

const infiniteScroll = () => {
	// If the carousel is at the beginning, scroll to the end
	if (carousel.scrollLeft === 0) {
		carousel.classList.add("no-transition");
		carousel.scrollLeft = carousel.scrollWidth - 2 * carousel.offsetWidth;
		carousel.classList.remove("no-transition");
	}
	// If the carousel is at the end, scroll to the beginning
	else if (
		Math.ceil(carousel.scrollLeft) ===
		carousel.scrollWidth - carousel.offsetWidth
	) {
		carousel.classList.add("no-transition");
		carousel.scrollLeft = carousel.offsetWidth;
		carousel.classList.remove("no-transition");
	}

	// Clear existing timeout & start autoplay if mouse is not hovering over carousel
	clearTimeout(timeoutId);
	if (!wrapper.matches(":hover")) autoPlay();
};

const autoPlay = () => {
	if (window.innerWidth < 800 || !isAutoPlay) return; // Return if window is smaller than 800 or isAutoPlay is false
	// Autoplay the carousel after every 2500 ms
	timeoutId = setTimeout(() => (carousel.scrollLeft += firstCardWidth), 2500);
};
autoPlay();

carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);
carousel.addEventListener("scroll", infiniteScroll);
wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
wrapper.addEventListener("mouseleave", autoPlay);


function addLiveListener(eventType, elementQuerySelector, cb) {
	document.addEventListener(eventType, function (event) {
	  var qs = document.querySelectorAll(elementQuerySelector);
  
	  if(qs) {
		var el = event.target, index = -1;
		while (el && ((index = Array.prototype.indexOf.call(qs, el)) === -1)) {
		  el = el.parentElement;
		}
  
		if (index > -1) {
		  cb.call(el, event);
		}
	  }
	});
  }
  
  (function mapInit(el, contentData) {
	  var _map, mapOptions;
  
	  mapOptions = {
		zoom: 6,
		minZoom: 4,
		center: new google.maps.LatLng(52.069167, 19.480556),
		panControl: false,
		zoomControl: true,
		streetViewControl: false,
		scaleControl: true,
		mapTypeControl: false,
		scrollwheel: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		//styles: styleMap
	  };
  
	  _map = new google.maps.Map(el, mapOptions);
  
	  _map.markers = [];
	  _map.tooltips = [];
	  _map.tmplInfoBox = document.querySelector('#tmpl-infobox').innerText;
	  _map.tmplSearchResult = document.querySelector('#tmpl-search-result').innerText;
  
	  google.maps.event.addListenerOnce(_map, 'idle', function(){
		  console.log('--idle--');
		  mapLocations(_map, contentData);
	  });
  
	  google.maps.event.addDomListener(window, 'load', function() {
		  console.log('--load--');
	  });
  
	  var formElements = document.querySelectorAll('.map-box__search-bar, .map-box__search-box'),
			  activeElement = document.querySelector('.map-box__sidebar'),
			  resultsElement = document.querySelector('.map-box__search-results');
  
	  formElements = [].slice.call(formElements);
  
	  formElements.forEach(function(item) {
		  item.addEventListener('submit', function(e) {
			  e.preventDefault();
  
			  e.target.classList.add('is-active');
  
			  var fieldValue = e.target.querySelector('input').value;
  
			  mapSearchLocations(_map, fieldValue, activeElement, resultsElement);
		  });
	  })
  
	  addLiveListener('click', '.map-box__search-results__item', function() {
		  var pos, gp
  
		  pos = this.getAttribute('data-position');
  
		  if(pos) {
			  pos = pos.split(',');
  
			  gp = new google.maps.LatLng(pos[0], pos[1]);
  
			  _map.setCenter(gp);
			  _map.setZoom(18);
		  }
	  });
  }(document.getElementById('map'), citiesData));
  
  
  function mapLocations(_map, data) {
	  var marker, content, iBoxOptions, iBox;
  
	for (var i in data) {
	  marker = new google.maps.Marker({
		position: new google.maps.LatLng(data[i].lat, data[i].lng),
		map: _map,
		// icon: icon,
		visible: true, //false,
		contentDetails: {
		  city: data[i].city,
		  lat: data[i].lat,
		  lng: data[i].lng
		}
	  });
  
	  _map.markers.push(marker);
  
	  content = mapPrepareTmpl(data[i], _map.tmplInfoBox);
  
	  iBoxOptions = {
		content: content,
		maxWidth: 0,
		pixelOffset: new google.maps.Size(20, -25),
		zIndex: null,
		closeBoxMargin: '6px',
		// closeBoxURL: "assets/img/ico-close.png",
		isHidden: false,
		pane: 'floatPane',
		enableEventPropagation: false
	  };
  
	  iBox = new InfoBox(iBoxOptions);
  
	  _map.tooltips.push(iBox);
  
	  google.maps.event.addListener(marker, 'click', (function (marker, tooltip, tooltips) {
		return function () {
		  mapCenter(_map, marker.getPosition(), -100, 100);
  
		  for (var h = 0; h < tooltips.length; h++) {
			tooltips[h].close();
		  }
  
		  tooltip.open(_map, marker);
		};
	  })(marker, _map.tooltips[i], _map.tooltips));
	}
  }
  
  function mapPrepareTmpl(data, tmpl) {
	  var key, html;
  
	  html = tmpl;
  
	  for(key in data) {
		  html = html.replace(new RegExp('{{'+key+'}}', 'g'), data[key]);
	  }
  
	  return html;
  }
  
  function mapCenter(_map, latlng, offsetX, offsetY) {
	  var point1, point2
  
	  point1 = _map.getProjection().fromLatLngToPoint(
		  (latlng instanceof google.maps.LatLng) ? latlng : _map.getCenter()
	  );
  
	  point2 = new google.maps.Point(
		  ( (typeof(offsetX) == 'number' ? offsetX : 0) / Math.pow(2, _map.getZoom()) ) || 0,
		  ( (typeof(offsetY) == 'number' ? offsetY : 0) / Math.pow(2, _map.getZoom()) ) || 0
	  );
  
	  _map.setCenter(
		  _map.getProjection().fromPointToLatLng(
			  new google.maps.Point(
				  point1.x - point2.x,
				  point1.y + point2.y
			  )
		  )
	  );
  }
  
  function mapSearchLocations(_map, address, activeElement, resultsElement) {
  
	  if(address == '') {
		  console.error('Proszę podaj kod pocztowy lub miejscowość');
		  return;
	  }
  
	  var geocoder = new google.maps.Geocoder();
	  var result = [];
  
	  geocoder.geocode({ 'address': address, 'region': 'pl' }, function(results, status) {
		  var tmpLocations, tmpItem, position;
  
		  if(status === 'OK') {
			  tmpLocations = results[0].geometry.location;
  
			  for(var tmpItem in tmpLocations) {
				  result.push(tmpLocations[tmpItem]);
			  }
  
			  position = new google.maps.LatLng(result[0](), result[1]());
  
			  _map.setCenter(position);
			  _map.setZoom(13);
  
			  if(!_map.firstSearch) {
				  _map.firstSearch = true;
  
				  _map.markers.forEach(function(item) {
					  item.setVisible(true);
				  });
  
				  if(activeElement) {
					  activeElement.classList.add('show--search-results');
				  }
			  }
  
			  searchResults(_map, position, resultsElement);
  
		  } else {
			  console.error('Nie znaleziono, wpisz inną miejscowość');
		  }
	  });
  }
  
  function searchResults(_map, position, resultsElement){
	  var list, result = '';
  
	  _map.markers.forEach(function(val, key) {
		  var distance = (google.maps.geometry.spherical.computeDistanceBetween(position, val.position) / 1000).toFixed(2);
  
		  _map.markers[key].distance = distance;
	  });
  
	  list = _map.markers.sort(function(a, b) {
		  return parseFloat(a.distance) - parseFloat(b.distance);
	  }).slice(0, 10);
  
	  list.forEach(function(val) {
		  var html = '';
  
		  result += mapPrepareTmpl(val.contentDetails, _map.tmplSearchResult);
	  });
  
	  resultsElement.innerHTML = result;
  }

  const inputs = document.querySelectorAll(".input");

function focusFunc() {
  let parent = this.parentNode;
  parent.classList.add("focus");
}

function blurFunc() {
  let parent = this.parentNode;
  if (this.value == "") {
    parent.classList.remove("focus");
  }
}

inputs.forEach((input) => {
  input.addEventListener("focus", focusFunc);
  input.addEventListener("blur", blurFunc);
});
