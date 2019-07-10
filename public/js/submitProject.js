test = document.querySelector("#projectContent");
test1 = test.contentDocument


function execFunc(func, uiDisplay = false, value = null) {
    test1.execCommand(func, uiDisplay, value)
    console.log("Test")
    event.preventDefault()

}

function uploadImage() {
    var image = prompt("Paste or type a link", "http://")
    event.preventDefault()
    var id = "img" + Math.random();
    img = "<img src='" + image + "' id='" + id  + "'class='img-fluid'" + ">";
    console.log(img)
    test1.execCommand("insertHTML", false, img);
}

function uploadAudio() {
    var audio = prompt("Paste or type a link", "http://")
    event.preventDefault()
    // var id = "rand" + Math.random();
    mp3 = 
    "<audio controls>" 
    + "<source src='" + audio + "' > "
    //+ "Your browser does not support the audio element."
    + "</audio>";
    // console.log(img)
    test1.execCommand("insertHTML", false, mp3);
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
        document.getElementById("sourceCodeBtn").className = "btn btn-secondary"
        // document.getElementById("richTextEditorBtns").style.display = "block"
        event.preventDefault()

    }
    else {
        test.contentWindow.document.body.textContent = test.contentWindow.document.body.innerHTML
        showingSourceCode = true
        document.getElementById("sourceCodeBtn").className = "btn btn-secondary active"
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
    console.log(area.value)
}


// $(document.getElementById('projectContent').contentWindow.document).bind('keyup change keydown', function() {
//     // console.log('eh')
//     area = document.getElementById("content")
//     area.value = test.contentWindow.document.body.innerHTML
//     console.log(area.value)
// });

//Enable iframe to be edited
$(window).ready(function () {
    test1.body.contentEditable = true
})




