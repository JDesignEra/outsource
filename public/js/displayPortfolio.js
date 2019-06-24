$(window).ready(function () {
    container = document.getElementById("contentTest")
    
    content = document.getElementById("realcontent").innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>') 
    // console.log(content)
    container.innerHTML = content
    console.log("loaded")
})