function showModal(modal){
    
    document.getElementById(modal).classList.remove(modal);
    document.getElementById(modal).classList.add("modal-visible");
}

function hideModal(modal){
    document.getElementById(modal).classList.add(modal);
    document.getElementById(modal).classList.remove("modal-visible");
}

function menu(){
    var displayValue = getComputedStyle(document.getElementById("menu"))["display"];
    var menu = document.getElementById("menu");
    var cross = document.getElementById("container-menu");
    if(displayValue == "none"){
        menu.style.display = "inline-block";
        cross.classList.remove("icon-menu");
        cross.classList.add("icon-cross");
    }else{
        menu.style.display = "none";
        cross.classList.remove("icon-cross");
        cross.classList.add("icon-menu");
    }
}