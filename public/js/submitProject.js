// ================================================
test = document.querySelector("#projectContent");
test1 = test.contentDocument

function execFunc(func, uiDisplay = false, value = null) {
    console.log(this)
    $(this).addClass('active')
    test1.execCommand(func, uiDisplay, value)
    console.log("Test")
    event.preventDefault()

}

function uploadImage() {
    image = $('#imageSrc').val()
    width = $('#imgWidth').val() != "" ? $('#imgWidth').val() : 'auto'
    height = $('#imgHeight').val() != "" ? $('#imgHeight').val() : 'auto'

    event.preventDefault()

    var id = "img" + Math.random();
    img = "<img src='" + image + "'"
        + " id='" + id + "'class='img-fluid resize-drag'"
        + " width='" + width + "%'"
        + " height='" + height + "%'"
        + ">"


    test1.execCommand("insertHTML", false, img);

    // interact('.resize-drag')
    //     .resizable({
    //         // resize from all edges and corners
    //         edges: { left: true, right: true, bottom: true, top: true },

    //         modifiers: [
    //             // keep the edges inside the parent
    //             interact.modifiers.restrictEdges({
    //                 outer: 'parent',
    //                 endOnly: true,
    //             }),

    //             // minimum size
    //             interact.modifiers.restrictSize({
    //                 min: { width: 100, height: 50 },
    //             }),
    //         ],

    //         inertia: true
    //     })
    //     .on('resizemove', function (event) {
    //         var target = event.target,
    //             x = (parseFloat(target.getAttribute('data-x')) || 0),
    //             y = (parseFloat(target.getAttribute('data-y')) || 0);

    //         // update the element's style
    //         target.style.width = event.rect.width + 'px';
    //         target.style.height = event.rect.height + 'px';

    //         // translate when resizing from top or left edges
    //         x += event.deltaRect.left;
    //         y += event.deltaRect.top;

    //         target.style.webkitTransform = target.style.transform =
    //             'translate(' + x + 'px,' + y + 'px)';

    //         target.setAttribute('data-x', x);
    //         target.setAttribute('data-y', y);
    //         target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
    //     });
}

function uploadAudio() {
    audio = $('#audioSrc').val()
    event.preventDefault()
    var id = "audio" + Math.random();
    mp3 =
        "<audio controls>"
        + "<source src='" + audio + "' id='" + id + "' > "
        + "Your browser does not support the audio element."
        + "</audio><br>";

    test1.execCommand("insertHTML", false, mp3);
}

function uploadVideo() {
    video = $('#videoSrc').val()
    width = $('#vidWidth').val() != "" ? $('#vidWidth').val() : 'auto'
    height = $('#vidHeight').val() != "" ? $('#vidHeight').val() : 'auto'

    event.preventDefault()
    var id = "rand" + Math.random();
    mp4 =
        "<div class='embed-responsive embed-responsive-16by9'>"
        + "<video controls"
        + " width='" + width + "%'"
        + " height='" + height + "%'"
        + ">"
        + "<source src='" + video + "' id='" + id + "' > "
        + "Your browser does not support the video element."
        + "</video>"
        + "</div><br>";

    test1.execCommand("insertHTML", false, mp4);
}

function createLink() {
    var link = prompt("Paste or type a link", "http://")
    test1.execCommand("createLink", false, link)
    event.preventDefault()
}

showingSourceCode = false
isInEditMode = true

function toggleSource() {
    if (showingSourceCode) {
        test.contentWindow.document.body.innerHTML = test.contentWindow.document.body.textContent;
        showingSourceCode = false
        $('#sourceCodeBtn').removeClass('active')
        //document.getElementById("sourceCodeBtn").className = "btn btn-secondary"
        // document.getElementById("richTextEditorBtns").style.display = "block"
        event.preventDefault()

    }
    else {
        test.contentWindow.document.body.textContent = test.contentWindow.document.body.innerHTML
        showingSourceCode = true
        $('#sourceCodeBtn').addClass('active')

        // document.getElementById("sourceCodeBtn").className = "btn btn-secondary active"
        // document.getElementById("richTextEditorBtns").style.display = "none"
        event.preventDefault()
    }

}

