test = document.querySelector("#test1");
test1 = test.contentDocument

function showedit() {
    //console.log(test1.value)
}

function execFunc(func) {   
    test1.execCommand(func, false, null)
    console.log(test.contentDocument)
    console.log(func)
}

function enableEditMode() {

}

$(window).ready(function () {
    console.log(test1)
    console.log(test1.contentDoc)
    test1.body.contentEditable = true

    //test1.document.enableEditMode = "on"    
})




