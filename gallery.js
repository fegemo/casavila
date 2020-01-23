// parse slide data (url, title, size ...) from DOM elements 
// (children of gallerySelector)
function parseThumbnailElements(el, selector) {
    let thumbElements = selector ? el.querySelectorAll(selector) : el.childNodes,
        numNodes = thumbElements.length,
        items = [],
        figureEl,
        size,
        item;

    for (let i = 0; i < numNodes; i++) {

        figureEl = thumbElements[i]; // <figure> element

        // include only element nodes 
        if (figureEl.nodeType !== 1) {
            continue;
        }

        switch (figureEl.children[0].tagName.toUpperCase()) {
            case 'A':
                size = figureEl.querySelector('a').dataset.size.split('x');
                targetSrc = figureEl.querySelector('a').href; // <a> element
                originalSrc = figureEl.querySelector('img').src;
                break;
            case 'IMG':
                size = figureEl.dataset.size.split('x');
                targetSrc = figureEl.querySelector('img').src;
                originalSrc = targetSrc;
                break;
        }

        // create slide object
        item = {
            src: targetSrc,
            w: parseInt(size[0], 10),
            h: parseInt(size[1], 10)
        };



        if (figureEl.children.length > 1) {
            // <figcaption> content
            item.title = figureEl.children[1].innerHTML;
        }

        item.msrc = originalSrc;
        item.el = figureEl; // save link to element for getThumbBoundsFn
        items.push(item);
    }

    return items;
};

// triggers when user clicks on thumbnail
function onThumbnailsClick(e) {
    e.preventDefault();

    
    // find root element of slide
    const clickedListItem = e.target.closest('FIGURE');
    
    if (!clickedListItem) {
        return;
    }
    
    // ver se este elemento figure passa no seletor da galeria (se houver)
    // se não passar, sai da função
    const galleryEl = clickedListItem.closest('[data-pswp-uid]');
    const gallerySelector = galleryEl.dataset.selector;
    if (gallerySelector) {
        const allSlides = galleryEl.querySelectorAll(gallerySelector);
        if (!Array.from(allSlides).includes(clickedListItem)) {
            return;
        }
    }
    
    // verifica se há um mouse. se não houver,
    // abre a galeria apenas se a foto estiver '.selecionada'
    if (clickedListItem.closest('.gallery') && !window.matchMedia("(hover: hover)").matches) {
        // não há mouse...
        const selectedElements = clickedListItem.closest('.gallery').querySelectorAll('figure.selected');
        for (let el of selectedElements) {
            if (el !== clickedListItem) {
                el.classList.remove('selected');
            }
        }

        if (!clickedListItem.classList.contains('selected')) {
            clickedListItem.classList.add('selected');
            e.stopImmediatePropagation();
            return;
        }
    }

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    let clickedGallery = clickedListItem.parentNode,
        childNodes = clickedListItem.parentNode.childNodes,
        numChildNodes = childNodes.length,
        nodeIndex = 0,
        index = -1;

    if (clickedListItem.dataset.order) {
        index = +clickedListItem.dataset.order;
    } else {
        for (let i = 0; i < numChildNodes; i++) {
            if (childNodes[i].nodeType !== 1) {
                continue;
            }
    
            if (childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }
    }


    if (index >= 0) {
        // open PhotoSwipe if valid index found
        openPhotoSwipe(index, clickedGallery);
    }

    e.stopImmediatePropagation();
    return false;
};

function openPhotoSwipe(index, galleryElement) {
    console.log(galleryElement)
    const pswpElement = document.querySelector('.pswp');
    let gallery,
        options,
        items;

    items = parseThumbnailElements(galleryElement, galleryElement.dataset.selector);

    // define options (if needed)
    options = {

        // define gallery index (for URL)
        galleryUID: galleryElement.getAttribute('data-pswp-uid'),

        getThumbBoundsFn: function (index) {
            // See Options -> getThumbBoundsFn section of documentation for more info
            var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect();

            return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
        }

    };

    options.index = parseInt(index, 10);

    // exit if index not found
    if (isNaN(options.index)) {
        return;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
    gallery.init();
};





// initing:

// loop through all gallery elements and bind events
const galleryElements = document.querySelectorAll('.gallery, .top-gallery, .single-gallery');

for (let i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i + 1);
    galleryElements[i].addEventListener('click', onThumbnailsClick);
}