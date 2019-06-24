test = document.querySelector("#projectContent");
test1 = test.contentDocument


function execFunc(func, uiDisplay=false, value=null) {   
    test1.execCommand(func, uiDisplay, value)
    event.preventDefault()

}

function uploadImage(){
    var image = prompt ("Paste or type a link", "http://")
    console.log(image)
    
    test1.execCommand("insertImage", false, image)

    event.preventDefault()
    // img = document.getElementById('imagestuff')
    // the_img = document.querySelector('span.renderer > img')
    // console.log(the_img)
    // test1.execCommand("insertImage", false, the_img.src)
}

function testFunc() {
    img = document.getElementById('imagestuff')
    console.log(img)
    console.log("aaaa")
    the_img = document.querySelector('span.renderer > img')
    console.log(the_img.src)
}

function getHTML(){
    htmlStuff = test.contentWindow.document.body.innerHTML
    console.log(htmlStuff)
}

function updateTextArea(){
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
    // console.log(test1)
    // console.log(test1.contentDoc)
    test1.body.contentEditable = true
    //test1.document.enableEditMode = "on"    
})




