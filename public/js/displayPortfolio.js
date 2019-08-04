$(window).ready(function () {
    container = document.querySelectorAll("div #contentTest")
    content = document.querySelectorAll("div #realcontent")
    for(i = 0; i < container.length; i++){
        container[i].innerHTML = content[i].innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
     
    }
});