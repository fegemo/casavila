// parse slide data (url, title, size ...) from DOM elements 
// (children of gallerySelector)
function parseThumbnailElements(el) {
    let thumbElements = el.childNodes,
        numNodes = thumbElements.length,
        items = [],
        figureEl,
        linkEl,
        size,
        item;

    for (let i = 0; i < numNodes; i++) {

        figureEl = thumbElements[i]; // <figure> element

        // include only element nodes 
        if (figureEl.nodeType !== 1) {
            continue;
        }

        linkEl = figureEl.children[0]; // <a> element

        size = linkEl.dataset.size.split('x');

        // create slide object
        item = {
            src: linkEl.href,
            w: parseInt(size[0], 10),
            h: parseInt(size[1], 10)
        };



        if (figureEl.children.length > 1) {
            // <figcaption> content
            item.title = figureEl.children[1].innerHTML;
        }

        if (linkEl.children.length > 0) {
            // <img> thumbnail element, retrieving thumbnail url
            item.msrc = linkEl.children[0].src;
        }

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

    // find index of clicked item by looping through all child nodes
    // alternatively, you may define index via data- attribute
    let clickedGallery = clickedListItem.parentNode,
        childNodes = clickedListItem.parentNode.childNodes,
        numChildNodes = childNodes.length,
        nodeIndex = 0,
        index;

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


    if (index >= 0) {
        // open PhotoSwipe if valid index found
        openPhotoSwipe(index, clickedGallery);
    }

    return false;
};

function openPhotoSwipe(index, galleryElement) {
    const pswpElement = document.querySelector('.pswp');
    let gallery,
        options,
        items;

    items = parseThumbnailElements(galleryElement);

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
const galleryElements = document.querySelectorAll('.gallery');

for (let i = 0, l = galleryElements.length; i < l; i++) {
    galleryElements[i].setAttribute('data-pswp-uid', i + 1);
    galleryElements[i].addEventListener('click', onThumbnailsClick);
}