function getHTML() {

    if (showingSourceCode) {
        htmlStuff = test.contentWindow.document.body.textContent;
    }
    else {
        htmlStuff = test.contentWindow.document.body.innerHTML
    }

    console.log(htmlStuff)
}

function updateTextArea() {
    area = document.getElementById("content")
    area.value = test.contentWindow.document.body.innerHTML
    if (area.value == "") {
        $("#contentEmpty").modal('show')
        // alert("Please fill in your content")
    }   
}


$(window).ready(function () {

})

$(function () {
    //Enable iframe to be edited
    test1.body.contentEditable = true
    //Enable iframe to be edited
    // console.log($("#content").val())
    test.contentWindow.document.body.innerHTML = $("#content").val();
    // console.log(test.contentWindow.document.body.innerHTML)


    //Image
    if (typeof img !== 'undefined') {
        let focus = $('.preview', '.file-upload');

        focus.addClass('d-block');
        focus.find('.renderer').html(`<img id="imageRender" src="${img}">`);

        img = undefined
        $('script#img-script').remove();

        console.log($('#imageRender').attr('src'))
    }

    //Categories
    categories = document.getElementsByName('projectCategory')
    category_counter = 0

    for (i = 0; i < categories.length; i++) {
        if (categories[i].checked) {
            console.log(categories[i].value)
            category_counter++
        }
    }

    if ($('#title').val() != "" && ($('#coverPicture').val() != "" || $('#imageRender').attr('src') != "") && category_counter > 0) {
        $('#portfolio-tab-classic-shadow').removeClass("disabled muted")
        $('#portfolio-tab-classic-shadow').addClass("text-secondary")
    }
    else {
        $('#portfolio-tab-classic-shadow').addClass("disabled muted")
        $('#portfolio-tab-classic-shadow').removeClass("text-secondary")
    }


});

$(document).change(function () {
    categories = document.getElementsByName('projectCategory')
    category_counter = 0

    for (i = 0; i < categories.length; i++) {
        if (categories[i].checked) {
            category_counter++
        }
    }


    if ($('#title').val() != "" && ($('#coverPicture').val() != "" || $('#imageRender').attr('src') != "") && category_counter > 0) {
        $('#portfolio-tab-classic-shadow').removeClass("disabled muted")
        $('#portfolio-tab-classic-shadow').addClass("text-secondary")
    }
    else {
        $('#portfolio-tab-classic-shadow').addClass("disabled muted")
        $('#portfolio-tab-classic-shadow').removeClass("text-secondary")
    }

})



// ============================================================================================
// ============================================================================================
// ============================================================================================
// ============================================================================================




$('#moreTextEdit').on('show.bs.collapse', function () {
    $('#moreTextEditButton').addClass('active')

    $('#moreParagraphEditButton').removeClass('active')
    $('#moreMediaButton').removeClass('active')

    $('#moreParagraphEdit').collapse('hide')
    $('#moreMedia').collapse('hide')
})

$('#moreTextEdit').on('hide.bs.collapse', function () {
    $('#moreTextEditButton').removeClass('active')

})

$('#moreParagraphEdit').on('show.bs.collapse', function () {
    $('#moreParagraphEditButton').addClass('active')

    $('#moreTextEditButton').removeClass('active')
    $('#moreMediaButton').removeClass('active')

    $('#moreTextEdit').collapse('hide')
    $('#moreMedia').collapse('hide')

})

$('#moreParagraphEdit').on('hide.bs.collapse', function () {
    $('#moreParagraphEditButton').removeClass('active')

})

$('#moreMedia').on('show.bs.collapse', function () {
    $('#moreMediaButton').addClass('active')

    $('#moreTextEditButton').removeClass('active')
    $('#moreParagraphEditButton').removeClass('active')

    $('#moreTextEdit').collapse('hide')
    $('#moreParagraphEdit').collapse('hide')
})

$('#moreMedia').on('hide.bs.collapse', function () {
    $('#moreMediaButton').removeClass('active')

})

